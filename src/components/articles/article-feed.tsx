"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArticleCard } from "@/components/articles/article-card";
import { toExcerpt } from "@/utils/excerpt";
import { estimateReadingMinutes } from "@/utils/reading-time";

type ArticleItem = {
  id: string;
  title: string;
  slug: string;
  content?: string | null;
  excerpt?: string | null;
  coverUrl?: string | null;
  publishedAt?: string | Date | null;
  createdAt: string | Date;
  category?: { name?: string | null } | null;
  isFeatured?: boolean | null;
  readingMinutes?: number | null;
};

type Props = {
  initialArticles: ArticleItem[];
  categorySlug?: string;
  pageSize?: number;
  initialPage?: number;
  hasMore: boolean;
  activeFilter?: "latest" | "featured" | "short";
};

type ArticleResponse = {
  articles: ArticleItem[];
  nextPage: number | null;
};

export type ArticleFeedItem = ArticleItem;

function normalizeDate(value?: string | Date | null) {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
}

function computeMeta(article: ArticleItem) {
  const readingMinutes =
    article.readingMinutes ?? (article.content ? estimateReadingMinutes(article.content) : undefined);
  const dateValue = normalizeDate(article.publishedAt) ?? normalizeDate(article.createdAt);
  const dateLabel = dateValue
    ? new Intl.DateTimeFormat("tr-TR", { month: "short", day: "numeric" }).format(dateValue)
    : undefined;

  return { readingMinutes, dateLabel };
}

export function ArticleFeed({
  initialArticles,
  categorySlug,
  pageSize = 9,
  initialPage = 1,
  hasMore,
  activeFilter
}: Props) {
  const filter = activeFilter ?? "latest";
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [nextPage, setNextPage] = useState<number | null>(hasMore ? initialPage + 1 : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const mappedArticles = useMemo(
    () =>
      articles.map((a) => {
        const { readingMinutes, dateLabel } = computeMeta(a);
        return {
          ...a,
          excerpt: toExcerpt(a.excerpt ?? a.content ?? "", 140),
          coverUrl: a.coverUrl ?? undefined,
          readingMinutes,
          dateLabel,
          categoryName: a.category?.name ?? undefined,
          isFeatured: Boolean(a.isFeatured)
        };
      }),
    [articles]
  );

  useEffect(() => {
    setArticles(initialArticles);
    setNextPage(hasMore ? initialPage + 1 : null);
    setError(null);
  }, [initialArticles, hasMore, initialPage, filter]);

  const loadMore = useCallback(async () => {
    if (loading || !nextPage) return;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (categorySlug) query.set("category", categorySlug);
      query.set("limit", String(pageSize));
      query.set("page", String(nextPage));
      if (filter && filter !== "latest") query.set("filter", filter);
      const res = await fetch(`/api/articles?${query.toString()}`);
      if (!res.ok) throw new Error("İçerikler yüklenemedi");
      const data: ArticleResponse = await res.json();
      const incoming = data.articles || [];
      setArticles((prev) => [...prev, ...incoming]);
      setNextPage(data.nextPage ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [categorySlug, loading, nextPage, pageSize, filter]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!nextPage) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, nextPage]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mappedArticles.map((article) => (
          <ArticleCard
            key={article.id}
            title={article.title}
            slug={article.slug}
            excerpt={article.excerpt}
            coverUrl={article.coverUrl}
            category={article.categoryName}
            isFeatured={article.isFeatured}
            meta={{ readingMinutes: article.readingMinutes, date: article.dateLabel }}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div ref={sentinelRef} className="flex items-center justify-center py-4">
        {loading && <span className="text-sm text-muted-foreground">Yükleniyor…</span>}
        {!loading && nextPage && (
          <button
            type="button"
            onClick={loadMore}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:-translate-y-[1px] hover:shadow transition"
          >
            Daha fazla yükle
          </button>
        )}
      </div>
    </div>
  );
}
