import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/auth";
import { ArticleContent } from "@/components/articles/article-content";
import { ArticleAudio } from "@/components/articles/audio-player";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import type { Metadata } from "next";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  return {
    title: article ? `${article.title} | Rehnüma` : "Yazı | Rehnüma",
    description: article?.content.slice(0, 150),
    openGraph: {
      title: article?.title,
      description: article?.content.slice(0, 150),
      url: `${process.env.NEXT_PUBLIC_URL}/yazi/${params.slug}`,
      images: article?.coverUrl ? [{ url: article.coverUrl }] : undefined,
      type: "article"
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.createdAt,
    author: { "@type": "Organization", name: "Rehnüma" }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{article.slug}</p>
          <h1 className="text-4xl font-serif">{article.title}</h1>
        </div>
        <ArticleAudio src={article.audioUrl || undefined} />
        <ArticleContent content={article.content} isSubscriber={!!isSubscriber} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <Footer />
    </div>
  );
}
