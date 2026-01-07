import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/db/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin("/admin");
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const [articles, users, subscriptions, topReads, recentEvents] = hasDatabase
    ? await Promise.all([
        prisma.article.count(),
        prisma.user.count(),
        prisma.subscription.count({ where: { status: "active" } }),
        prisma.article.findMany({
          where: { status: "published" },
          take: 5,
          orderBy: { progress: { _count: "desc" } },
          select: { id: true, title: true, slug: true, _count: { select: { progress: true, saved: true } } }
        }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { user: { select: { email: true } } }
        })
      ])
    : [0, 0, 0, [], []];

  const cards = [
    { title: "Yazılar", value: articles },
    { title: "Kullanıcılar", value: users },
    { title: "Aktif Aboneler", value: subscriptions }
  ];

  const modules = [
    { href: "/admin/anasayfa", title: "Anasayfa", desc: "Hero ve tavsiyeler metinleri", cta: "Düzenle" },
    { href: "/admin/kurumsal", title: "Kurumsal", desc: "Hakkımızda, misyon, vizyon, künye", cta: "Düzenle" },
    { href: "/admin/yazilar", title: "Yazılar", desc: "Listele, filtrele, düzenle", cta: "Yönet" },
    { href: "/admin/yazi-yeni", title: "Yeni Yazı", desc: "Başlık, içerik, medya ekle", cta: "Oluştur" },
    { href: "/admin/dergi", title: "Dergi", desc: "PDF & kapak yükle, arşivi yönet", cta: "Yönet" },
    { href: "/admin/kategoriler", title: "Kategoriler", desc: "CRUD ve sıralama", cta: "Düzenle" },
    { href: "/admin/yazarlar", title: "Yazarlar", desc: "Profil ve görünürlük yönetimi", cta: "Yönet" },
    { href: "/admin/kullanicilar", title: "Kullanıcılar", desc: "Ban/rol ve abonelik bilgisi", cta: "Yönet" },
    { href: "/admin/odemeler", title: "Ödemeler", desc: "Ödeme kayıtları ve sözleşmeler", cta: "Görüntüle" }
  ];

  return (
    <div className="min-h-screen">
      <AdminShell
        title="Admin Dashboard"
        description="Özet metrikler ve son olaylar"
        actions={
          <>
            <Link href="/" className="px-3 py-2 rounded-full border border-border text-sm">
              Siteyi gör
            </Link>
            <Link href="/admin/yazi-yeni" className="px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm">
              Yeni yazı
            </Link>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="border border-border rounded-xl p-4 bg-background/80">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="border border-border rounded-xl p-4 bg-background/80">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Son Olaylar</p>
              <span className="text-xs text-muted-foreground">audit</span>
            </div>
            <div className="mt-3 space-y-2">
              {recentEvents.length === 0 && <p className="text-sm text-muted-foreground">Henüz kayıt yok.</p>}
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/60 bg-secondary/30 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium capitalize">{event.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.targetType}
                      {event.targetId ? ` · ${event.targetId}` : ""}
                    </span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{event.user?.email || "sistem"}</p>
                    <p>{new Date(event.createdAt).toLocaleString("tr-TR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-background/80">
            <p className="font-semibold">En Çok Okunanlar</p>
            <div className="mt-3 space-y-2">
              {topReads.length === 0 && <p className="text-sm text-muted-foreground">Veri yok.</p>}
              {topReads.map((article) => (
                <div key={article.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{article.title}</p>
                    <span className="text-xs text-muted-foreground">{article._count.progress} okuma</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, Math.max(10, article._count.progress * 10))}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{article._count.saved} kaydetme</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="border border-border rounded-xl p-4 bg-background/80 hover:-translate-y-1 transition flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{module.title}</p>
                <span className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground">{module.cta}</span>
              </div>
              <p className="text-sm text-muted-foreground">{module.desc}</p>
            </Link>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
