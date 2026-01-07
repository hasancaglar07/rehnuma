import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getBaseUrl } from "@/lib/url";
import { requireAuthGuard, requestIp } from "@/lib/api-guards";
import { PAYMENT_CONSENTS } from "@/lib/payments/consents";
import { getPaymentPlan } from "@/lib/payments/plans";
import { buildEnrollmentRequestData, encodeKuveytXml, getKuveytPosConfig, parse3DFormResponse } from "@/lib/payments/kuveytpos";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  quantity: z.coerce.number().int().min(1).max(12).default(1),
  card: z.object({
    holderName: z.string().min(2),
    number: z.string().min(12),
    expMonth: z.string().min(1),
    expYear: z.string().min(2),
    cvv: z.string().min(3)
  }),
  billing: z.object({
    email: z.string().email(),
    phone: z.string().min(7),
    addressLine: z.string().min(4),
    city: z.string().min(2),
    state: z.string().min(1),
    postalCode: z.string().min(3),
    countryCode: z.string().optional()
  }),
  consents: z.record(z.boolean())
});

export async function POST(req: Request) {
  const limiter = await rateLimit("kuveyt-init", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const auth = await requireAuthGuard(req);
  if (auth instanceof NextResponse) return auth;

  let payload;
  try {
    payload = schema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Eksik veya hatalı form" }, { status: 400 });
  }

  const missingConsent = PAYMENT_CONSENTS.find((consent) => !payload.consents?.[consent.type]);
  if (missingConsent) {
    return NextResponse.json({ error: "Sözleşme onayları gerekli" }, { status: 400 });
  }

  const plan = getPaymentPlan(payload.plan);
  const amountCents = plan.priceCents * payload.quantity;
  const baseUrl = getBaseUrl();
  const paymentId = crypto.randomUUID();
  const orderId = `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

  const successUrl = `${baseUrl}/api/payments/kuveyt/callback?paymentId=${paymentId}&result=success`;
  const failUrl = `${baseUrl}/api/payments/kuveyt/callback?paymentId=${paymentId}&result=fail`;

  const ip = requestIp(req);
  const userAgent = req.headers.get("user-agent") || null;

  const billing = {
    name: payload.card.holderName,
    email: payload.billing.email,
    phone: payload.billing.phone,
    addressLine: payload.billing.addressLine,
    city: payload.billing.city,
    state: payload.billing.state,
    postalCode: payload.billing.postalCode,
    countryCode: payload.billing.countryCode || "792"
  };

  try {
    await prisma.payment.create({
      data: {
        id: paymentId,
        userId: auth.user.id,
        plan: payload.plan,
        status: "initiated",
        provider: "kuveytpos",
        paymentModel: "3d-secure",
        amount: amountCents,
        currency: "TRY",
        quantity: payload.quantity,
        orderId,
        ipAddress: ip,
        userAgent,
        billing
      }
    });

    await prisma.paymentConsent.createMany({
      data: PAYMENT_CONSENTS.map((consent) => ({
        paymentId,
        userId: auth.user.id,
        type: consent.type,
        documentUrl: consent.url,
        documentVersion: consent.version,
        ipAddress: ip,
        userAgent
      }))
    });
  } catch (err) {
    console.error("[kuveyt] payment create failed", err);
    return NextResponse.json({ error: "Ödeme kaydı oluşturulamadı" }, { status: 500 });
  }

  try {
    const { account, endpoints } = getKuveytPosConfig();
    const order = {
      id: orderId,
      amountCents,
      currency: "TRY",
      installment: 0,
      ip,
      successUrl,
      failUrl
    };
    const requestData = buildEnrollmentRequestData(order, account, payload.card, billing);
    const xml = encodeKuveytXml(requestData);
    const response = await fetch(endpoints.gateway3d, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=UTF-8" },
      body: xml
    });
    const html = await response.text();
    const form = parse3DFormResponse(html);
    if (!form.gateway || Object.keys(form.inputs).length === 0) {
      throw new Error("3D form verisi alınamadı");
    }
    return NextResponse.json({ gateway: form.gateway, inputs: form.inputs, paymentId });
  } catch (err) {
    console.error("[kuveyt] enrollment failed", err);
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "failed", responseMessage: "3D başlatılamadı" }
    });
    return NextResponse.json({ error: "3D doğrulama başlatılamadı" }, { status: 500 });
  }
}
