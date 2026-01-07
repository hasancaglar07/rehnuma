import { prisma } from "@/db/prisma";
import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/url";
import { CategoryFeedShell } from "@/components/articles/category-feed-shell";
import { toExcerpt } from "@/utils/excerpt";
import { estimateReadingMinutes } from "@/utils/reading-time";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/kategori/${slug}`;
  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true } });
  const title = category?.name ? `Kategori: ${category.name} | Rehnüma` : `Kategori: ${slug} | Rehnüma`;
  const description = category?.name ? `${category.name} kategorisindeki yazılar` : `Rehnüma kategorisi: ${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) {
    return (
      <div className="min-h-screen">
        <main className="container py-12">
          <p className="text-muted-foreground">Kategori bulunamadı.</p>
        </main>
      </div>
    );
  }

  const pageSize = 9;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      parent: { select: { name: true, slug: true } },
      children: { select: { name: true, slug: true } }
    }
  });

  const articles = await prisma.article.findMany({
    where: {
      status: "published",
      OR: [{ category: { slug } }, { category: { parent: { slug } } }]
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: pageSize + 1,
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      coverUrl: true,
      publishedAt: true,
      createdAt: true,
      isFeatured: true,
      category: { select: { name: true } }
    }
  });

  const hasMore = articles.length > pageSize;
  const initialArticles = articles.slice(0, pageSize).map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: toExcerpt(article.excerpt || article.content, 140),
    coverUrl: article.coverUrl,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    isFeatured: article.isFeatured,
    category: article.category,
    readingMinutes: estimateReadingMinutes(article.content)
  }));

  const taglineMap: Record<string, string> = {
    "rehnuma-dusunce": "Fikir, eleştiri ve çağın ruhuna dair derinlikli okumalar.",
    "kultur-edebiyat": "Dizeler, hikayeler ve kültürel mirasla ruhu besleyen seçkiler.",
    "kadin-ve-saglik": "Sağlık, beslenme ve şefkatli bakım için zarif öneriler.",
    maneviyat: "Kalbi dinginleştiren manevi okumalara seçilmiş yazılar.",
    "aile-ve-cocuk": "Evlilik, ebeveynlik ve aile içi ahenk için rehber içerikler."
  };
  const tagline = taglineMap[slug] ?? "Özenle seçilmiş yazılarla premium bir okuma deneyimi.";

  return (
    <div className="min-h-screen">
      <main className="container py-12 space-y-6">
        <div className="space-y-3">
          <h1 className="relative inline-block text-[2.6rem] md:text-[3rem] font-serif font-semibold leading-[1.08] tracking-[-0.02em] text-foreground after:absolute after:content-[''] after:left-0 after:-bottom-2 after:h-[3px] after:w-16 after:bg-[oklch(var(--primary)/0.28)] after:rounded-full">
            {category?.name ?? "Kategori"}
          </h1>
          <p className="max-w-3xl text-muted-foreground text-base md:text-lg">{tagline}</p>
        </div>

        <CategoryFeedShell
          initialArticles={initialArticles}
          categorySlug={slug}
          pageSize={pageSize}
          hasMore={hasMore}
          initialPage={1}
        />
      </main>
    </div>
  );
}
