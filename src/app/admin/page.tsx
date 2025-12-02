import { AdminShell } from "@/components/admin/admin-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { prisma } from "@/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const [articles, users, subscriptions] = hasDatabase
    ? await Promise.all([
        prisma.article.count(),
        prisma.user.count(),
        prisma.subscription.count({ where: { status: "active" } })
      ])
    : [0, 0, 0];

  const cards = [
    { title: "Yazılar", value: articles },
    { title: "Kullanıcılar", value: users },
    { title: "Aktif Aboneler", value: subscriptions }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminShell title="Admin Dashboard" description="Özet metrikler ve son olaylar">
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="border border-border rounded-xl p-4 bg-background/80">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
            </div>
          ))}
        </div>
      </AdminShell>
      <Footer />
    </div>
  );
}
