import { AdminShell } from "@/components/admin/admin-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import Link from "next/link";
import { prisma } from "@/db/prisma";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminShell title="Yazı Yönetimi" description="Yazıları düzenle veya yeni oluştur">
        <div className="flex justify-end">
          <Link href="/admin/yazi-yeni" className="px-4 py-2 rounded-full bg-primary text-primary-foreground">
            Yeni Yazı
          </Link>
        </div>
        <div className="grid gap-2">
          {articles.map((article) => (
            <div key={article.id} className="border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{article.title}</p>
                <p className="text-sm text-muted-foreground">{article.slug}</p>
              </div>
              <div className="text-sm flex gap-3">
                <Link href={`/yazi/${article.slug}`} className="text-primary">
                  Görüntüle
                </Link>
              </div>
            </div>
          ))}
          {articles.length === 0 && <p className="text-muted-foreground">Henüz yazı yok.</p>}
        </div>
      </AdminShell>
      <Footer />
    </div>
  );
}
