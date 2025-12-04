import { requireUser } from "@/lib/auth";
import { prisma } from "@/db/prisma";
import { LogoutButton } from "@/components/shared/logout-button";
import Link from "next/link";

export default async function ProfilePage() {
  const userSession = await requireUser("/profil");

  const user = await prisma.user.findUnique({
    where: { id: userSession.id },
    select: { name: true, email: true, subscription: true }
  });
  const subscription = user?.subscription;
  const isExpired = subscription?.expiresAt && subscription.expiresAt < new Date();
  const subscriptionStatus = isExpired ? "expired" : subscription?.status ?? "inactive";
  const subscriptionPlan = isExpired ? "" : subscription?.plan ?? "";

  return (
    <div className="min-h-screen">
      <main className="container py-12 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-border rounded-xl p-4 bg-background/80">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Profil</p>
            <h1 className="text-3xl font-serif mt-1">{user?.name || "Okur"}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/abonelik" className="nav-cta px-4 py-2">
                Aboneliği Yönet
              </Link>
              <LogoutButton redirectTo="/" />
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-background/80 space-y-2">
            <p className="text-sm text-muted-foreground">Abonelik</p>
            <p className="text-lg font-semibold">
              {subscriptionPlan ? subscriptionPlan.toUpperCase() : "Plan yok"} · {subscriptionStatus}
            </p>
            {subscription?.expiresAt && (
              <p className="text-sm text-muted-foreground">
                Sona erme: {new Date(subscription.expiresAt).toLocaleDateString("tr-TR")}
              </p>
            )}
            {!subscription && <p className="text-sm text-muted-foreground">Henüz aktif abonelik bulunmuyor.</p>}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/profil/kaydedilenler" className="border border-border rounded-xl p-4 hover:-translate-y-1 transition">
            Kaydedilenler
          </Link>
          <Link href="/profil/okuma-gecmisi" className="border border-border rounded-xl p-4 hover:-translate-y-1 transition">
            Okuma Geçmişi
          </Link>
          <Link href="/abonelik" className="border border-border rounded-xl p-4 hover:-translate-y-1 transition">
            Planları Yönet
          </Link>
        </div>
      </main>
    </div>
  );
}
