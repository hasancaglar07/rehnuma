import { ArticleCard } from "@/components/articles/article-card";

type RecommendationItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverUrl?: string;
  readingMinutes?: number;
};

type Props = {
  title: string;
  description?: string;
  items: RecommendationItem[];
};

export function RecommendationsSection({ title, description, items }: Props) {
  return (
    <section className="container py-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h2 className="text-[1.65rem] md:text-[1.85rem] font-serif font-semibold tracking-[-0.01em] text-foreground">
            {title}
          </h2>
          {description ? <p className="text-sm text-muted-foreground max-w-2xl">{description}</p> : null}
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <ArticleCard
            key={item.id}
            title={item.title}
            slug={item.slug}
            excerpt={item.excerpt}
            coverUrl={item.coverUrl}
            category={item.category}
            badge="Tavsiye"
            meta={item.readingMinutes ? { readingMinutes: item.readingMinutes } : undefined}
          />
        ))}
      </div>
    </section>
  );
}
