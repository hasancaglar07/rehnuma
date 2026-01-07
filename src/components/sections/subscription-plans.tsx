"use client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PAYMENT_CONSENTS } from "@/lib/payments/consents";
import { PAYMENT_PLANS, PAYMENT_PLAN_ORDER, formatTryAmount, type PaymentPlanId } from "@/lib/payments/plans";

export function SubscriptionPlans() {
  const [selectedPlanId, setSelectedPlanId] = useState<PaymentPlanId>("yearly");
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    holderName: "",
    number: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: ""
  });
  const [consents, setConsents] = useState<Record<string, boolean>>(
    Object.fromEntries(PAYMENT_CONSENTS.map((consent) => [consent.type, false]))
  );

  const plan = PAYMENT_PLANS[selectedPlanId];
  const totalLabel = useMemo(() => formatTryAmount(plan.priceCents * quantity), [plan.priceCents, quantity]);

  const router = useRouter();
  const allConsentsChecked = PAYMENT_CONSENTS.every((consent) => consents[consent.type]);
  const canSubmit =
    allConsentsChecked &&
    form.holderName &&
    form.number &&
    form.expMonth &&
    form.expYear &&
    form.cvv &&
    form.email &&
    form.phone &&
    form.addressLine &&
    form.city &&
    form.state &&
    form.postalCode;
  const handleSelect = (planId: PaymentPlanId) => {
    setSelectedPlanId(planId);
    setShowCheckout(true);
    setError(null);
  };

  const handleSubmit = () =>
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/payments/kuveyt/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlanId,
          quantity,
          card: {
            holderName: form.holderName,
            number: form.number,
            expMonth: form.expMonth,
            expYear: form.expYear,
            cvv: form.cvv
          },
          billing: {
            email: form.email,
            phone: form.phone,
            addressLine: form.addressLine,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode
          },
          consents
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push(`/giris?returnTo=${encodeURIComponent("/abonelik")}`);
        return;
      }
      if (res.status === 403) {
        setError("Erişim kısıtlı");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Ödeme başlatılamadı");
        return;
      }
      if (!data.gateway || !data.inputs) {
        setError("Ödeme başlatılamadı");
        return;
      }
      submitToGateway(data.gateway, data.inputs);
    });

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        {PAYMENT_PLAN_ORDER.map((planId) => {
          const item = PAYMENT_PLANS[planId];
          return (
            <div key={item.id} className="border border-border rounded-xl p-5 space-y-3 bg-background/80 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {item.badge && <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">{item.badge}</span>}
              </div>
              <p className="text-2xl font-serif">{item.priceLabel}</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {item.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="text-muted-foreground">{item.quantityLabel}</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={selectedPlanId === item.id ? quantity : 1}
                  onChange={(e) => {
                    if (selectedPlanId !== item.id) setSelectedPlanId(item.id);
                    setQuantity(Math.max(1, Math.min(12, Number(e.target.value) || 1)));
                  }}
                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm"
                />
              </div>
              <Button onClick={() => handleSelect(item.id)} className="mt-2 w-full">
                Ödeme Bilgilerini Gir
              </Button>
            </div>
          );
        })}
      </div>

      {showCheckout && (
        <div className="grid gap-4 rounded-2xl border border-border bg-background/80 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Seçili plan</p>
              <p className="text-lg font-semibold">
                {plan.title} · {totalLabel}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">3D Secure ile Kuveyt Türk üzerinden ödeme alınır.</p>
          </div>

          <div className="grid gap-3">
            <p className="text-sm font-semibold">Kart Bilgileri</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.holderName}
                onChange={(e) => setForm((prev) => ({ ...prev, holderName: e.target.value }))}
                placeholder="Kart üzerindeki ad soyad"
                autoComplete="cc-name"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={form.number}
                onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="Kart numarası"
                inputMode="numeric"
                autoComplete="cc-number"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={form.expMonth}
                onChange={(e) => setForm((prev) => ({ ...prev, expMonth: e.target.value }))}
                placeholder="MM"
                inputMode="numeric"
                autoComplete="cc-exp-month"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={form.expYear}
                onChange={(e) => setForm((prev) => ({ ...prev, expYear: e.target.value }))}
                placeholder="YY"
                inputMode="numeric"
                autoComplete="cc-exp-year"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={form.cvv}
                onChange={(e) => setForm((prev) => ({ ...prev, cvv: e.target.value }))}
                placeholder="CVV"
                inputMode="numeric"
                autoComplete="cc-csc"
                type="password"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Kart bilgileri kaydedilmez, ödeme Kuveyt Türk 3D Secure ile güvenli şekilde tamamlanır.
            </p>
          </div>

          <div className="grid gap-3">
            <p className="text-sm font-semibold">Fatura & İletişim</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="E-posta"
                autoComplete="email"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Telefon"
                inputMode="tel"
                autoComplete="tel"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={form.addressLine}
                onChange={(e) => setForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                placeholder="Adres"
                autoComplete="address-line1"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="İl"
                autoComplete="address-level1"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="İl kodu (01-81)"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={form.postalCode}
                onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                placeholder="Posta kodu"
                inputMode="numeric"
                autoComplete="postal-code"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            {PAYMENT_CONSENTS.map((consent) => (
              <label key={consent.type} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(consents[consent.type])}
                  onChange={(e) => setConsents((prev) => ({ ...prev, [consent.type]: e.target.checked }))}
                  className="mt-1"
                />
                <span className="text-muted-foreground">
                  <Link href={consent.url} className="text-primary underline" target="_blank" rel="noreferrer">
                    {consent.label}
                  </Link>
                </span>
              </label>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={pending || !canSubmit} className="w-full">
            {pending ? "Bankaya yönlendiriliyor..." : "Ödemeyi Tamamla"}
          </Button>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

function submitToGateway(action: string, inputs: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  Object.entries(inputs).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
