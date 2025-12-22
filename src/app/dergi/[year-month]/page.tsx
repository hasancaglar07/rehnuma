import { prisma } from "@/db/prisma";
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

async function resolveIssueParams(params: Props["params"]) {
  const resolved = await params;
  const slug = resolved["year-month"];
  const [yearStr, monthStr] = typeof slug === "string" && slug.includes("-") ? slug.split("-") : ["", ""];
  const year = Number(yearStr);
  const month = Number(monthStr);
  return { slug, year, month };
}

async function issueMetadata(params: Props["params"], basePath: string): Promise<Metadata> {
  const { slug, year, month } = await resolveIssueParams(params);
  const issue = await prisma.issue.findFirst({ where: { year, month } });
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}${basePath}/${slug}`;
  const title = issue ? `${issue.month}/${issue.year} Sayı | Rehnüma` : "Sayı | Rehnüma";
  const description = issue ? "Rehnüma dijital sayı" : "Dijital sayı arşivi";
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

async function IssueDetail({ params, basePath }: { params: Props["params"]; basePath: string }) {
  const { slug, year, month } = await resolveIssueParams(params);

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

  const user = await requireUser(`${basePath}/${slug}`);
  const isAdmin = user.role === "admin";
  const isSubscriber = isAdmin || user.subscriptionStatus === "active";
  if (!isSubscriber) {
    redirect("/abonelik");
  }

  const isPremium = isAdmin || user.subscriptionPlan === "yearly";
  const baseUrl = getBaseUrl();
  const issueLd = issue
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: `${issue.month}/${issue.year} Rehnüma Sayı`,
        isAccessibleForFree: false,
        url: `${baseUrl}${basePath}/${slug}`
      }
    : null;

  return (
    <div className="min-h-screen">
      <main className="container space-y-6 py-10 lg:py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Dijital sayı</p>
            <h1 className="text-3xl font-serif">
              {month}/{year} Sayısı
            </h1>
            <p className="text-sm text-muted-foreground">Kapak, flipbook ve PDF erişimi tek ekranda.</p>
          </div>
          <p className="text-xs text-muted-foreground">Mobilde tek sayfa moduna geçer, çift dokun zoom yapar.</p>
        </div>

        {!issue && <p className="text-muted-foreground">Sayı bulunamadı.</p>}

        {issue && (
          <div className="space-y-6">
            <div id="okuma" className="rounded-3xl border border-border bg-background/90 p-3 shadow-sm">
              <FlipbookViewer pdfUrl={issue.pdfUrl} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={isPremium ? issue.pdfUrl : "/abonelik"}
                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ${
                  isPremium ? "border border-border text-foreground hover:-translate-y-0.5" : "border border-border text-muted-foreground"
                }`}
                target={isPremium ? "_blank" : undefined}
              >
                {isPremium ? "PDF indir" : "Abonelik ile indirilebilir"}
              </Link>
              <Link
                href="#kapak"
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
              >
                Kapak & İçindekiler
              </Link>
            </div>

            <div id="kapak" className="space-y-3 rounded-3xl border border-border bg-background/80 p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[minmax(260px,320px),1fr]">
                <div className="overflow-hidden rounded-3xl border border-border bg-secondary/30 shadow-sm" style={{ aspectRatio: "3 / 4" }}>
                  {issue.coverUrl ? (
                    <img src={issue.coverUrl} alt="Kapak" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Kapak</div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-background/70 p-3 text-sm text-muted-foreground shadow-sm">
                    <p className="font-semibold text-foreground">Okuma ipuçları</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      <li>Sayfa/tema/zoom tercihleriniz hatırlanır; tekrar girişte kaldığınız yerden devam eder.</li>
                      <li>Mobilde tek sayfa + altta kontrol barı; çift dokun zoom, sağ/sol kaydır sayfa değiştir, “Sade mod” ile tam ekran okuyun.</li>
                      <li>Klavye: ← → sayfa, + / - zoom, F tam ekran, O outline, T önizleme.</li>
                    </ul>
                  </div>
                  <div className="space-y-2 rounded-2xl border border-border bg-background/70 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">İçindekiler</p>
                      <span className="text-[11px] text-muted-foreground">Sıralı</span>
                    </div>
                    {issue.articles.length === 0 && <p className="text-xs text-muted-foreground">Yazı eklenmedi.</p>}
                    {issue.articles.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm">
                        <Link href={`/yazi/${item.article.slug}`} className="text-primary hover:underline">
                          {item.article.title}
                        </Link>
                        {item.reviewer?.email && <span className="text-xs text-muted-foreground">Hakem: {item.reviewer.email}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {issueLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(issueLd) }} />}
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return issueMetadata(params, "/dergi");
}

export default async function IssuePage(props: Props) {
  return <IssueDetail {...props} basePath="/dergi" />;
}

export async function generateSayilarMetadata({ params }: Props): Promise<Metadata> {
  return issueMetadata(params, "/sayilar");
}

export async function SayilarIssuePage(props: Props) {
  return <IssueDetail {...props} basePath="/sayilar" />;
}
