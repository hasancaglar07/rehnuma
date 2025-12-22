import Link from "next/link";
import { ArticleCard } from "@/components/articles/article-card";

type ArticleCardProps = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverUrl?: string;
};

export function FeaturedGrid({ items }: { items: ArticleCardProps[] }) {
  return (
    <section className="container py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[1.65rem] md:text-[1.85rem] font-serif font-semibold tracking-[-0.01em] text-foreground">
          Öne Çıkan Yazılar
        </h2>
        <Link href="/one-cikan" className="hidden text-sm text-primary md:inline">
          Tümünü gör
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <ArticleCard
            key={item.slug}
            title={item.title}
            slug={item.slug}
            excerpt={item.excerpt}
            coverUrl={item.coverUrl}
            category={item.category}
          />
        ))}
      </div>
    </section>
  );
}
