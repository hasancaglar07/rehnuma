import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/db/prisma";

export const runtime = "nodejs";

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  yearly: 365,
  vip: 30
};
const ALLOWED_PLANS = ["monthly", "yearly", "vip"];

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe] invalid signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const plan = session.metadata?.plan as string | undefined;
    if (!userId || !plan || !ALLOWED_PLANS.includes(plan)) {
      console.error("[stripe] missing client_reference_id or plan", { metadata: session.metadata });
      return NextResponse.json({ error: "Metadata missing" }, { status: 400 });
    }
    const days = PLAN_DAYS[plan] ?? PLAN_DAYS.monthly;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const stripeId = typeof session.subscription === "string" ? session.subscription : undefined;
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        status: "active",
        plan,
        stripeId,
        expiresAt
      },
      create: {
        userId,
        status: "active",
        plan,
        stripeId,
        expiresAt
      }
    });
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;
    if (userId) {
      await prisma.subscription.updateMany({ where: { userId }, data: { status: "canceled" } });
    }
  }

  return NextResponse.json({ received: true });
}
