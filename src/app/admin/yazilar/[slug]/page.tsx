import { AdminShell } from "@/components/admin/admin-shell";
import { NewArticleForm } from "@/components/admin/new-article-form";
import { prisma } from "@/db/prisma";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export default async function AdminEditArticlePage({ params }: Props) {
  const { slug } = await params;
  const user = await requireRole(["admin", "editor", "author"], `/admin/yazilar/${slug}`);
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      title: true,
      slug: true,
      content: true,
      authorId: true,
      category: { select: { slug: true } },
      coverUrl: true,
      audioUrl: true,
      status: true,
      publishedAt: true,
      isPaywalled: true,
      isFeatured: true,
      isRecommended: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true
    }
  });

  if (!article) {
    notFound();
  }
  if (user.role === "author") {
    if (article.authorId && article.authorId !== user.id) {
      redirect("/admin/yazilar");
    }
    if (article.status === "published") {
      redirect("/admin/yazilar");
    }
  }
  const allowPublish = user.role !== "author";
  const initialAuthorProfile =
    article.authorId ??
    (
      await prisma.authorProfile.findFirst({
        where: { userId: user.id },
        select: { id: true }
      })
    )?.id;

  return (
    <div className="min-h-screen">
      <AdminShell
        title="Yazıyı Düzenle"
        description="Başlık, içerik, medya ve durum güncelle"
        actions={
          <>
            <Link href="/admin/yazilar" className="px-3 py-2 rounded-full border border-border text-sm">
              Yazılar listesi
            </Link>
            {article.status === "published" && (
              <Link
                href={`/yazi/${article.slug}`}
                target="_blank"
                className="px-3 py-2 rounded-full border border-border text-sm"
              >
                Yazıyı gör
              </Link>
            )}
          </>
        }
      >
        <NewArticleForm
          mode="edit"
          initialData={{
            title: article.title,
            slug: article.slug,
            content: article.content,
            categorySlug: article.category.slug,
            coverUrl: article.coverUrl || "",
            audioUrl: article.audioUrl || "",
            status: (article.status as "draft" | "published") ?? "draft",
            publishAt: article.publishedAt?.toISOString().slice(0, 16) ?? "",
            isPaywalled: article.isPaywalled ?? false,
            isFeatured: article.isFeatured ?? false,
            isRecommended: article.isRecommended ?? false,
            excerpt: article.excerpt || "",
            metaTitle: article.metaTitle || "",
            metaDescription: article.metaDescription || "",
            authorId: initialAuthorProfile
          }}
          allowPublish={allowPublish}
          allowAuthorSelect={user.role !== "author"}
        />
      </AdminShell>
    </div>
  );
}
