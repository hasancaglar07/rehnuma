"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type IssueListItem = { id: string; year: number; month: number; coverUrl?: string | null };
type IssueGridProps = { isSubscriber?: boolean };

function IssueCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.3)]">
      <div className="mb-3 h-64 w-full rounded-xl border border-border bg-secondary/30" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-4 w-28" />
    </div>
  );
}

function IssueCard({ issue, isSubscriber }: { issue: IssueListItem; isSubscriber: boolean }) {
  const monthLabel = String(issue.month).padStart(2, "0");
  const slug = `${issue.year}-${monthLabel}`;
  const ctaHref = isSubscriber ? `/dergi/${slug}` : "/abonelik";
  const ctaLabel = isSubscriber ? "Okumaya başla" : "Abone olarak oku";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-background/80 p-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.25)] transition hover:-translate-y-1">
      <Link href={`/dergi/${slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
        <div className="mb-3 w-full overflow-hidden rounded-xl border border-border bg-secondary/30" style={{ aspectRatio: "3 / 4" }}>
          {issue.coverUrl ? (
            <img src={issue.coverUrl} alt={`${monthLabel}/${issue.year} kapak`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Kapak</div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Dijital sayı</p>
        <h3 className="text-lg font-semibold">
          {monthLabel}/{issue.year}
        </h3>
        <p className="text-sm text-muted-foreground">Kapak + flipbook</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link
            href={ctaHref}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {ctaLabel}
          </Link>
          {isSubscriber && (
            <Link
              href={`/dergi/${slug}`}
              className="inline-flex items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:-translate-y-0.5"
            >
              Detay
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function IssueGrid({ isSubscriber = false }: IssueGridProps) {
  const [issues, setIssues] = useState<IssueListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsFetching(true);
    fetch("/api/issues?lite=1", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (!data?.issues) {
          setError("Dergiler yüklenemedi");
          return;
        }
        setIssues(data.issues as IssueListItem[]);
      })
      .catch(() => {
        if (!cancelled) setError("Dergiler yüklenemedi");
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [featured, others] = useMemo(() => {
    if (!issues || !issues.length) return [null, [] as IssueListItem[]];
    return [issues[0], issues.slice(1)];
  }, [issues]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!issues) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-background/80 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-40 w-full rounded-2xl border border-border bg-secondary/30 sm:w-32" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <IssueCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if (!issues.length) {
    return <p className="text-sm text-muted-foreground">Henüz ekli dijital dergi bulunmuyor.</p>;
  }

  const monthLabel = featured ? String(featured.month).padStart(2, "0") : "";
  const featuredSlug = featured ? `${featured.year}-${monthLabel}` : "";

  return (
    <div className="space-y-6">
      {featured && (
        <section className="rounded-3xl border border-border bg-background/90 p-4 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.3)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-full max-w-[110px] overflow-hidden rounded-2xl border border-border bg-secondary/30 sm:max-w-[150px]" style={{ aspectRatio: "3 / 4" }}>
              {featured.coverUrl ? (
                <img
                  src={featured.coverUrl}
                  alt={`${monthLabel}/${featured.year} kapak`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Kapak</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-primary">
                <span className="rounded-full bg-primary/10 px-3 py-1">Son sayı</span>
                {isFetching && <span className="text-muted-foreground">Güncelleniyor…</span>}
              </div>
              <h2 className="text-2xl font-serif">
                {monthLabel}/{featured.year} dijital sayı
              </h2>
              <p className="text-sm text-muted-foreground">
                Kapak, flipbook ve PDF erişimi tek yerde. Mobilde genişletilmiş görünüm ile rahat okuyun.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={isSubscriber ? `/dergi/${featuredSlug}` : "/abonelik"}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  {isSubscriber ? "Okumaya başla" : "Abone olup oku"}
                </Link>
                <Link
                  href={`/dergi/${featuredSlug}`}
                  className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
                >
                  Sayfayı aç
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tüm sayılar</p>
          <h3 className="text-lg font-semibold">Arşiv</h3>
        </div>
        <p className="text-xs text-muted-foreground">Kaydırarak inceleyin</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(others.length ? others : issues).map((issue) => (
          <IssueCard key={issue.id} issue={issue} isSubscriber={isSubscriber} />
        ))}
      </div>
    </div>
  );
}
