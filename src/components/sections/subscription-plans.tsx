"use client";
import { useTransition } from "react";

export function SubscriptionPlans() {
  const plans = [
    { id: "monthly", title: "Aylık", desc: "Tüm yazılar" },
    { id: "yearly", title: "Yıllık", desc: "Tüm yazılar + eski sayılar" },
    { id: "vip", title: "VIP", desc: "PDF indirilebilir + özel sesli içerik" }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} {...plan} />
      ))}
    </div>
  );
}

function PlanCard({ id, title, desc }: { id: string; title: string; desc: string }) {
  const [pending, startTransition] = useTransition();
  const checkout = () =>
    startTransition(async () => {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    });

  return (
    <div className="border border-border rounded-xl p-5 space-y-2 bg-background/80">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
      <button
        onClick={checkout}
        disabled={pending}
        className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground"
      >
        {pending ? "Yönlendiriliyor..." : "Abone Ol"}
      </button>
    </div>
  );
}
