import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/db/prisma";
import { ArticleCard } from "@/components/articles/article-card";
import { toExcerpt } from "@/utils/excerpt";
import { getBaseUrl } from "@/lib/url";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await prisma.authorProfile.findUnique({ where: { slug } });
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/yazarlar/${slug}`;
  return {
    title: author ? `${author.name} | Rehnüma` : "Yazar | Rehnüma",
    description: author?.bio || "Rehnüma yazarı",
    alternates: { canonical }
  };
}

export default async function YazarDetayPage({ params }: Props) {
  const { slug } = await params;
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  const author = hasDatabase
    ? await prisma.authorProfile.findUnique({
        where: { slug },
        include: {
          user: { select: { role: true } },
          articles: {
            where: { status: "published" },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              title: true,
              slug: true,
              content: true,
              coverUrl: true,
              category: { select: { name: true } }
            }
          }
        }
      })
    : null;

  if (!author) {
    return (
      <div className="min-h-screen">
        <main className="container py-12">
          <p className="text-muted-foreground">Yazar bulunamadı.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container space-y-8 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Yazar</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">{author.name}</h1>
          {author.bio && <p className="text-lg text-muted-foreground leading-relaxed">{author.bio}</p>}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {author.website && (
              <Link href={author.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                Web Sitesi
              </Link>
            )}
            {author.instagram && (
              <Link href={author.instagram} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                Instagram
              </Link>
            )}
            {author.twitter && (
              <Link href={author.twitter} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                Twitter
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-gradient-to-b from-white via-white to-primary/5 p-4 sm:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif">Yazıları</h2>
            <span className="text-sm text-muted-foreground">{author.articles.length} içerik</span>
          </div>
          {author.articles.length === 0 && (
            <p className="text-muted-foreground">Bu yazarın henüz yayınlanmış yazısı yok.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {author.articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                slug={article.slug}
                excerpt={toExcerpt(article.content, 140)}
                coverUrl={article.coverUrl ?? undefined}
                category={article.category?.name ?? undefined}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
