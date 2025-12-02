import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Annelik & Çocuk", slug: "annelik-cocuk" },
    { name: "Maneviyat & İslami İlimler", slug: "maneviyat-islami-ilimler" },
    { name: "Aile & Evlilik", slug: "aile-evlilik" },
    { name: "Ev ve Hayat", slug: "ev-ve-hayat" },
    { name: "Şiir & Edebiyat", slug: "siir-edebiyat" },
    { name: "Sesli İçerikler", slug: "sesli-icerikler" },
    { name: "Dijital Dergi", slug: "dijital-dergi" }
  ];

  await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      })
    )
  );

  const article = await prisma.article.upsert({
    where: { slug: "ilk-yazi" },
    update: {},
    create: {
      title: "Bilgeliğin ve Zarafetin İzinde",
      slug: "ilk-yazi",
      content: "İçerikten bir kesit...",
      category: { connect: { slug: "maneviyat-islami-ilimler" } },
      coverUrl: "",
      audioUrl: ""
    }
  });

  await prisma.issue.upsert({
    where: { id: "seed-issue" },
    update: {},
    create: {
      id: "seed-issue",
      month: 1,
      year: 2024,
      pdfUrl: "https://blob.example.com/issue-2024-01.pdf"
    }
  });

  console.log("Seed completed:", { categories: categories.length, article: article.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
