import { prisma } from "@/db/prisma";
import { ArticleCard } from "@/components/articles/article-card";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { toExcerpt } from "@/utils/excerpt";
import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/url";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };
type ArticleListItem = { id: string; title: string; slug: string; content: string };
type CategoryWithArticles =
  | {
      name: string;
      articles: ArticleListItem[];
    }
  | null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/kategori/${slug}`;
  return {
    title: `Kategori: ${slug} | Rehnüma`,
    description: `Rehnüma kategorisi: ${slug}`,
    alternates: { canonical },
    openGraph: {
      title: `Kategori: ${slug} | Rehnüma`,
      description: `Rehnüma kategorisi: ${slug}`,
      url: canonical
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container py-12">
          <p className="text-muted-foreground">Kategori bulunamadı.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const category: CategoryWithArticles = await prisma.category.findUnique({
    where: { slug },
    select: {
      name: true,
      articles: { select: { id: true, title: true, slug: true, content: true } }
    }
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-6">
        <h1 className="text-3xl font-serif">{category?.name ?? "Kategori"}</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category?.articles.map((article: ArticleListItem) => (
            <ArticleCard key={article.id} title={article.title} slug={article.slug} excerpt={toExcerpt(article.content, 140)} />
          )) ?? <p className="text-muted-foreground">Bu kategoride içerik yok.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
