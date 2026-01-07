import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const rootCategories = [
    { name: "Rehnüma Düşünce", slug: "rehnuma-dusunce" },
    { name: "Kültür Edebiyat", slug: "kultur-edebiyat" },
    { name: "Kadın ve Sağlık", slug: "kadin-ve-saglik" },
    { name: "Maneviyat", slug: "maneviyat" },
    { name: "Aile ve Çocuk", slug: "aile-ve-cocuk" }
  ];

  const childCategories = [
    { name: "Akis", slug: "akis", parentSlug: "rehnuma-dusunce" },
    { name: "Ruh ve Mana", slug: "ruh-ve-mana", parentSlug: "rehnuma-dusunce" },
    { name: "Zemin", slug: "zemin", parentSlug: "rehnuma-dusunce" },
    { name: "Akışkan Modernite", slug: "akiskan-modernite", parentSlug: "rehnuma-dusunce" },
    { name: "Edebi Alem", slug: "edebi-alem", parentSlug: "kultur-edebiyat" },
    { name: "İstikbal Köklerdedir", slug: "istikbal-koklerdedir", parentSlug: "kultur-edebiyat" },
    { name: "İslami Sanat", slug: "islami-sanat", parentSlug: "kultur-edebiyat" },
    { name: "Direnen Coğrafyalar", slug: "direnen-cografyalar", parentSlug: "kultur-edebiyat" },
    { name: "Şehrengiz", slug: "sehrengiz", parentSlug: "kultur-edebiyat" },
    { name: "Sıhhat Bul", slug: "sihhat-bul", parentSlug: "kadin-ve-saglik" },
    { name: "Fonksiyonel Tıp", slug: "fonksiyonel-tip", parentSlug: "kadin-ve-saglik" },
    { name: "Çocuk Sağlığı", slug: "cocuk-sagligi", parentSlug: "kadin-ve-saglik" },
    { name: "Beslenme", slug: "beslenme", parentSlug: "kadin-ve-saglik" },
    { name: "Güzellik ve Bakım", slug: "guzellik-ve-bakim", parentSlug: "kadin-ve-saglik" },
    { name: "Asr-ı Saadet", slug: "asri-saadet", parentSlug: "maneviyat" },
    { name: "Mizan", slug: "mizan", parentSlug: "maneviyat" },
    { name: "İmanla Yeniden", slug: "imanla-yeniden", parentSlug: "maneviyat" },
    { name: "Baş'tan Konuşalım", slug: "bastan-konusalim", parentSlug: "maneviyat" },
    { name: "Eğlence İlmihali", slug: "eglence-ilmihali", parentSlug: "maneviyat" },
    { name: "Evliliğe Dair", slug: "evlilige-dair", parentSlug: "aile-ve-cocuk" },
    { name: "Tohum", slug: "tohum", parentSlug: "aile-ve-cocuk" }
  ];

  const rootMap: Record<string, { id: string }> = {};

  for (const [idx, category] of rootCategories.entries()) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { order: idx, name: category.name, parentId: null },
      create: { ...category, order: idx }
    });
    rootMap[category.slug] = { id: created.id };
  }

  const childOrderMap: Record<string, number> = {};
  for (const child of childCategories) {
    const order = childOrderMap[child.parentSlug] ?? 0;
    const { parentSlug, ...rest } = child;
    const created = await prisma.category.upsert({
      where: { slug: child.slug },
      update: { name: child.name, parentId: rootMap[child.parentSlug]?.id ?? null, order },
      create: { ...rest, parentId: rootMap[parentSlug]?.id ?? null, order }
    });
    childOrderMap[child.parentSlug] = order + 1;
    rootMap[child.slug] = { id: created.id };
  }

  const categoryMap = Object.fromEntries(
    Object.entries(rootMap).map(([slug, value]) => [slug, value.id])
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

  const authors = [
    {
      name: "Rehnüma Editör Ekibi",
      slug: "rehnuma-editor",
      bio: "Rehnüma kadın dergisi editörleri; zarafet, maneviyat ve kültür odaklı yazılar hazırlar."
    },
    {
      name: "Seda Aksoy",
      slug: "seda-aksoy",
      bio: "Maneviyat ve aile üzerine yazılar kaleme alan, psikoloji ve ilahiyat kökenli yazar."
    }
  ];

  const authorMap: Record<string, { id: string }> = {};
  for (const [idx, author] of authors.entries()) {
    const created = await prisma.authorProfile.upsert({
      where: { slug: author.slug },
      update: { name: author.name, bio: author.bio, avatarUrl: null },
      create: {
        name: author.name,
        slug: author.slug,
        bio: author.bio,
        avatarUrl: idx === 0 ? "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" : undefined
      }
    });
    authorMap[author.slug] = { id: created.id };
  }

  const articlesData = [
    {
      title: "Bilgeliğin ve Zarafetin İzinde",
      slug: "ilk-yazi",
      content:
        "Manevi incelikler, gündelik hayatın içine saklı güzelliklerle birleşince kalbe huzur verir. Bu yazıda içsel yolculuğun zarif adımlarını anlatıyoruz.",
      categorySlug: "ruh-ve-mana",
      coverUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      isFeatured: true,
      authorSlug: "seda-aksoy"
    },
    {
      title: "Annelikte Şefkatin İncelikleri",
      slug: "annelikte-sefkat",
      content:
        "Çocuklarla güven bağı kurmak sabır, sevgi ve düzen gerektirir. İpuçları ve dua ile desteklenen bir yolculuk.",
      categorySlug: "tohum",
      coverUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      audioUrl: "",
      isFeatured: false,
      authorSlug: "rehnuma-editor"
    },
    {
      title: "Evde Sükunet Köşesi",
      slug: "evde-sukunet-kosesi",
      content:
        "Günün koşuşturmasında nefes alabileceğiniz bir köşe oluşturmak ruhu dinlendirir. Minimal tasarım ipuçları ve ayetler eşliğinde.",
      categorySlug: "pur-ihtimam",
      coverUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      audioUrl: "",
      isFeatured: true,
      authorSlug: "rehnuma-editor"
    },
    {
      title: "Şiirle Sükunet",
      slug: "siirle-sukunet",
      content:
        "Ruhun dinginliğini besleyen dizelerden seçkiler. Tasavvuf geleneğinden kısa parçalar ve modern yorumlar.",
      categorySlug: "edebi-alem",
      coverUrl: "https://images.unsplash.com/photo-1495433324511-bf8e92934d90?auto=format&fit=crop&w=900&q=80",
      audioUrl: "",
      isFeatured: false,
      authorSlug: "seda-aksoy"
    },
    {
      title: "Ailede Rahmet İklimi",
      slug: "ailede-rahmet",
      content:
        "Eşler arası merhamet, sabır ve ortak hedefler. Modern hayatın meydan okumalarına karşı şefkatli çözümler.",
      categorySlug: "evlilige-dair",
      coverUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      audioUrl: "",
      isFeatured: false,
      authorSlug: "rehnuma-editor"
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
        status: "published",
        isFeatured: data.isFeatured ?? false,
        author: data.authorSlug
          ? { connect: { id: authorMap[data.authorSlug]?.id ?? "" } }
          : { disconnect: true },
        category: { connect: { id: categoryMap[data.categorySlug] } }
      },
      create: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        coverUrl: data.coverUrl,
        audioUrl: data.audioUrl,
        status: "published",
        isFeatured: data.isFeatured ?? false,
        author: data.authorSlug && authorMap[data.authorSlug]?.id ? { connect: { id: authorMap[data.authorSlug]!.id } } : undefined,
        category: { connect: { id: categoryMap[data.categorySlug] } }
      }
    });
    articles.push(article);
  }

  const issue = await prisma.issue.upsert({
    where: { year_month: { year: 2024, month: 1 } },
    update: {
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

  console.log("Seed completed:", {
    categories: rootCategories.length + childCategories.length,
    authors: Object.keys(authorMap).length,
    articles: articles.length,
    issue: issue.id
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
