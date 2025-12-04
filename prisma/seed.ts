import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
    categories.map((category, idx) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { order: idx, name: category.name },
        create: { ...category, order: idx }
      })
    )
  );

  const adminPassword = await bcrypt.hash("admin123", 10);
  const vipPassword = await bcrypt.hash("vip12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "admin", isBanned: false, password: adminPassword },
    create: { email: "admin@example.com", password: adminPassword, role: "admin", isBanned: false, name: "Admin" }
  });

  const vipUser = await prisma.user.upsert({
    where: { email: "vip@example.com" },
    update: { isBanned: false, password: vipPassword, name: "VIP Kullanıcı" },
    create: { email: "vip@example.com", password: vipPassword, name: "VIP Kullanıcı" }
  });

  const articlesData = [
    {
      title: "Bilgeliğin ve Zarafetin İzinde",
      slug: "ilk-yazi",
      content:
        "Manevi incelikler, gündelik hayatın içine saklı güzelliklerle birleşince kalbe huzur verir. Bu yazıda içsel yolculuğun zarif adımlarını anlatıyoruz.",
      categorySlug: "maneviyat-islami-ilimler",
      coverUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
      title: "Annelikte Şefkatin İncelikleri",
      slug: "annelikte-sefkat",
      content:
        "Çocuklarla güven bağı kurmak sabır, sevgi ve düzen gerektirir. İpuçları ve dua ile desteklenen bir yolculuk.",
      categorySlug: "annelik-cocuk",
      coverUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      audioUrl: ""
    },
    {
      title: "Evde Sükunet Köşesi",
      slug: "evde-sukunet-kosesi",
      content:
        "Günün koşuşturmasında nefes alabileceğiniz bir köşe oluşturmak ruhu dinlendirir. Minimal tasarım ipuçları ve ayetler eşliğinde.",
      categorySlug: "ev-ve-hayat",
      coverUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      audioUrl: ""
    },
    {
      title: "Şiirle Sükunet",
      slug: "siirle-sukunet",
      content:
        "Ruhun dinginliğini besleyen dizelerden seçkiler. Tasavvuf geleneğinden kısa parçalar ve modern yorumlar.",
      categorySlug: "siir-edebiyat",
      coverUrl: "https://images.unsplash.com/photo-1495433324511-bf8e92934d90?auto=format&fit=crop&w=900&q=80",
      audioUrl: ""
    },
    {
      title: "Ailede Rahmet İklimi",
      slug: "ailede-rahmet",
      content:
        "Eşler arası merhamet, sabır ve ortak hedefler. Modern hayatın meydan okumalarına karşı şefkatli çözümler.",
      categorySlug: "aile-evlilik",
      coverUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      audioUrl: ""
    }
  ];

  const articles = [];
  for (const data of articlesData) {
    const article = await prisma.article.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        content: data.content,
        coverUrl: data.coverUrl,
        audioUrl: data.audioUrl,
        status: "published"
      },
      create: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        coverUrl: data.coverUrl,
        audioUrl: data.audioUrl,
        status: "published",
        category: { connect: { slug: data.categorySlug } }
      }
    });
    articles.push(article);
  }

  const issue = await prisma.issue.upsert({
    where: { id: "seed-issue-2024-01" },
    update: {
      month: 1,
      year: 2024,
      pdfUrl: "https://filesamples.com/samples/document/pdf/sample3.pdf",
      coverUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80"
    },
    create: {
      id: "seed-issue-2024-01",
      month: 1,
      year: 2024,
      pdfUrl: "https://filesamples.com/samples/document/pdf/sample3.pdf",
      coverUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80"
    }
  });

  const issueLinks = [
    { issueId: issue.id, articleId: articles[0].id, reviewerId: admin.id, role: "reviewer", order: 0 },
    { issueId: issue.id, articleId: articles[1].id, reviewerId: admin.id, role: "reviewer", order: 1 }
  ];
  await prisma.issueArticle.createMany({ data: issueLinks, skipDuplicates: true });

  await prisma.subscription.upsert({
    where: { userId: vipUser.id },
    update: { plan: "vip", status: "active", expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
    create: { userId: vipUser.id, plan: "vip", status: "active", expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }
  });

  await prisma.savedArticle.upsert({
    where: { userId_articleId: { userId: vipUser.id, articleId: articles[0].id } },
    update: {},
    create: { userId: vipUser.id, articleId: articles[0].id }
  });

  await prisma.readingProgress.upsert({
    where: { userId_articleId: { userId: vipUser.id, articleId: articles[0].id } },
    update: { progress: 70 },
    create: { userId: vipUser.id, articleId: articles[0].id, progress: 70 }
  });

  console.log("Seed completed:", { categories: categories.length, articles: articles.length, issue: issue.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
