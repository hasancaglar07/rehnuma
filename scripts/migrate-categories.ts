import { PrismaClient } from "@prisma/client";

type Mapping = {
  target: string;
  child?: string;
};

const prisma = new PrismaClient();

// Eski slug -> yeni ana kategori / alt kategori eşlemesi
const categoryMap: Record<string, Mapping> = {
  "annelik-cocuk": { target: "aile-ve-cocuk", child: "tohum" },
  "aile-evlilik": { target: "aile-ve-cocuk", child: "evlilige-dair" },
  "siir-edebiyat": { target: "kultur-edebiyat", child: "edebi-alem" },
  "ev-ve-hayat": { target: "ev-ve-yasam", child: "pur-ihtimam" },
  "maneviyat-islami-ilimler": { target: "maneviyat", child: "ruh-ve-mana" },
  "sesli-icerikler": { target: "rehnuma-dusunce" },
  "dijital-dergi": { target: "rehnuma-dusunce" }
};

const rootFallback = "rehnuma-dusunce";

async function ensureCategory(slug: string, parentSlug?: string) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing.id;

  let parentId: string | null = null;
  if (parentSlug) {
    const parent = await prisma.category.upsert({
      where: { slug: parentSlug },
      update: {},
      create: { slug: parentSlug, name: parentSlug.replace(/-/g, " "), order: 0, parentId: null }
    });
    parentId = parent.id;
  }

  const created = await prisma.category.create({
    data: {
      slug,
      name: slug.replace(/-/g, " "),
      order: 0,
      parentId
    }
  });
  return created.id;
}

async function migrate() {
  const results: { slug: string; moved: number; target: string }[] = [];
  const missingTargets: string[] = [];

  for (const [oldSlug, map] of Object.entries(categoryMap)) {
    const targetRoot = map.target || rootFallback;
    const targetId = map.child ? await ensureCategory(map.child, targetRoot) : await ensureCategory(targetRoot);

    const moved = await prisma.article.updateMany({
      where: { category: { slug: oldSlug } },
      data: { categoryId: targetId }
    });

    results.push({ slug: oldSlug, moved: moved.count, target: map.child ?? targetRoot });

    if (!targetId) {
      missingTargets.push(oldSlug);
    }
  }

  // Eski kategorilerde yazı kalmadıysa sil
  const toDelete = Object.keys(categoryMap);
  let deleted = 0;
  for (const slug of toDelete) {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { articles: true } } }
    });
    if (cat && cat._count.articles === 0) {
      await prisma.category.delete({ where: { slug } });
      deleted += 1;
    }
  }

  console.log("Kategori taşıma özeti:");
  results.forEach((r) => console.log(`- ${r.slug} -> ${r.target}: ${r.moved} yazı`));
  console.log(`Silinen eski kategori: ${deleted}`);
  if (missingTargets.length) {
    console.warn("Hedef kategorisi bulunamayanlar:", missingTargets);
  }
}

migrate()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
