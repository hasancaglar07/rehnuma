import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedGrid } from "@/components/sections/featured-grid";
import { CategoryGrid } from "@/components/sections/category-grid";
import { IssueShowcase } from "@/components/sections/issue-showcase";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export const revalidate = 60;

const sampleArticles = [
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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedGrid items={sampleArticles} />
        <CategoryGrid />
        <IssueShowcase />
      </main>
      <Footer />
    </div>
  );
}
