import { NextResponse } from "next/server";
import { stripe, getPriceId } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit("subscription-checkout");
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { plan = "monthly" } = await req.json();
  const cookies = req.headers.get("cookie") || "";
  const userId = cookies.match(/userId=([^;]+)/)?.[1];
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const priceId = getPriceId(plan);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    metadata: { plan },
    success_url: `${process.env.NEXT_PUBLIC_URL}/profil`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/abonelik`
  });

  return NextResponse.json({ url: session.url });
}
