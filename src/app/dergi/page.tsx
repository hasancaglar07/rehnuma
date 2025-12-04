import { prisma } from "@/db/prisma";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const revalidate = 300;
export const dynamic = "force-dynamic";

type IssueListItem = { id: string; year: number; month: number; coverUrl?: string | null };

export default async function DergiPage() {
  const user = await requireUser("/dergi");
  const isAdmin = user.role === "admin";
  const isSubscriber = isAdmin || user.subscriptionStatus === "active";

  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const issues: IssueListItem[] = hasDatabase
    ? await prisma.issue.findMany({
        select: { id: true, year: true, month: true, coverUrl: true },
        orderBy: [{ year: "desc" }, { month: "desc" }]
      })
    : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-6">
        <h1 className="text-3xl font-serif">Dijital Dergi Arşivi</h1>
        {!isSubscriber && (
          <div className="rounded-xl border border-border p-4 bg-background/80">
            <p className="font-semibold">Aboneler tüm sayıları PDF/flipbook olarak açabilir.</p>
            <p className="text-sm text-muted-foreground">Kapaklar herkese açık; içerik için abone olun.</p>
            <div className="mt-2">
              <Link href="/abonelik" className="text-primary text-sm underline">
                Abonelik Planlarına Git
              </Link>
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue: IssueListItem) => (
            <Link
              key={issue.id}
              href={`/dergi/${issue.year}-${String(issue.month).padStart(2, "0")}`}
              className="border border-border rounded-xl p-4 hover:-translate-y-1 transition bg-background/80"
            >
              <div className="w-full aspect-[3/4] rounded-lg border border-border overflow-hidden bg-secondary/30 mb-3">
                {issue.coverUrl ? (
                  <img src={issue.coverUrl} alt="Kapak" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Kapak</div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {issue.month}/{issue.year}
              </p>
              <p className="text-primary text-sm mt-2">Flipbook aç</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
