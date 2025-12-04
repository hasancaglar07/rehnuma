import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { IssueGrid } from "@/components/dergi/issue-grid";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function DergiPage() {
  const user = await requireUser("/dergi");
  const isAdmin = user.role === "admin";
  const isSubscriber = isAdmin || user.subscriptionStatus === "active";

  return (
    <div className="min-h-screen">
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
        <IssueGrid />
      </main>
    </div>
  );
}
