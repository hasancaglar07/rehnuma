import Link from "next/link";
import { prisma } from "@/db/prisma";
import { PAYMENT_PLANS, formatTryAmount } from "@/lib/payments/plans";

type Props = { searchParams: Promise<{ paymentId?: string; result?: string }> };

export default async function PaymentResultPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const paymentId = resolved.paymentId;
  const payment = paymentId
    ? await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { user: { select: { email: true } } }
      })
    : null;

  const plan = payment?.plan ? PAYMENT_PLANS[payment.plan as keyof typeof PAYMENT_PLANS] : null;
  const status = payment?.status === "succeeded" || resolved.result === "success" ? "success" : "failed";

  return (
    <div className="min-h-screen">
      <main className="container py-12 space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Ödeme sonucu</p>
          <h1 className="text-3xl font-serif">{status === "success" ? "Ödeme başarılı" : "Ödeme tamamlanamadı"}</h1>
          <p className="text-muted-foreground">
            {status === "success"
              ? "Aboneliğiniz aktif edildi. Profil sayfanızdan abonelik durumunu görebilirsiniz."
              : "Banka doğrulaması tamamlanamadı veya ödeme reddedildi."}
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-background/80 p-5">
          <p className="text-sm font-semibold">İşlem özeti</p>
          {payment ? (
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>Ödeme no: {payment.orderId}</p>
              <p>Plan: {plan?.title || payment.plan}</p>
              <p>Tutar: {formatTryAmount(payment.amount)}</p>
              <p>Durum: {payment.status}</p>
              {payment.user?.email && <p>E-posta: {payment.user.email}</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ödeme kaydı bulunamadı. Lütfen destek ile iletişime geçin.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/profil" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm">
            Profili görüntüle
          </Link>
          <Link href="/abonelik" className="px-4 py-2 rounded-full border border-border text-sm">
            Planlara geri dön
          </Link>
          <Link href="/iletisim" className="px-4 py-2 rounded-full border border-border text-sm">
            Destek iste
          </Link>
        </div>
      </main>
    </div>
  );
}
