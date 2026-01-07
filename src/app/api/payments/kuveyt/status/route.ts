import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard } from "@/lib/api-guards";
import { logAudit } from "@/lib/audit";
import { buildStatusRequestData, getKuveytPosConfig, sendKuveytSoapRequest } from "@/lib/payments/kuveytpos";
import { rollbackSubscription } from "@/lib/payments/subscription";

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

  const payment = await prisma.payment.findUnique({ where: { id: payload.paymentId } });
  if (!payment) return NextResponse.json({ error: "Ödeme bulunamadı" }, { status: 404 });

  const { account, endpoints } = getKuveytPosConfig();
  const requestData = buildStatusRequestData(
    {
      id: payment.orderId,
      remoteOrderId: payment.remoteOrderId,
      currency: payment.currency
    },
    account
  );

  let response;
  try {
    response = await sendKuveytSoapRequest("GetMerchantOrderDetail", requestData, endpoints);
  } catch (err) {
    console.error("[kuveyt] status query failed", err);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { statusResponse: err ? { error: String(err) } : null }
    });
    return NextResponse.json({ error: "Durum sorgulama başarısız" }, { status: 502 });
  }

  const { mappedStatus, responseCode, responseMessage, refundedAmount } = mapStatusResponse(response, payment.amount);

  const updateData: Record<string, any> = {
    statusResponse: response
  };
  if (mappedStatus) {
    updateData.status = mappedStatus;
  }
  if (refundedAmount !== null) {
    updateData.refundedAmount = refundedAmount;
  }

  await prisma.payment.update({ where: { id: payment.id }, data: updateData });

  if (mappedStatus && ["canceled", "refunded"].includes(mappedStatus) && payment.status !== mappedStatus) {
    await rollbackSubscription(payment.userId, payment.plan, payment.quantity);
  }

  await logAudit(auth.user, "payment_status_sync", "payment", payment.id, {
    responseCode,
    responseMessage,
    status: mappedStatus
  });

  return NextResponse.json({
    ok: true,
    status: mappedStatus ?? payment.status,
    responseCode,
    responseMessage
  });
}

function mapStatusResponse(response: any, paymentAmount: number) {
  const value = response?.Value ?? {};
  const orderContract = value.OrderContract ?? value;
  const responseCode = orderContract?.ResponseCode ?? response?.ResponseCode ?? null;
  const responseMessage = orderContract?.ResponseMessage ?? response?.ResponseMessage ?? null;
  const lastStatus = Number(orderContract?.LastOrderStatus ?? 0);

  let mappedStatus: string | null = null;
  let refundedAmount: number | null = null;
  if (lastStatus === 1) mappedStatus = "succeeded";
  if (lastStatus === 4) {
    mappedStatus = "refunded";
    refundedAmount = paymentAmount;
  }
  if (lastStatus === 5) mappedStatus = "partially_refunded";
  if (lastStatus === 6) mappedStatus = "canceled";

  return { mappedStatus, responseCode, responseMessage, refundedAmount };
}
