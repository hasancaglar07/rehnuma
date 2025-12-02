import Link from "next/link";

const defaultCategories = [
  { slug: "annelik-cocuk", name: "Annelik & Çocuk" },
  { slug: "maneviyat-islami-ilimler", name: "Maneviyat & İslami İlimler" },
  { slug: "aile-evlilik", name: "Aile & Evlilik" },
  { slug: "ev-ve-hayat", name: "Ev ve Hayat" },
  { slug: "siir-edebiyat", name: "Şiir & Edebiyat" },
  { slug: "sesli-icerikler", name: "Sesli İçerikler" }
];

export function CategoryGrid({ categories = defaultCategories }: { categories?: { slug: string; name: string }[] }) {
  return (
    <section className="container py-12">
      <h2 className="text-2xl font-serif mb-6">Kategoriler</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/kategori/${cat.slug}`}
            className="border border-border rounded-xl p-4 bg-background/70 hover:-translate-y-1 transition shadow-sm"
          >
            <h3 className="font-semibold">{cat.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Yazıları keşfet</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
