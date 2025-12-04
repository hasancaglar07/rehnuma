"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Plan = { id: "monthly" | "yearly" | "vip"; title: string; desc: string; price: string; perks: string[]; badge?: string };

export function SubscriptionPlans() {
  const plans: Plan[] = [
    { id: "monthly", title: "Aylık", desc: "Tüm yazılar, sesli içerikler", price: "₺79/ay", perks: ["Tüm yazılara erişim", "Sesli içerikler", "Okuma ilerlemesi"] },
    { id: "yearly", title: "Yıllık", desc: "Arşiv ve tüm yazılar", price: "₺790/yıl", perks: ["Tüm yazılar", "Eski sayılar", "Kaydetme ve ilerleme"], badge: "Tasarruf" },
    { id: "vip", title: "VIP", desc: "PDF indirilebilir, özel içerik", price: "₺129/ay", perks: ["Flipbook + PDF indirme", "VIP sesli içerik", "Öncelikli destek"], badge: "VIP" }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} {...plan} />
      ))}
    </div>
  );
}

function PlanCard({ id, title, desc, price, perks, badge }: Plan) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const checkout = () =>
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: id })
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
      <Button onClick={checkout} disabled={pending} className="mt-2 w-full">
        {pending ? "Yönlendiriliyor..." : "Abone Ol"}
      </Button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
