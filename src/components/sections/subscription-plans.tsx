"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Plan = {
  id: "monthly" | "yearly";
  title: string;
  desc: string;
  price: string;
  perks: string[];
  quantityLabel: string;
  badge?: string;
};

export function SubscriptionPlans() {
  const plans: Plan[] = [
    {
      id: "monthly",
      title: "Tek Sayı",
      desc: "Bu ayın sayısına tek seferlik erişim",
      price: "225 TRY",
      perks: ["Seçili sayı erişimi", "Dijital okuma", "Güncel sayı"],
      quantityLabel: "Dergi adedi"
    },
    {
      id: "yearly",
      title: "Abonelik",
      desc: "Yıllık erişim ve arşiv",
      price: "900 TRY",
      perks: ["Tüm yazılar", "Arşiv sayılar", "Kaydetme ve ilerleme"],
      quantityLabel: "Abonelik adedi",
      badge: "Önerilen"
    }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <PlanCard key={plan.id} {...plan} />
      ))}
    </div>
  );
}

function PlanCard({ id, title, desc, price, perks, badge, quantityLabel }: Plan) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const checkout = () =>
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: id, quantity })
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/giris?returnTo=${encodeURIComponent("/abonelik")}`);
        return;
      }
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Ödeme başlatılamadı");
      }
    });

  return (
    <div className="border border-border rounded-xl p-5 space-y-3 bg-background/80 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        {badge && <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">{badge}</span>}
      </div>
      <p className="text-2xl font-serif">{price}</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {perks.map((perk) => (
          <li key={perk}>• {perk}</li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="text-muted-foreground">{quantityLabel}</label>
        <input
          type="number"
          min={1}
          max={12}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
          className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm"
        />
      </div>
      <Button onClick={checkout} disabled={pending} className="mt-2 w-full">
        {pending ? "Yönlendiriliyor..." : "Abone Ol"}
      </Button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
