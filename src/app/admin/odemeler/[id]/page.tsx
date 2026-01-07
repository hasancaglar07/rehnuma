import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { PAYMENT_PLANS, formatTryAmount } from "@/lib/payments/plans";
import { PAYMENT_CONSENTS } from "@/lib/payments/consents";
import { PaymentAdminActions } from "@/components/admin/payment-actions";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function AdminPaymentDetailPage({ params }: Props) {
  await requireAdmin("/admin/odemeler");
  const resolved = await params;
  const payment = await prisma.payment.findUnique({
    where: { id: resolved.id },
    include: { user: { select: { email: true, name: true } }, consents: true }
  });

  if (!payment) notFound();

  const plan = PAYMENT_PLANS[payment.plan as keyof typeof PAYMENT_PLANS];
  const billing = (payment.billing as Record<string, string> | null) || null;
  const consentMap = Object.fromEntries(PAYMENT_CONSENTS.map((consent) => [consent.type, consent]));

  return (
    <div className="min-h-screen">
      <AdminShell
        title="Ödeme Detayı"
        description="Ödeme, kart ve sözleşme onayı bilgileri"
        actions={
          <Link href="/admin/odemeler" className="px-3 py-2 rounded-full border border-border text-sm">
            Tüm ödemeler
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="border border-border rounded-xl p-4 bg-background/80 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Ödeme Özeti</p>
              <span className="text-xs text-muted-foreground">{payment.status}</span>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>Plan: {plan?.title || payment.plan}</p>
              <p>Tutar: {formatTryAmount(payment.amount)}</p>
              {payment.refundedAmount ? <p>İade Edilen: {formatTryAmount(payment.refundedAmount)}</p> : null}
              <p>Adet: {payment.quantity}</p>
              <p>Sağlayıcı: {payment.provider}</p>
              <p>Model: {payment.paymentModel}</p>
              <p>Sipariş No: {payment.orderId}</p>
              <p>Uzak Sipariş No: {payment.remoteOrderId || "-"}</p>
              <p>RRN: {payment.refRetNum || "-"}</p>
              <p>Stan: {payment.transactionId || "-"}</p>
              <p>AuthCode: {payment.authCode || "-"}</p>
              <p>Kart: {payment.cardMasked || "-"}</p>
              <p>Taksit: {payment.installmentCount ?? "-"}</p>
              <p>Yanıt Kodu: {payment.responseCode || "-"}</p>
              <p>Yanıt Mesajı: {payment.responseMessage || "-"}</p>
              <p>Oluşturma: {new Date(payment.createdAt).toLocaleString("tr-TR")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-border rounded-xl p-4 bg-background/80 space-y-3">
              <p className="font-semibold">Kullanıcı</p>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>{payment.user?.name || "Okur"}</p>
                <p>{payment.user?.email || "-"}</p>
                <p>IP: {payment.ipAddress || "-"}</p>
              </div>
            </div>
            <PaymentAdminActions
              paymentId={payment.id}
              amountCents={payment.amount}
              refundedAmount={payment.refundedAmount}
              status={payment.status}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="border border-border rounded-xl p-4 bg-background/80 space-y-3">
            <p className="font-semibold">Fatura Bilgileri</p>
            {billing ? (
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>Ad Soyad: {billing.name || "-"}</p>
                <p>E-posta: {billing.email || "-"}</p>
                <p>Telefon: {billing.phone || "-"}</p>
                <p>Adres: {billing.addressLine || "-"}</p>
                <p>İl: {billing.city || "-"}</p>
                <p>İl kodu: {billing.state || "-"}</p>
                <p>Posta kodu: {billing.postalCode || "-"}</p>
                <p>Ülke: {billing.countryCode || "-"}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Bilgi yok.</p>
            )}
          </div>

          <div className="border border-border rounded-xl p-4 bg-background/80 space-y-3">
            <p className="font-semibold">Sözleşme Onayları</p>
            {payment.consents.length === 0 && <p className="text-sm text-muted-foreground">Kayıt yok.</p>}
            {payment.consents.map((consent) => (
              <div key={consent.id} className="rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground">
                <p>{consentMap[consent.type]?.label || consent.type}</p>
                <p>{consentMap[consent.type]?.url || consent.documentUrl || "-"}</p>
                <p>{new Date(consent.acceptedAt).toLocaleString("tr-TR")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <details className="border border-border rounded-xl p-4 bg-background/80">
            <summary className="cursor-pointer font-semibold">3D Auth Response</summary>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground">
              {payment.authResponse ? JSON.stringify(payment.authResponse, null, 2) : "Yok"}
            </pre>
          </details>
          <details className="border border-border rounded-xl p-4 bg-background/80">
            <summary className="cursor-pointer font-semibold">Payment Response</summary>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground">
              {payment.paymentResponse ? JSON.stringify(payment.paymentResponse, null, 2) : "Yok"}
            </pre>
          </details>
          <details className="border border-border rounded-xl p-4 bg-background/80">
            <summary className="cursor-pointer font-semibold">Status Response</summary>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground">
              {payment.statusResponse ? JSON.stringify(payment.statusResponse, null, 2) : "Yok"}
            </pre>
          </details>
          <details className="border border-border rounded-xl p-4 bg-background/80">
            <summary className="cursor-pointer font-semibold">Refund Response</summary>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground">
              {payment.refundResponse ? JSON.stringify(payment.refundResponse, null, 2) : "Yok"}
            </pre>
          </details>
          <details className="border border-border rounded-xl p-4 bg-background/80">
            <summary className="cursor-pointer font-semibold">Cancel Response</summary>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground">
              {payment.cancelResponse ? JSON.stringify(payment.cancelResponse, null, 2) : "Yok"}
            </pre>
          </details>
        </div>
      </AdminShell>
    </div>
  );
}
