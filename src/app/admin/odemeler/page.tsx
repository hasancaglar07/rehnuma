import Link from "next/link";
import { prisma } from "@/db/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { PAYMENT_PLANS, formatTryAmount } from "@/lib/payments/plans";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdmin("/admin/odemeler");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } } }
  });

  return (
    <div className="min-h-screen">
      <AdminShell
        title="Ödemeler"
        description="Kuveyt Türk ödeme kayıtları ve sözleşme onayları"
        actions={
          <Link href="/abonelik" className="px-3 py-2 rounded-full border border-border text-sm">
            Abonelik sayfası
          </Link>
        }
      >
        <div className="grid gap-3">
          {payments.length === 0 && <p className="text-sm text-muted-foreground">Henüz ödeme yok.</p>}
          {payments.map((payment) => {
            const plan = PAYMENT_PLANS[payment.plan as keyof typeof PAYMENT_PLANS];
            return (
              <Link
                key={payment.id}
                href={`/admin/odemeler/${payment.id}`}
                className="border border-border rounded-xl p-4 bg-background/80 hover:-translate-y-0.5 transition"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {plan?.title || payment.plan} · {formatTryAmount(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.user?.email || "kullanıcı"} · {payment.status} · {payment.provider}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleString("tr-TR")}</p>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Sipariş: {payment.orderId} · RRN: {payment.refRetNum || "-"}
                </div>
              </Link>
            );
          })}
        </div>
      </AdminShell>
    </div>
  );
}
