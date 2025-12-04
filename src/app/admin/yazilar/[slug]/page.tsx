import { AdminShell } from "@/components/admin/admin-shell";
import { NewArticleForm } from "@/components/admin/new-article-form";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { prisma } from "@/db/prisma";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export default async function AdminEditArticlePage({ params }: Props) {
  const { slug } = await params;
  await requireAdmin(`/admin/yazilar/${slug}`);
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      title: true,
      slug: true,
      content: true,
      category: { select: { slug: true } },
      coverUrl: true,
      audioUrl: true,
      status: true
    }
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminShell title="Yazıyı Düzenle" description="Başlık, içerik, medya ve durum güncelle">
        <NewArticleForm
          mode="edit"
          initialData={{
            title: article.title,
            slug: article.slug,
            content: article.content,
            categorySlug: article.category.slug,
            coverUrl: article.coverUrl || "",
            audioUrl: article.audioUrl || "",
            status: (article.status as "draft" | "published") ?? "draft"
          }}
        />
      </AdminShell>
      <Footer />
    </div>
  );
}
