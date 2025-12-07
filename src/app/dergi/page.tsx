import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { IssueGrid } from "@/components/dergi/issue-grid";

export const revalidate = 300;
export const dynamic = "force-dynamic";

type ArchiveProps = {
  returnTo: string;
  heading?: string;
  kicker?: string;
  description?: string;
};

async function IssueArchive({ returnTo, heading, kicker, description }: ArchiveProps) {
  const user = await requireUser(returnTo);
  const isAdmin = user.role === "admin";
  const isSubscriber = isAdmin || user.subscriptionStatus === "active";

  return (
    <div className="min-h-screen">
      <main className="container space-y-6 py-10 lg:py-12">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{kicker ?? "Rehnüma dijital arşiv"}</p>
          <h1 className="text-3xl font-serif">{heading ?? "Dijital Dergi Arşivi"}</h1>
          <p className="text-sm text-muted-foreground">
            {description ?? "Kapakları, flipbook ve PDF erişimini tek ekranda toparladık."}
          </p>
        </div>

        {!isSubscriber && (
          <div className="rounded-2xl border border-border bg-background/90 p-4 sm:p-5">
            <p className="font-semibold">Aboneler tüm sayıları PDF/flipbook olarak açabilir.</p>
            <p className="text-sm text-muted-foreground">Kapaklar herkese açık; içerik için abone olun.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/abonelik"
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Abonelik planlarını incele
              </Link>
              <Link href="/iletisim" className="inline-flex items-center justify-center text-sm text-primary underline">
                Sorunuz mu var?
              </Link>
            </div>
          </div>
        )}
        <IssueGrid isSubscriber={isSubscriber} />
      </main>
    </div>
  );
}

export default async function DergiPage() {
  return (
    <IssueArchive
      returnTo="/dergi"
      heading="Dijital Dergi Arşivi"
      kicker="Rehnüma dijital arşiv"
      description="Kapakları, flipbook ve PDF erişimini tek ekranda toparladık."
    />
  );
}

export async function SayilarPage() {
  return (
    <IssueArchive
      returnTo="/sayilar"
      heading="Sayılar"
      kicker="Dijital sayı arşivi"
      description="Tüm Rehnüma sayılarının kapak, flipbook ve PDF erişimi."
    />
  );
}
