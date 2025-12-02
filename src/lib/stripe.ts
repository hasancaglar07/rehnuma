import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20"
});

export function getPriceId(plan: string) {
  const mapping: Record<string, string> = {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly_placeholder",
    yearly: process.env.STRIPE_YEARLY_PRICE_ID || "price_yearly_placeholder",
    vip: process.env.STRIPE_VIP_PRICE_ID || "price_vip_placeholder"
  };
  return mapping[plan] ?? mapping.monthly;
}
