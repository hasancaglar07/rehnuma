import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedGrid } from "@/components/sections/featured-grid";
import { CategoryGrid } from "@/components/sections/category-grid";
import { IssueShowcase } from "@/components/sections/issue-showcase";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { prisma } from "@/db/prisma";
import { toExcerpt } from "@/utils/excerpt";

export const revalidate = 60;

export default async function HomePage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const [articles, categories, latestIssue] = hasDatabase
    ? await Promise.all([
        prisma.article.findMany({
          where: { status: "published" },
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { category: true }
        }),
        prisma.category.findMany({ orderBy: { order: "asc" } }),
        prisma.issue.findFirst({ orderBy: [{ year: "desc" }, { month: "desc" }] })
      ])
    : [[], [], null];

  const featured =
    articles.length > 0
      ? articles.slice(0, 3).map((a) => ({
          title: a.title,
          slug: a.slug,
          category: a.category?.name ?? "Kategori",
          excerpt: toExcerpt(a.content, 160)
        }))
      : [
          {
            title: "Maneviyat Yolculuğu",
            slug: "maneviyat-yolculugu",
            category: "Maneviyat",
            excerpt: "Ruhani arınma ve kalp huzuru için pratikler."
          },
          {
            title: "Annelikte Şefkat",
            slug: "annelikte-sefkat",
            category: "Annelik",
            excerpt: "Çocuklarla güven bağı kurmanın yolları."
          },
          {
            title: "Şiirle Sükunet",
            slug: "siirle-sukunet",
            category: "Şiir",
            excerpt: "Ruhun dinginliğini besleyen dizeler."
          }
        ];

  const categoryList = categories.length
    ? categories.map((c) => ({ slug: c.slug, name: c.name }))
    : undefined;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedGrid items={featured} />
        <CategoryGrid categories={categoryList} />
        <IssueShowcase coverUrl={latestIssue?.coverUrl ?? undefined} />
      </main>
      <Footer />
    </div>
  );
}
