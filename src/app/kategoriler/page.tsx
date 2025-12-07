import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/db/prisma";

type CategoryNode = { name: string; slug: string; children: { name: string; slug: string }[] };

const fallbackCategories: CategoryNode[] = [
  {
    name: "Rehnüma Düşünce",
    slug: "rehnuma-dusunce",
    children: [
      { name: "Akis", slug: "akis" },
      { name: "Ruh ve Mana", slug: "ruh-ve-mana" },
      { name: "Zemin", slug: "zemin" },
      { name: "Akışkan Modernite", slug: "akiskan-modernite" }
    ]
  },
  {
    name: "Kültür Edebiyat",
    slug: "kultur-edebiyat",
    children: [
      { name: "Edebi Alem", slug: "edebi-alem" },
      { name: "İstikbal Köklerdedir", slug: "istikbal-koklerdedir" },
      { name: "İslami Sanat", slug: "islami-sanat" },
      { name: "Direnen Coğrafyalar", slug: "direnen-cografyalar" },
      { name: "Şehrengiz", slug: "sehrengiz" }
    ]
  },
  {
    name: "Kadın ve Sağlık",
    slug: "kadin-ve-saglik",
    children: [
      { name: "Sıhhat Bul", slug: "sihhat-bul" },
      { name: "Fonksiyonel Tıp", slug: "fonksiyonel-tip" },
      { name: "Çocuk Sağlığı", slug: "cocuk-sagligi" },
      { name: "Beslenme", slug: "beslenme" },
      { name: "Güzellik ve Bakım", slug: "guzellik-ve-bakim" }
    ]
  },
  {
    name: "Ev ve Yaşam",
    slug: "ev-ve-yasam",
    children: [
      { name: "Lezzetli Hikayeler", slug: "lezzetli-hikayeler" },
      { name: "El Emeği", slug: "el-emegi" },
      { name: "Pür İhtimam", slug: "pur-ihtimam" },
      { name: "Gülistan", slug: "gulistan" }
    ]
  },
  {
    name: "Maneviyat",
    slug: "maneviyat",
    children: [
      { name: "Asr-ı Saadet", slug: "asri-saadet" },
      { name: "Mizan", slug: "mizan" },
      { name: "İmanla Yeniden", slug: "imanla-yeniden" },
      { name: "Baş'tan Konuşalım", slug: "bastan-konusalim" },
      { name: "Eğlence İlmihali", slug: "eglence-ilmihali" }
    ]
  },
  {
    name: "Aile ve Çocuk",
    slug: "aile-ve-cocuk",
    children: [
      { name: "Evliliğe Dair", slug: "evlilige-dair" },
      { name: "Tohum", slug: "tohum" }
    ]
  }
];

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Kategoriler | Rehnüma Kadın Dergisi",
  description: "Rehnüma Düşünce'den Maneviyat'a tüm kategori ve alt başlıkları keşfedin."
};

export default async function KategorilerPage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  let categories: CategoryNode[] = [];

  if (hasDatabase) {
    categories =
      (await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: "asc" },
        select: {
          name: true,
          slug: true,
          children: { orderBy: { order: "asc" }, select: { name: true, slug: true } }
        }
      })) || [];
  }

  const list = categories.length ? categories : fallbackCategories;

  return (
    <div className="min-h-screen">
      <main className="container space-y-8 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Kategoriler</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">Tüm başlıklar ve alt kırılımlar</h1>
          <p className="text-lg text-muted-foreground">
            Rehnüma Düşünce’den Aile ve Çocuk’a kadar tüm ana kategoriler ve alt başlıklar tek sayfada. Merak ettiğiniz alt
            kategoriye gidin ve yazıları keşfedin.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {list.map((cat) => (
            <div
              key={cat.slug}
              className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Ana kategori</p>
                  <h2 className="text-2xl font-serif">
                    <Link href={`/kategori/${cat.slug}`} className="hover:underline">
                      {cat.name}
                    </Link>
                  </h2>
                </div>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="rounded-full border border-border bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary hover:-translate-y-[1px] transition"
                >
                  Gör
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.children.map((child) => (
                  <Link
                    key={child.slug}
                    href={`/kategori/${child.slug}`}
                    className="rounded-full border border-border/70 bg-white px-3 py-1.5 text-sm text-muted-foreground hover:-translate-y-[1px] hover:shadow-sm transition"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
