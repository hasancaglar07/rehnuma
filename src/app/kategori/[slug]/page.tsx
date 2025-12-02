import { prisma } from "@/db/prisma";
import { ArticleCard } from "@/components/articles/article-card";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import type { Metadata } from "next";

export const revalidate = 120;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Kategori: ${params.slug} | Rehnüma`,
    description: `Rehnüma kategorisi: ${params.slug}`
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { articles: true }
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-6">
        <h1 className="text-3xl font-serif">{category?.name ?? "Kategori"}</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category?.articles.map((article) => (
            <ArticleCard key={article.id} title={article.title} slug={article.slug} excerpt={article.content.slice(0, 120)} />
          )) ?? <p className="text-muted-foreground">Bu kategoride içerik yok.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
