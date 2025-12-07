import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getHierarchy() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      _count: { select: { articles: true } }
    }
  });

  const root = categories.filter((c) => !c.parentId);
  const childrenByParent = new Map<string, typeof categories>();
  for (const cat of categories) {
    if (!cat.parentId) continue;
    const list = childrenByParent.get(cat.parentId) ?? [];
    list.push(cat);
    childrenByParent.set(cat.parentId, list);
  }
  return { categories, root, childrenByParent };
}

async function rebalanceCategories() {
  const { root, childrenByParent } = await getHierarchy();
  let totalReassigned = 0;
  const logs: string[] = [];

  for (const parent of root) {
    const kids = childrenByParent.get(parent.id) ?? [];
    if (kids.length === 0) continue;

    // Tüm çocuklardaki yazıları çek
    const articles = await prisma.article.findMany({
      where: { category: { parentId: parent.id } },
      orderBy: { createdAt: "asc" },
      select: { id: true }
    });
    if (articles.length === 0) continue;

    const updates = articles.map((article, idx) => {
      const target = kids[idx % kids.length];
      return prisma.article.update({
        where: { id: article.id },
        data: { categoryId: target.id }
      });
    });

    await prisma.$transaction(updates);
    totalReassigned += updates.length;

    // Son durum sayıları
    const counts = await prisma.category.findMany({
      where: { id: { in: kids.map((k) => k.id) } },
      select: { slug: true, _count: { select: { articles: true } } },
      orderBy: { slug: "asc" }
    });

    logs.push(
      `${parent.slug}: ${updates.length} yazı dağıtıldı -> ` +
        counts.map((c) => `${c.slug}:${c._count.articles}`).join(", ")
    );
  }

  return { totalReassigned, logs };
}

async function assignAuthors() {
  let authors = await prisma.authorProfile.findMany({ select: { id: true } });
  if (authors.length === 0) {
    const created = await prisma.authorProfile.create({
      data: { name: "Rehnüma Editör Ekibi", slug: "rehnuma-editor", bio: "Rehnüma editör ekibi" }
    });
    authors = [created];
  }

  const articles = await prisma.article.findMany({
    where: { authorId: null },
    select: { id: true },
    orderBy: { createdAt: "asc" }
  });
  if (articles.length === 0) return { assigned: 0 };

  const updates = articles.map((article, idx) => {
    const author = authors[idx % authors.length];
    return prisma.article.update({
      where: { id: article.id },
      data: { authorId: author.id }
    });
  });

  await prisma.$transaction(updates);
  return { assigned: updates.length, authorCount: authors.length };
}

async function main() {
  const categoryResult = await rebalanceCategories();
  const authorResult = await assignAuthors();

  console.log("Dağıtım tamamlandı.");
  categoryResult.logs.forEach((log) => console.log(log));
  console.log(`Toplam yeniden kategorilenen yazı: ${categoryResult.totalReassigned}`);
  console.log(
    `Yazar atanan yazı: ${authorResult.assigned ?? 0}${authorResult.authorCount ? `, kullanılan yazar profili: ${authorResult.authorCount}` : ""}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
