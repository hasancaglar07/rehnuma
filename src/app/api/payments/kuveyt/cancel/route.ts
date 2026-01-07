import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard } from "@/lib/api-guards";
import { logAudit } from "@/lib/audit";
import { buildCancelRequestData, getKuveytPosConfig, sendKuveytSoapRequest } from "@/lib/payments/kuveytpos";
import { rollbackSubscription } from "@/lib/payments/subscription";
import { getPaymentPlan } from "@/lib/payments/plans";
import { sendPaymentCancelEmail } from "@/lib/payments/notifications";

export const runtime = "nodejs";

const schema = z.object({
  paymentId: z.string().min(1)
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
  if (payment.status !== "succeeded") {
    return NextResponse.json({ error: "Yalnızca başarılı ödemeler iptal edilebilir" }, { status: 400 });
  }
  if (!payment.remoteOrderId || !payment.refRetNum || !payment.transactionId || !payment.authCode) {
    return NextResponse.json({ error: "Banka referans bilgileri eksik" }, { status: 400 });
  }

  const { account, endpoints } = getKuveytPosConfig();
  const requestData = buildCancelRequestData(
    {
      id: payment.orderId,
      remoteOrderId: payment.remoteOrderId,
      refRetNum: payment.refRetNum,
      transactionId: payment.transactionId,
      authCode: payment.authCode,
      amountCents: payment.amount,
      currency: payment.currency
    },
    account
  );

  let response;
  try {
    response = await sendKuveytSoapRequest("SaleReversal", requestData, endpoints);
  } catch (err) {
    console.error("[kuveyt] cancel failed", err);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { cancelResponse: err ? { error: String(err) } : null }
    });
    return NextResponse.json({ error: "İptal isteği başarısız" }, { status: 502 });
  }

  const { responseCode, responseMessage, success } = extractResponseStatus(response);
  const updateData: Record<string, any> = {
    cancelResponse: response
  };
  if (success) {
    updateData.status = "canceled";
  }

  await prisma.payment.update({ where: { id: payment.id }, data: updateData });

  if (success) {
    await rollbackSubscription(payment.userId, payment.plan, payment.quantity);
    const plan = getPaymentPlan(payment.plan as "monthly" | "yearly");
    try {
      await sendPaymentCancelEmail({
        userEmail: payment.user?.email ?? null,
        userName: payment.user?.name ?? null,
        planTitle: plan?.title || payment.plan,
        amountCents: payment.amount,
        orderId: payment.orderId,
        paymentId: payment.id
      });
    } catch (err) {
      console.error("[mail] payment cancel email failed", err);
    }
  }

  await logAudit(auth.user, success ? "payment_cancel_success" : "payment_cancel_failed", "payment", payment.id, {
    responseCode,
    responseMessage
  });

  return NextResponse.json({
    ok: success,
    status: success ? "canceled" : payment.status,
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
