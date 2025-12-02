import { getSession } from "@/lib/auth";
import { prisma } from "@/db/prisma";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container py-12">
          <p className="text-muted-foreground">Giriş yapın veya abone olun.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-serif">Profil</h1>
          <p className="text-muted-foreground">{session.user.email}</p>
        </div>
        <div className="border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Abonelik</p>
          <p className="text-lg font-semibold">{subscription?.status ?? "Aktif değil"}</p>
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
      <Footer />
    </div>
  );
}
