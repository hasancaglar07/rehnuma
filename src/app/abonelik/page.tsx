import { SubscriptionPlans } from "@/components/sections/subscription-plans";

export default function AbonelikPage() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif">Abonelik Planları</h1>
          <p className="text-muted-foreground">Stripe Checkout ile güvenli ödeme.</p>
        </div>
        <SubscriptionPlans />
      </main>
    </div>
  );
}
