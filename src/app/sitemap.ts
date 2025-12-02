import { MetadataRoute } from "next";
import { prisma } from "@/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://example.com";
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const [articles, categories, issues] = hasDatabase
    ? await Promise.all([
        prisma.article.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.category.findMany({ select: { slug: true } }),
        prisma.issue.findMany({ select: { year: true, month: true, createdAt: true } })
      ])
    : [[], [], []];

  const staticRoutes: MetadataRoute.Sitemap = ["/", "/abonelik", "/dergi"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${baseUrl}/yazi/${a.slug}`,
    lastModified: a.updatedAt ?? new Date()
  }));
  const categoryRoutes = categories.map((c) => ({
    url: `${baseUrl}/kategori/${c.slug}`,
    lastModified: new Date()
  }));
  const issueRoutes = issues.map((i) => ({
    url: `${baseUrl}/dergi/${i.year}-${String(i.month).padStart(2, "0")}`,
    lastModified: i.createdAt
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...issueRoutes];
}
