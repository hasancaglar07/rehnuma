"use client";

import { useState } from "react";
import { formatTryAmount } from "@/lib/payments/plans";

type Props = {
  paymentId: string;
  amountCents: number;
  refundedAmount: number | null;
  status: string;
};

export function PaymentAdminActions({ paymentId, amountCents, refundedAmount, status }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"status" | "cancel" | "refund" | null>(null);
  const [refundAmount, setRefundAmount] = useState("");

  const canCancel = status === "succeeded";
  const canRefund = status === "succeeded" || status === "partially_refunded";

  async function callAction(action: "status" | "cancel" | "refund", body: Record<string, unknown>) {
    setError(null);
    setMessage(null);
    setLoading(action);
    try {
      const res = await fetch(`/api/payments/kuveyt/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "İşlem başarısız");
      }
      setMessage(data?.responseMessage || "İşlem tamamlandı.");
      if (data?.ok) {
        setTimeout(() => window.location.reload(), 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(null);
    }
  }

  function parseRefundAmount() {
    if (!refundAmount) return null;
    const normalized = refundAmount.replace(",", ".");
    const value = Number(normalized);
    if (!Number.isFinite(value) || value <= 0) return null;
    return Math.round(value * 100);
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-background/80 space-y-3">
      <p className="font-semibold">Ödeme Aksiyonları</p>
      <div className="grid gap-2 text-sm text-muted-foreground">
        <p>Toplam Tutar: {formatTryAmount(amountCents)}</p>
        {refundedAmount ? <p>İade Edilen: {formatTryAmount(refundedAmount)}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-3 py-2 rounded-full border border-border text-sm"
          onClick={() => callAction("status", { paymentId })}
          disabled={loading !== null}
        >
          {loading === "status" ? "Sorgulanıyor..." : "Durum Sorgula"}
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-full border border-border text-sm"
          onClick={() => {
            if (!confirm("Ödemeyi iptal etmek istediğinize emin misiniz?")) return;
            callAction("cancel", { paymentId });
          }}
          disabled={!canCancel || loading !== null}
        >
          {loading === "cancel" ? "İptal ediliyor..." : "İptal Et"}
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-full border border-border text-sm"
          onClick={() => {
            if (!confirm("Ödemeyi iade etmek istediğinize emin misiniz?")) return;
            const amount = parseRefundAmount();
            callAction("refund", { paymentId, amountCents: amount ?? undefined });
          }}
          disabled={!canRefund || loading !== null}
        >
          {loading === "refund" ? "İade ediliyor..." : "İade Et"}
        </button>
      </div>
      <div className="grid gap-2 text-xs text-muted-foreground">
        <label className="grid gap-1">
          İade Tutarı (TRY)
          <input
            value={refundAmount}
            onChange={(event) => setRefundAmount(event.target.value)}
            placeholder={formatTryAmount(amountCents).replace("₺", "").trim()}
            className="px-3 py-2 rounded-lg border border-border bg-background"
            inputMode="decimal"
          />
        </label>
        <p className="text-[11px]">Boş bırakırsanız tam iade yapılır.</p>
      </div>
      {message && <p className="text-xs text-emerald-600">{message}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
