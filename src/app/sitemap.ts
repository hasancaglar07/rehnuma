import { MetadataRoute } from "next";
import { prisma } from "@/db/prisma";
import { getBaseUrl } from "@/lib/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const [articles, categories, issues] = hasDatabase
    ? await Promise.all([
        prisma.article.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.category.findMany({ select: { slug: true } }),
        prisma.issue.findMany({ select: { year: true, month: true, createdAt: true } })
      ])
    : [[], [], []];

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/abonelik",
    "/sayilar",
    "/kategoriler",
    "/kurumsal",
    "/kurumsal/hakkimizda",
    "/kurumsal/misyon",
    "/kurumsal/vizyon",
    "/kurumsal/kunye",
    "/blog",
    "/one-cikan",
    "/yazarlar",
    "/dergi", // legacy
    "/iletisim",
    "/gizlilik-politikasi",
    "/cerez-politikasi",
    "/kullanim-sartlari",
    "/mesafeli-satis-sozlesmesi",
    "/abonelik-sozlesmesi"
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 1
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${baseUrl}/yazi/${a.slug}`,
    lastModified: a.updatedAt ?? now,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));
  const categoryRoutes = categories.map((c) => ({
    url: `${baseUrl}/kategori/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));
  const issueRoutes = issues.map((i) => ({
    url: `${baseUrl}/sayilar/${i.year}-${String(i.month).padStart(2, "0")}`,
    lastModified: i.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...issueRoutes];
}
