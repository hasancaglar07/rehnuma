import { getSession } from "@/lib/auth";
import { prisma } from "@/db/prisma";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import Link from "next/link";

export default async function ReadingHistoryPage() {
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

  const progress = await prisma.readingProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" }
  });

  const articles = await prisma.article.findMany({
    where: { id: { in: progress.map((p) => p.articleId) } }
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-4">
        <h1 className="text-3xl font-serif">Okuma Geçmişi</h1>
        <div className="space-y-3">
          {progress.length === 0 && <p className="text-muted-foreground">Geçmiş bulunamadı.</p>}
          {progress.map((p) => {
            const article = articles.find((a) => a.id === p.articleId);
            if (!article) return null;
            return (
              <div key={p.id} className="border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{article.title}</p>
                  <p className="text-sm text-muted-foreground">İlerleme: {p.progress}%</p>
                </div>
                <Link href={`/yazi/${article.slug}`} className="text-primary text-sm">
                  Devam et
                </Link>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
