"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type IssueListItem = { id: string; year: number; month: number; coverUrl?: string | null };

function IssueCardSkeleton() {
  return (
    <div className="border border-border rounded-xl p-4 bg-background/80 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.3)]">
      <div className="w-full aspect-[3/4] rounded-lg border border-border overflow-hidden bg-secondary/30 mb-3" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-28 mt-2" />
    </div>
  );
}

function IssueCard({ issue }: { issue: IssueListItem }) {
  const monthLabel = String(issue.month).padStart(2, "0");
  return (
    <Link
      href={`/dergi/${issue.year}-${monthLabel}`}
      className="border border-border rounded-xl p-4 hover:-translate-y-1 transition bg-background/80 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <div className="w-full aspect-[3/4] rounded-lg border border-border overflow-hidden bg-secondary/30 mb-3">
        {issue.coverUrl ? (
          <img src={issue.coverUrl} alt="Kapak" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Kapak</div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {monthLabel}/{issue.year}
      </p>
      <p className="text-primary text-sm mt-2">Flipbook aç</p>
    </Link>
  );
}

export function IssueGrid() {
  const [issues, setIssues] = useState<IssueListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
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
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!issues) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <IssueCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
