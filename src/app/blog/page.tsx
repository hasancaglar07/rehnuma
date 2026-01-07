import type { Metadata } from "next";
import { prisma } from "@/db/prisma";
import { ArticleFeed } from "@/components/articles/article-feed";
import { toExcerpt } from "@/utils/excerpt";
import { estimateReadingMinutes } from "@/utils/reading-time";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | Rehnüma Kadın Dergisi",
  description: "Rehnüma blog akışı: güncel yazılar, rehberler ve ilham verici içerikler."
};

export default async function BlogPage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const pageSize = 9;

  const articles = hasDatabase
    ? await prisma.article.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          coverUrl: true,
          createdAt: true,
          publishedAt: true,
          isFeatured: true,
          category: { select: { name: true } }
        }
      })
    : [
        {
          id: "fallback-1",
          title: "Zarafetle Yaşamak",
          slug: "zarafetle-yasamak",
          content: "Maneviyat ve günlük hayat arasında zarif bir köprü kurmak için pratik ipuçları.",
          coverUrl: null,
          createdAt: new Date(),
          category: { name: "Maneviyat" }
        }
      ];

  const hasMore = articles.length > pageSize;
  const initialArticles = articles.slice(0, pageSize).map((article) => {
    const excerptSource = "excerpt" in article && article.excerpt ? article.excerpt : article.content;
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: toExcerpt(excerptSource, 140),
      coverUrl: article.coverUrl,
      createdAt: article.createdAt,
      publishedAt: "publishedAt" in article ? article.publishedAt : null,
      isFeatured: "isFeatured" in article ? article.isFeatured : null,
      category: article.category,
      readingMinutes: estimateReadingMinutes(article.content)
    };
  });

  return (
    <div className="min-h-screen">
      <main className="container space-y-6 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Blog</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">Güncel yazılar ve ilham veren içerikler</h1>
          <p className="text-lg text-muted-foreground">
            Rehnüma Düşünce’den Aile ve Çocuk’a uzanan taze yazılar, rehberler ve röportajlar burada.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-gradient-to-b from-white via-white to-primary/5 p-4 sm:p-6 lg:p-8">
          <ArticleFeed initialArticles={initialArticles} pageSize={pageSize} initialPage={1} hasMore={hasMore} />
        </div>
      </main>
    </div>
  );
}
