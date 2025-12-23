import { prisma } from "@/db/prisma";
import { ArticleReader } from "@/components/articles/article-reader";
import { ArticleCard } from "@/components/articles/article-card";
import { toExcerpt } from "@/utils/excerpt";
import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/url";
import Link from "next/link";
import { cache } from "react";
import { normalizeEmphasisSpacing } from "@/utils/markdown";

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

const fetchArticle = cache(async (slug: string) => {
  try {
    return await prisma.article.findUnique({
      where: { slug, status: "published" },
      include: { category: { select: { name: true, slug: true } }, author: { select: { name: true, slug: true } } }
    });
  } catch (error) {
    console.error("[article] article fetch failed", error);
    return null;
  }
});

async function fetchRelated(articleId: string, categorySlug?: string | null) {
  try {
    const related = await prisma.article.findMany({
      where: {
        id: { not: articleId },
        status: "published",
        ...(categorySlug ? { category: { slug: categorySlug } } : {})
      },
      select: { id: true, title: true, slug: true, content: true, category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 4
    });
    if (related.length === 0 && categorySlug) {
      return prisma.article.findMany({
        where: { id: { not: articleId }, status: "published" },
        select: { id: true, title: true, slug: true, content: true, category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 4
      });
    }
    return related;
  } catch (error) {
    console.error("[article] related fetch failed", error);
    return [];
  }
}

function buildPreview(text: string) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (!blocks.length) return text.slice(0, 900);
  const preview = blocks.slice(0, 3).join("\n\n");
  if (preview.length < 400 && blocks[3]) return `${preview}\n\n${blocks[3].slice(0, 240)}`;
  return preview;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  const baseUrl = getBaseUrl();
  const description = article?.content ? toExcerpt(article.content, 160) : "Rehnüma yazısı";
  const canonical = `${baseUrl}/yazi/${slug}`;
  const ogImage = article?.coverUrl || `${baseUrl}/og-default.png`;

  return {
    title: article ? `${article.title} | Rehnüma` : "Yazı | Rehnüma",
    description,
    alternates: { canonical },
    openGraph: {
      title: article?.title ?? "Rehnüma Yazı",
      description,
      url: canonical,
      images: [{ url: ogImage }],
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: article?.title ?? "Rehnüma Yazı",
      description,
      images: [ogImage]
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    return (
      <div className="min-h-screen">
        <main className="container py-12">
          <p className="text-muted-foreground">Yazı bulunamadı.</p>
        </main>
      </div>
    );
  }

  const wordCount = article.content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 190));
  const previewContent = buildPreview(normalizeEmphasisSpacing(article.content));
  const readerContent = previewContent;
  const publishedDate = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(article.createdAt);
  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}/yazi/${slug}`;
  const loginUrl = `/giris?returnTo=${encodeURIComponent(`/yazi/${slug}`)}`;
  const related = await fetchRelated(article.id, article.category?.slug);

  const authorLd = article.author?.name
    ? { "@type": "Person", name: article.author.name, url: `${baseUrl}/yazarlar/${article.author.slug}` }
    : { "@type": "Organization", name: "Rehnüma" };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.createdAt,
    author: authorLd,
    isAccessibleForFree: false,
    hasPart: { "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: "[data-nosnippet]" },
    articleSection: article.category?.name,
    wordCount,
    timeRequired: `PT${readingMinutes}M`
  };

  return (
    <div className="min-h-screen">
      <main className="container py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {article.category?.name && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary tracking-[0.08em] normal-case">
                  {article.category.name}
                </span>
              )}
              <span className="text-muted-foreground/80">{publishedDate}</span>
              <span className="text-muted-foreground/50" aria-hidden>
                •
              </span>
              <span className="text-muted-foreground/80">{readingMinutes} dk okuma</span>
              <span className="text-muted-foreground/50" aria-hidden>
                •
              </span>
              <span className="text-muted-foreground/80">{wordCount} kelime</span>
              {article.author?.name && (
                <>
                  <span className="text-muted-foreground/50" aria-hidden>
                    •
                  </span>
                  <Link href={`/yazarlar/${article.author.slug}`} className="text-muted-foreground/80 hover:text-primary">
                    {article.author.name}
                  </Link>
                </>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
              {article.title}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{toExcerpt(article.content, 180)}</p>
          </div>
          {article.coverUrl && (
            <div className="overflow-hidden rounded-3xl border border-border bg-secondary/30 shadow-lg">
              <img
                src={article.coverUrl}
                alt={article.title}
                className="h-full w-full max-h-[420px] md:max-h-[520px] object-cover"
                loading="lazy"
              />
            </div>
          )}
          <ArticleReader
            article={{
              slug: article.slug,
              title: article.title,
              content: readerContent,
              contentIsPreview: true,
              audioUrl: null,
              shareUrl,
              readingMinutes,
              wordCount
            }}
            isSubscriber={false}
            loginUrl={loginUrl}
            subscribeUrl="/abonelik"
          />
          {related.length > 0 && (
            <section className="space-y-3 pt-6">
              <h2 className="text-2xl font-serif">İlgili Yazılar</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((item) => (
                  <ArticleCard
                    key={item.id}
                    title={item.title}
                    slug={item.slug}
                    excerpt={toExcerpt(item.content, 120)}
                    category={item.category?.name ?? undefined}
                  />
                ))}
              </div>
            </section>
          )}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </div>
      </main>
    </div>
  );
}
