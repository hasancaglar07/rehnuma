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
        <h2 className="text-2xl font-serif">Öne Çıkan Yazılar</h2>
        <Link href="/kategori/maneviyat-islami-ilimler" className="text-sm text-primary">
          Tümünü gör
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/yazi/${item.slug}`}
            className="group border border-border rounded-xl p-5 bg-background/80 hover:-translate-y-1 transition shadow-sm"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.category}</span>
            <h3 className="mt-3 text-lg font-semibold group-hover:text-primary">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
