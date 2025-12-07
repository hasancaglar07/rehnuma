import { AdminShell } from "@/components/admin/admin-shell";
import Link from "next/link";
import { prisma } from "@/db/prisma";
import { StatusBadge } from "@/components/admin/status-badge";
import { ArticleRowActions } from "@/components/admin/article-row-actions";
import { requireRole } from "@/lib/auth";
type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  author?: { name: string | null; slug: string | null } | null;
  category?: { name: string; slug: string };
  isPaywalled?: boolean;
  publishedAt?: Date | null;
};
type Props = { searchParams: Promise<{ status?: string; q?: string; category?: string }> };

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({ searchParams }: Props) {
  const resolvedSearch = await searchParams;
  const user = await requireRole(["admin", "editor", "author"], "/admin/yazilar");
  const isAuthor = user.role === "author";
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const statusFilter =
    resolvedSearch.status === "draft" || resolvedSearch.status === "published" ? resolvedSearch.status : undefined;
  const query = resolvedSearch.q?.trim();
  const categoryFilter = resolvedSearch.category?.trim();
  const articles: ArticleListItem[] = hasDatabase
    ? await prisma.article.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          isPaywalled: true,
          publishedAt: true,
          category: { select: { name: true, slug: true } },
          author: { select: { name: true, slug: true } }
        },
        where: {
          ...(isAuthor ? { authorId: user.id } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(categoryFilter ? { category: { slug: categoryFilter } } : {}),
          ...(query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { slug: { contains: query, mode: "insensitive" } }
                ]
              }
            : {})
        },
        orderBy: { updatedAt: "desc" }
      })
    : [];
  const categories = hasDatabase ? await prisma.category.findMany({ orderBy: { order: "asc" } }) : [];

  return (
    <div className="min-h-screen">
      <AdminShell title="Yazı Yönetimi" description="Yazıları düzenle veya yeni oluştur">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <form className="flex flex-wrap items-center gap-2" method="get">
            <input
              name="q"
              defaultValue={query}
              placeholder="Başlık veya slug ara"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <select
              name="status"
              defaultValue={statusFilter || ""}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Tümü</option>
              <option value="published">Yayınlanan</option>
              <option value="draft">Taslak</option>
            </select>
            <select
              name="category"
              defaultValue={categoryFilter || ""}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Kategori</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button type="submit" className="px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm">
              Filtrele
            </button>
          </form>
          <Link href="/admin/yazi-yeni" className="px-4 py-2 rounded-full bg-primary text-primary-foreground">
            Yeni Yazı
          </Link>
        </div>
        <div className="grid gap-2">
          {articles.map((article: ArticleListItem) => (
            <div
              key={article.id}
              className="border border-border rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{article.title}</p>
                  <StatusBadge status={article.status} />
                </div>
                <p className="text-sm text-muted-foreground">{article.slug}</p>
                <p className="text-xs text-muted-foreground">
                  {article.category?.name ? `Kategori: ${article.category.name}` : "Kategori yok"}
                  {" · "}
                  {article.isPaywalled ? "Paywall" : "Açık"}
                  {article.author?.name ? ` · ${article.author.name}` : ""}
                  {article.publishedAt && (
                    <>
                      {" · "}
                      {new Date(article.publishedAt).toLocaleString("tr-TR")}
                    </>
                  )}
                </p>
              </div>
              <div className="text-sm flex flex-col gap-2 items-start md:items-end w-full md:w-auto">
                <div className="flex gap-3 flex-wrap">
                  <Link href={`/yazi/${article.slug}`} className="text-primary">
                    Görüntüle
                  </Link>
                  <Link href={`/admin/yazilar/${article.slug}`} className="text-primary">
                    Düzenle
                  </Link>
                </div>
                <ArticleRowActions
                  slug={article.slug}
                  status={article.status}
                  canPublish={user.role !== "author"}
                  canDelete={user.role !== "author"}
                />
              </div>
            </div>
          ))}
          {articles.length === 0 && <p className="text-muted-foreground">Henüz yazı yok.</p>}
        </div>
      </AdminShell>
    </div>
  );
}
