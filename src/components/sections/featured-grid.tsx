import Link from "next/link";

type ArticleCardProps = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
};

export function FeaturedGrid({ items }: { items: ArticleCardProps[] }) {
  return (
    <section className="container py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[1.65rem] md:text-[1.85rem] font-serif font-semibold tracking-[-0.01em] text-foreground">
          Öne Çıkan Yazılar
        </h2>
        <Link href="/kategori/annelik-cocuk" className="hidden text-sm text-primary md:inline">
          Tümünü gör
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/yazi/${item.slug}`}
            className="group border border-border rounded-xl p-5 bg-background/80 hover:-translate-y-1 transition shadow-sm text-foreground"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.category}</span>
            <h3 className="mt-3 font-sans text-[1.22rem] sm:text-[1.32rem] leading-[1.4] font-semibold tracking-[-0.01em] group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/90 leading-relaxed line-clamp-3">{item.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
