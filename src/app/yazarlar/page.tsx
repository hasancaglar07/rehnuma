import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/db/prisma";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Yazarlar | Rehnüma Kadın Dergisi",
  description: "Rehnüma yazarlarıyla tanışın; biyografileri ve yazdıkları içerikleri keşfedin."
};

export default async function YazarlarPage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const authors = hasDatabase
    ? await prisma.authorProfile.findMany({
        where: {
          OR: [{ articles: { some: { status: "published" } } }, { userId: { not: null } }]
        },
        orderBy: { name: "asc" },
        include: { _count: { select: { articles: { where: { status: "published" } } } } }
      })
    : [
        {
          id: "fallback-author",
          name: "Rehnüma Editör Ekibi",
          slug: "rehnuma-editor",
          bio: "Rehnüma kadın dergisi editörleri; zarafet, maneviyat ve kültür odaklı yazılar hazırlar.",
          avatarUrl: null,
          _count: { articles: 3 }
        }
      ];

  return (
    <div className="min-h-screen">
      <main className="container space-y-8 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Yazarlar</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">Rehnüma yazarlarıyla tanışın</h1>
          <p className="text-lg text-muted-foreground">Biyografiler, sosyal bağlantılar ve yazdıkları içerikleri tek ekranda bulun.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <Link
              key={author.slug}
              href={`/yazarlar/${author.slug}`}
              className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-primary/10 text-sm font-semibold text-primary">
                  {author.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{author.name}</p>
                  <p className="text-xs text-muted-foreground">{author._count?.articles ?? 0} yazı</p>
                </div>
              </div>
              {author.bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">{author.bio}</p>}
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Detay
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
