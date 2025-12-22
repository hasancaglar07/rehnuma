import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedGrid } from "@/components/sections/featured-grid";
import { CategoryGrid } from "@/components/sections/category-grid";
import { RecommendationsSection } from "@/components/sections/recommendations-section";
import { prisma } from "@/db/prisma";
import { toExcerpt } from "@/utils/excerpt";
import { estimateReadingMinutes } from "@/utils/reading-time";
import { normalizeHomepageContent } from "@/lib/homepage";

export const revalidate = 60;

export default async function HomePage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const [featuredArticles, categories, recommendedArticles, homepageContent] = hasDatabase
    ? await Promise.all([
        prisma.article.findMany({
          where: { status: "published", isFeatured: true },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 6,
          include: { category: true }
        }),
        prisma.category.findMany({ where: { parentId: null }, orderBy: { order: "asc" } }),
        prisma.article.findMany({
          where: { status: "published", isRecommended: true },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 3,
          include: { category: true }
        }),
        prisma.homepageContent.findFirst()
      ])
    : [[], [], [], null];

  const featured =
    featuredArticles.length > 0
      ? featuredArticles.slice(0, 3).map((a) => ({
          title: a.title,
          slug: a.slug,
          category: a.category?.name ?? "Kategori",
          excerpt: toExcerpt(a.content, 160),
          coverUrl: a.coverUrl ?? undefined
        }))
      : [
          {
            title: "Maneviyat Yolculuğu",
            slug: "maneviyat-yolculugu",
            category: "Maneviyat",
            excerpt: "Ruhani arınma ve kalp huzuru için pratikler.",
            coverUrl: undefined
          },
          {
            title: "Annelikte Şefkat",
            slug: "annelikte-sefkat",
            category: "Annelik",
            excerpt: "Çocuklarla güven bağı kurmanın yolları.",
            coverUrl: undefined
          },
          {
            title: "Şiirle Sükunet",
            slug: "siirle-sukunet",
            category: "Şiir",
            excerpt: "Ruhun dinginliğini besleyen dizeler.",
            coverUrl: undefined
          }
        ];

  const recommendations =
    recommendedArticles.length > 0
      ? recommendedArticles.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          category: a.category?.name ?? "Kategori",
          excerpt: toExcerpt(a.content, 150),
          coverUrl: a.coverUrl ?? undefined,
          readingMinutes: estimateReadingMinutes(a.content)
        }))
      : [
          {
            id: "fallback-1",
            title: "Kalbe Dokunan Tavsiyeler",
            slug: "kalbe-dokunan-tavsiyeler",
            category: "Maneviyat",
            excerpt: "Sakinlik, dua ve iyilik odaklı kısa notlarla ruhu besleyin.",
            coverUrl: undefined,
            readingMinutes: 4
          },
          {
            id: "fallback-2",
            title: "Zarif Yaşam Rehberi",
            slug: "zarif-yasam-rehberi",
            category: "Ev ve Yaşam",
            excerpt: "Gündelik hayata estetik ve dinginlik katan küçük dokunuşlar.",
            coverUrl: undefined,
            readingMinutes: 5
          },
          {
            id: "fallback-3",
            title: "Anneliğe Dair Notlar",
            slug: "annelige-dair-notlar",
            category: "Aile",
            excerpt: "Sevgi dolu iletişim ve güven bağını güçlendiren yaklaşımlar.",
            coverUrl: undefined,
            readingMinutes: 6
          }
        ];

  const categoryList = categories.length
    ? categories.map((c) => ({ slug: c.slug, name: c.name }))
    : undefined;
  const heroContent = normalizeHomepageContent(homepageContent ?? undefined);

  return (
    <div className="min-h-screen">
      <main>
        <HeroSection content={heroContent} />
        <FeaturedGrid items={featured} />
        <CategoryGrid categories={categoryList} />
        <RecommendationsSection
          title={heroContent.recommendationsTitle}
          description={heroContent.recommendationsDescription}
          items={recommendations}
        />
      </main>
    </div>
  );
}
