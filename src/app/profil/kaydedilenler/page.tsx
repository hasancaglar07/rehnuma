import { getSession } from "@/lib/auth";
import { prisma } from "@/db/prisma";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ArticleCard } from "@/components/articles/article-card";

export default async function SavedPage() {
  const session = await getSession();
  if (!session.user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container py-12">
          <p className="text-muted-foreground">Giriş yapın.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const saved = await prisma.savedArticle.findMany({
    where: { userId: session.user.id }
  });

  const articles = await prisma.article.findMany({
    where: { id: { in: saved.map((s) => s.articleId) } }
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-4">
        <h1 className="text-3xl font-serif">Kaydedilenler</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} title={a.title} slug={a.slug} excerpt={a.content.slice(0, 100)} />
          ))}
          {articles.length === 0 && <p className="text-muted-foreground">Henüz kaydedilen yok.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
