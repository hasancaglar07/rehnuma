import Stripe from "stripe";

// Use a placeholder test key if env var is missing to avoid init errors during build.
const stripeSecret = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeSecret, {});

export function getPriceId(plan: string) {
  const mapping: Record<string, string> = {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly_placeholder",
    yearly: process.env.STRIPE_YEARLY_PRICE_ID || "price_yearly_placeholder",
    vip: process.env.STRIPE_VIP_PRICE_ID || "price_vip_placeholder"
  };
  return mapping[plan] ?? mapping.monthly;
}
