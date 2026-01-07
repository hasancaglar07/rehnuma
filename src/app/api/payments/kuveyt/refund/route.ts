import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard } from "@/lib/api-guards";
import { logAudit } from "@/lib/audit";
import { buildRefundRequestData, getKuveytPosConfig, sendKuveytSoapRequest } from "@/lib/payments/kuveytpos";
import { rollbackSubscription } from "@/lib/payments/subscription";
import { getPaymentPlan } from "@/lib/payments/plans";
import { sendPaymentRefundEmail } from "@/lib/payments/notifications";

export const runtime = "nodejs";

const schema = z.object({
  paymentId: z.string().min(1),
  amountCents: z.number().int().positive().optional()
});

export async function POST(req: Request) {
  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  let payload;
  try {
    payload = schema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: payload.paymentId },
    include: { user: { select: { email: true, name: true } } }
  });
  if (!payment) return NextResponse.json({ error: "Ödeme bulunamadı" }, { status: 404 });

  if (!["succeeded", "partially_refunded"].includes(payment.status)) {
    return NextResponse.json({ error: "Bu ödeme iade edilemez" }, { status: 400 });
  }

  if (!payment.remoteOrderId || !payment.refRetNum || !payment.transactionId || !payment.authCode) {
    return NextResponse.json({ error: "Banka referans bilgileri eksik" }, { status: 400 });
  }

  const existingRefunded = payment.refundedAmount ?? 0;
  const amountCents = payload.amountCents ?? payment.amount;
  if (amountCents <= 0) {
    return NextResponse.json({ error: "İade tutarı geçersiz" }, { status: 400 });
  }
  if (amountCents + existingRefunded > payment.amount) {
    return NextResponse.json({ error: "İade tutarı toplamı ödeme tutarını aşamaz" }, { status: 400 });
  }

  const isPartial = amountCents + existingRefunded < payment.amount;

  const { account, endpoints } = getKuveytPosConfig();
  const requestData = buildRefundRequestData(
    {
      id: payment.orderId,
      remoteOrderId: payment.remoteOrderId,
      refRetNum: payment.refRetNum,
      transactionId: payment.transactionId,
      authCode: payment.authCode,
      amountCents,
      currency: payment.currency,
      isPartial
    },
    account
  );

  let response;
  const action = isPartial ? "PartialDrawback" : "DrawBack";
  try {
    response = await sendKuveytSoapRequest(action, requestData, endpoints);
  } catch (err) {
    console.error("[kuveyt] refund failed", err);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { refundResponse: err ? { error: String(err) } : null }
    });
    return NextResponse.json({ error: "İade isteği başarısız" }, { status: 502 });
  }

  const { responseCode, responseMessage, success } = extractResponseStatus(response);
  const refundedAmount = success ? Math.min(payment.amount, existingRefunded + amountCents) : existingRefunded;
  const status = success
    ? refundedAmount >= payment.amount
      ? "refunded"
      : "partially_refunded"
    : payment.status;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      refundResponse: response,
      refundedAmount,
      status
    }
  });

  if (success && refundedAmount >= payment.amount) {
    await rollbackSubscription(payment.userId, payment.plan, payment.quantity);
  }

  if (success) {
    const plan = getPaymentPlan(payment.plan as "monthly" | "yearly");
    try {
      await sendPaymentRefundEmail({
        userEmail: payment.user?.email ?? null,
        userName: payment.user?.name ?? null,
        planTitle: plan?.title || payment.plan,
        amountCents: payment.amount,
        refundedAmountCents: amountCents,
        isPartial,
        orderId: payment.orderId,
        paymentId: payment.id
      });
    } catch (err) {
      console.error("[mail] payment refund email failed", err);
    }
  }

  await logAudit(auth.user, success ? "payment_refund_success" : "payment_refund_failed", "payment", payment.id, {
    responseCode,
    responseMessage,
    amountCents
  });

  return NextResponse.json({
    ok: success,
    status,
    refundedAmount,
    responseCode,
    responseMessage
  });
}

function extractResponseStatus(response: any) {
  const value = response?.Value ?? response ?? {};
  const result = response?.Results?.Result;
  const resultItem = Array.isArray(result) ? result[0] : result;
  const responseCode = value.ResponseCode ?? resultItem?.ErrorCode ?? null;
  const responseMessage = value.ResponseMessage ?? resultItem?.ErrorMessage ?? null;
  const success = responseCode === "00";
  return { responseCode, responseMessage, success };
}
