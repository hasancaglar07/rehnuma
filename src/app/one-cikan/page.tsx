import type { Metadata } from "next";
import { prisma } from "@/db/prisma";
import { ArticleFeed } from "@/components/articles/article-feed";
import { toExcerpt } from "@/utils/excerpt";
import { estimateReadingMinutes } from "@/utils/reading-time";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "One Cikan Yazilar | Rehnuma Kadin Dergisi",
  description: "Rehnuma editor secimleri: one cikan yazilarin tam listesi."
};

export default async function OneCikanPage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const pageSize = 9;

  const articles = hasDatabase
    ? await prisma.article.findMany({
        where: { status: "published", isFeatured: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
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
          title: "Zarafetle Yasamak",
          slug: "zarafetle-yasamak",
          content: "Maneviyat ve gunluk hayat arasinda zarif bir kopru kurmak icin pratik ipuclari.",
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
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">One Cikan</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">Editorun one cikardigi yazilar</h1>
          <p className="text-lg text-muted-foreground">
            Derginin editoryal secimleriyle ozenle derlenen yazilarin tam listesini kesfedin.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-gradient-to-b from-white via-white to-primary/5 p-4 sm:p-6 lg:p-8">
          <ArticleFeed
            initialArticles={initialArticles}
            pageSize={pageSize}
            initialPage={1}
            hasMore={hasMore}
            activeFilter="featured"
          />
        </div>
      </main>
    </div>
  );
}
