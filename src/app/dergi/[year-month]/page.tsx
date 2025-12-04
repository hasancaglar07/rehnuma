import { prisma } from "@/db/prisma";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/url";

const FlipbookViewer = dynamic(() => import("@/components/dergi/flipbook-viewer").then((m) => m.FlipbookViewer), {
  loading: () => <div className="aspect-[3/4] w-full border border-border rounded-xl overflow-hidden animate-pulse bg-secondary/30" />
});

type Props = { params: Promise<{ "year-month": string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const slug = resolved["year-month"];
  const [yearStr, monthStr] = typeof slug === "string" && slug.includes("-") ? slug.split("-") : ["", ""];
  const year = Number(yearStr);
  const month = Number(monthStr);
  const issue = await prisma.issue.findFirst({ where: { year, month } });
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/dergi/${slug}`;
  const title = issue ? `${issue.month}/${issue.year} Dergi | Rehnüma` : "Dergi | Rehnüma";
  const description = issue ? "Rehnüma dijital dergi sayısı" : "Dijital dergi arşivi";
  const ogImage = issue?.coverUrl || `${baseUrl}/og?title=${encodeURIComponent(title)}&type=issue`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: ogImage }]
    }
  };
}

export default async function IssuePage({ params }: Props) {
  const resolved = await params;
  const slug = resolved["year-month"];
  const [yearStr, monthStr] = typeof slug === "string" && slug.includes("-") ? slug.split("-") : ["", ""];
  const year = Number(yearStr);
  const month = Number(monthStr);

  const issue = await prisma.issue.findFirst({
    where: { year, month },
    include: {
      articles: {
        include: {
          article: { select: { id: true, title: true, slug: true } },
          reviewer: { select: { email: true, id: true } }
        },
        orderBy: { order: "asc" }
      }
    }
  });

  const user = await requireUser(`/dergi/${slug}`);
  const isAdmin = user.role === "admin";
  const isSubscriber = isAdmin || user.subscriptionStatus === "active";
  if (!isSubscriber) {
    redirect("/abonelik");
  }

  const isVip = isAdmin || user.subscriptionPlan === "vip";
  const baseUrl = getBaseUrl();
  const issueLd = issue
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: `${issue.month}/${issue.year} Rehnüma Dergi`,
        isAccessibleForFree: false,
        url: `${baseUrl}/dergi/${slug}`
      }
    : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-4">
        <h1 className="text-3xl font-serif">
          {month}/{year} Sayısı
        </h1>
        {!issue && <p className="text-muted-foreground">Dergi bulunamadı.</p>}
        {issue && (
          <div className="grid gap-8 lg:grid-cols-[360px,1fr]">
            <div className="w-full max-w-sm space-y-3">
              <div className="aspect-[3/4] w-full border border-border rounded-xl overflow-hidden bg-secondary/30">
                {issue.coverUrl ? (
                  <img src={issue.coverUrl} alt="Kapak" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Kapak</div>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={isVip ? issue.pdfUrl : "/abonelik"}
                  className={`px-4 py-2 rounded-full text-sm ${
                    isVip
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground cursor-not-allowed"
                  }`}
                  target={isVip ? "_blank" : undefined}
                >
                  {isVip ? "PDF indir" : "VIP ile indirilebilir"}
                </Link>
              </div>
              <div className="rounded-xl border border-border bg-background/70 p-3 space-y-2">
                <p className="text-sm font-semibold">İçindekiler</p>
                {issue.articles.length === 0 && <p className="text-xs text-muted-foreground">Yazı eklenmedi.</p>}
                {issue.articles.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <Link href={`/yazi/${item.article.slug}`} className="text-primary hover:underline">
                      {item.article.title}
                    </Link>
                    {item.reviewer?.email && <span className="text-xs text-muted-foreground">Hakem: {item.reviewer.email}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-[3/4] w-full">
              <FlipbookViewer pdfUrl={issue.pdfUrl} />
            </div>
          </div>
        )}
        {issueLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(issueLd) }} />}
      </main>
      <Footer />
    </div>
  );
}
