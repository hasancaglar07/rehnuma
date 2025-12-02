import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/db/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id!;
    const plan = (session.metadata?.plan as string) || "monthly";
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        status: "active",
        plan,
        stripeId: session.subscription as string,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      create: {
        userId,
        status: "active",
        plan,
        stripeId: session.subscription as string,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  }

  return NextResponse.json({ received: true });
}
