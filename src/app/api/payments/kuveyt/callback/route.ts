import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getBaseUrl } from "@/lib/url";
import { logAudit } from "@/lib/audit";
import { requestIp } from "@/lib/api-guards";
import { extendSubscription } from "@/lib/payments/subscription";
import { getPaymentPlan } from "@/lib/payments/plans";
import { sendPaymentSuccessEmail } from "@/lib/payments/notifications";
import {
  build3DPaymentRequestData,
  encodeKuveytXml,
  get3DProvisionUrl,
  getKuveytPosConfig,
  mapAuthResponse,
  mapPaymentResponse,
  parseKuveytXml
} from "@/lib/payments/kuveytpos";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const paymentId = url.searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "paymentId gerekli" }, { status: 400 });

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: { select: { email: true, name: true } } }
  });
  if (!payment) return NextResponse.json({ error: "Ödeme bulunamadı" }, { status: 404 });
  if (payment.status === "succeeded") {
    return redirectToResult(paymentId, "success");
  }

  const formData = await req.formData();
  const authPayload = formData.get("AuthenticationResponse");
  if (!authPayload || typeof authPayload !== "string") {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "failed", responseMessage: "3D cevap alınamadı" }
    });
    return redirectToResult(paymentId, "failed");
  }

  let authResponse: any = null;
  try {
    const decoded = decodeURIComponent(authPayload);
    authResponse = parseKuveytXml(decoded);
  } catch (err) {
    console.error("[kuveyt] auth parse failed", err);
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "failed", responseMessage: "3D cevap çözülemedi" }
    });
    return redirectToResult(paymentId, "failed");
  }

  const authSummary = mapAuthResponse(authResponse);
  if (authSummary.responseCode !== "00") {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "failed",
        responseCode: authSummary.responseCode,
        responseMessage: authSummary.responseMessage,
        authResponse
      }
    });
    return redirectToResult(paymentId, "failed");
  }
  if (!authResponse?.MD || !authResponse?.VPosMessage) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "failed", responseMessage: "3D doğrulama eksik" }
    });
    return redirectToResult(paymentId, "failed");
  }
  if (!authMatchesPayment(authResponse, payment)) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "failed", responseMessage: "3D doğrulama uyuşmuyor", authResponse }
    });
    return redirectToResult(paymentId, "failed");
  }

  try {
    const { account, endpoints } = getKuveytPosConfig();
    const order = {
      id: payment.orderId,
      amountCents: payment.amount,
      currency: payment.currency,
      installment: payment.installmentCount ?? 0,
      ip: payment.ipAddress || requestIp(req),
      successUrl: "",
      failUrl: ""
    };
    const paymentRequest = build3DPaymentRequestData(order, account, authResponse);
    const xml = encodeKuveytXml(paymentRequest);
    const response = await fetch(get3DProvisionUrl(endpoints), {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=UTF-8" },
      body: xml
    });
    const xmlResponse = await response.text();
    const paymentResponse = parseKuveytXml(xmlResponse);
    const paymentSummary = mapPaymentResponse(paymentResponse);
    const isSuccess = paymentSummary.responseCode === "00";

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: isSuccess ? "succeeded" : "failed",
        responseCode: paymentSummary.responseCode,
        responseMessage: paymentSummary.responseMessage,
        remoteOrderId: paymentSummary.remoteOrderId,
        transactionId: paymentSummary.transactionId,
        authCode: paymentSummary.authCode,
        refRetNum: paymentSummary.refRetNum,
        batchNum: paymentSummary.batchNum,
        installmentCount: paymentSummary.installmentCount ? Number(paymentSummary.installmentCount) : null,
        cardMasked: paymentSummary.cardMasked,
        authResponse,
        paymentResponse
      }
    });

    if (isSuccess) {
      await extendSubscription(payment.userId, payment.plan, payment.quantity);
      await logAudit(null, "payment_success", "payment", paymentId, {
        plan: payment.plan,
        amount: payment.amount
      });
      const plan = getPaymentPlan(payment.plan as "monthly" | "yearly");
      try {
        await sendPaymentSuccessEmail({
          userEmail: payment.user?.email ?? null,
          userName: payment.user?.name ?? null,
          planTitle: plan?.title || payment.plan,
          amountCents: payment.amount,
          orderId: payment.orderId,
          paymentId
        });
      } catch (err) {
        console.error("[mail] payment success email failed", err);
      }
      return redirectToResult(paymentId, "success");
    }
  } catch (err) {
    console.error("[kuveyt] payment finalize failed", err);
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "failed", responseMessage: "Ödeme tamamlanamadı", authResponse }
    });
  }

  return redirectToResult(paymentId, "failed");
}

function redirectToResult(paymentId: string, result: "success" | "failed") {
  const url = `${getBaseUrl()}/abonelik/sonuc?paymentId=${paymentId}&result=${result}`;
  return NextResponse.redirect(url, 303);
}

function authMatchesPayment(authResponse: any, payment: { orderId: string; amount: number; currency: string }) {
  const message = authResponse?.VPosMessage ?? {};
  const orderId = message.MerchantOrderId ?? authResponse?.MerchantOrderId;
  const amount = String(message.Amount ?? "");
  const currency = String(message.CurrencyCode ?? "");
  const security = String(message.TransactionSecurity ?? "");
  const expectedCurrency = mapCurrencyCode(payment.currency);

  if (!orderId || orderId !== payment.orderId) return false;
  if (amount && amount !== String(payment.amount)) return false;
  if (currency && currency !== expectedCurrency) return false;
  if (security && security !== "3") return false;
  return true;
}

function mapCurrencyCode(code: string) {
  if (code === "TRY") return "0949";
  if (code === "USD") return "0840";
  if (code === "EUR") return "0978";
  return code;
}
