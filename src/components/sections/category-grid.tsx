import Link from "next/link";

const defaultCategories = [
  { slug: "annelik-cocuk", name: "Annelik" },
  { slug: "aile-evlilik", name: "Aile" },
  { slug: "siir-edebiyat", name: "Edebiyat" },
  { slug: "ev-ve-hayat", name: "Ev & Hayat" },
  { slug: "dijital-dergi", name: "Dergi" },
  { slug: "maneviyat-islami-ilimler", name: "Maneviyat" }
];

export function CategoryGrid({ categories = defaultCategories }: { categories?: { slug: string; name: string }[] }) {
  return (
    <section className="container py-12">
      <h2 className="text-[1.65rem] md:text-[1.85rem] font-serif font-semibold tracking-[-0.01em] text-foreground mb-6">
        Kategoriler
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/kategori/${cat.slug}`}
            className="border border-border rounded-xl p-4 bg-background/70 hover:-translate-y-1 transition shadow-sm text-foreground"
          >
            <h3 className="font-sans text-[1.15rem] leading-[1.35] font-semibold tracking-[-0.01em]">{cat.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Yazıları keşfet</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
