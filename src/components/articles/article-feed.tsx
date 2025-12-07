 "use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArticleCard } from "@/components/articles/article-card";
import { toExcerpt } from "@/utils/excerpt";

type ArticleItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverUrl?: string | null;
  publishedAt?: string | Date | null;
  createdAt: string | Date;
  category?: { name?: string | null } | null;
};

type Props = {
  initialArticles: ArticleItem[];
  categorySlug?: string;
  pageSize?: number;
  initialPage?: number;
  hasMore: boolean;
};

type ArticleResponse = {
  articles: ArticleItem[];
  nextPage: number | null;
};

function normalizeDate(value?: string | Date | null) {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
}

function computeMeta(article: ArticleItem) {
  const wordCount = article.content ? article.content.trim().split(/\s+/).length : 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));
  const dateValue = normalizeDate(article.publishedAt) ?? normalizeDate(article.createdAt);
  const dateLabel = dateValue
    ? new Intl.DateTimeFormat("tr-TR", { month: "short", day: "numeric" }).format(dateValue)
    : undefined;

  return { readingMinutes, dateLabel };
}

export function ArticleFeed({ initialArticles, categorySlug, pageSize = 9, initialPage = 1, hasMore }: Props) {
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
          excerpt: toExcerpt(a.content, 140),
          coverUrl: a.coverUrl ?? undefined,
          readingMinutes,
          dateLabel,
          categoryName: a.category?.name ?? undefined
        };
      }),
    [articles]
  );

  useEffect(() => {
    setArticles(initialArticles);
    setNextPage(hasMore ? initialPage + 1 : null);
  }, [initialArticles, hasMore, initialPage]);

  const loadMore = useCallback(async () => {
    if (loading || !nextPage) return;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (categorySlug) query.set("category", categorySlug);
      query.set("limit", String(pageSize));
      query.set("page", String(nextPage));
      const res = await fetch(`/api/articles?${query.toString()}`, { cache: "no-store" });
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
  }, [categorySlug, loading, nextPage, pageSize]);

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
