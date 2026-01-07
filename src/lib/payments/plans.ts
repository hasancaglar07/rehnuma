export const PAYMENT_PLANS = {
  monthly: {
    id: "monthly",
    title: "Tek Sayı",
    desc: "Bu ayın sayısına tek seferlik erişim",
    priceCents: 22500,
    priceLabel: "225 TRY",
    perks: ["Seçili sayı erişimi", "Dijital okuma", "Güncel sayı"],
    quantityLabel: "Dergi adedi",
    durationDays: 30
  },
  yearly: {
    id: "yearly",
    title: "Abonelik",
    desc: "Yıllık erişim ve arşiv",
    priceCents: 90000,
    priceLabel: "900 TRY",
    perks: ["Tüm yazılar", "Arşiv sayılar", "Kaydetme ve ilerleme"],
    quantityLabel: "Abonelik adedi",
    badge: "Önerilen",
    durationDays: 365
  }
} as const;

export type PaymentPlanId = keyof typeof PAYMENT_PLANS;

export const PAYMENT_PLAN_ORDER: PaymentPlanId[] = ["monthly", "yearly"];

export function getPaymentPlan(id: PaymentPlanId) {
  return PAYMENT_PLANS[id];
}

export function formatTryAmount(amountCents: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountCents / 100);
}
