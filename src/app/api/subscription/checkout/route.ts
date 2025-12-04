import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { stripe, getPriceId } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuthGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";

const schema = z.object({
  plan: z.enum(["monthly", "yearly", "vip"]).default("monthly")
});

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("subscription-checkout", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAuthGuard(req);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.NEXT_PUBLIC_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_URL eksik" }, { status: 500 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const priceId = getPriceId(parsed.data.plan);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: auth.user.id,
    metadata: { plan: parsed.data.plan, userId: auth.user.id },
    subscription_data: { metadata: { userId: auth.user.id, plan: parsed.data.plan } },
    success_url: `${process.env.NEXT_PUBLIC_URL}/profil`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/abonelik`
  });

  return NextResponse.json({ url: session.url });
}
