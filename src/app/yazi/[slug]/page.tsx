import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ArticleReader } from "@/components/articles/article-reader";
import { toExcerpt } from "@/utils/excerpt";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

async function fetchArticle(slug: string) {
  try {
    return await prisma.article.findUnique({
      where: { slug },
      include: { category: { select: { name: true, slug: true } } }
    });
  } catch (error) {
    console.error("[article] article fetch failed", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://rehnuma.example.com";
  const description = article?.content ? toExcerpt(article.content, 160) : "Rehnüma yazısı";
  const canonical = `${baseUrl}/yazi/${slug}`;
  const ogImage = article?.coverUrl || `${baseUrl}/og?title=${encodeURIComponent(article?.title ?? "Rehnüma")}&type=article`;

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
  const session = await getSession();
  const isSubscriber = session.user?.subscriptionStatus === "active";

  if (!article) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container py-12">
          <p className="text-muted-foreground">Yazı bulunamadı.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const wordCount = article.content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 190));
  const publishedDate = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(article.createdAt);

  let saved: Awaited<ReturnType<typeof prisma.savedArticle.findUnique>> | null = null;
  let readingProgress: Awaited<ReturnType<typeof prisma.readingProgress.findUnique>> | null = null;

  if (session.user) {
    try {
      [saved, readingProgress] = await Promise.all([
        prisma.savedArticle.findUnique({ where: { userId_articleId: { userId: session.user.id, articleId: article.id } } }),
        prisma.readingProgress.findUnique({ where: { userId_articleId: { userId: session.user.id, articleId: article.id } } })
      ]);
    } catch (error) {
      console.error("[article] user state fetch failed", error);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.createdAt,
    author: { "@type": "Organization", name: "Rehnüma" },
    isAccessibleForFree: false,
    hasPart: { "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: "[data-nosnippet]" },
    articleSection: article.category?.name,
    wordCount,
    timeRequired: `PT${readingMinutes}M`
  };

  return (
    <div className="min-h-screen">
      <Navbar />
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
            </div>
            <h1 className="text-4xl font-serif leading-tight tracking-tight md:text-5xl">{article.title}</h1>
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
            article={{ slug: article.slug, title: article.title, content: article.content, audioUrl: article.audioUrl }}
            isSubscriber={!!isSubscriber}
            initialSaved={!!saved}
            initialProgress={readingProgress?.progress ?? 0}
          />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
