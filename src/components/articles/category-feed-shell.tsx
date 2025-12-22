"use client";

import { useEffect, useState } from "react";
import { ArticleFeed, type ArticleFeedItem } from "@/components/articles/article-feed";

type FilterKey = "latest" | "featured" | "short";

type FeedState = {
  articles: ArticleFeedItem[];
  hasMore: boolean;
  initialPage: number;
  loaded: boolean;
};

const FILTERS: { key: FilterKey; label: string; helper: string }[] = [
  { key: "latest", label: "En yeni", helper: "Yayın sırasına göre" },
  { key: "featured", label: "Öne çıkan", helper: "Editör seçtikleri" },
  { key: "short", label: "Kısa okuma", helper: "4 dk ve altı" }
];

type Props = {
  initialArticles: ArticleFeedItem[];
  categorySlug?: string;
  pageSize: number;
  hasMore: boolean;
  initialPage?: number;
};

export function CategoryFeedShell({ initialArticles, categorySlug, pageSize, hasMore, initialPage = 1 }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("latest");
  const [feeds, setFeeds] = useState<Record<FilterKey, FeedState>>({
    latest: { articles: initialArticles, hasMore, initialPage, loaded: true },
    featured: { articles: [], hasMore: false, initialPage: 1, loaded: false },
    short: { articles: [], hasMore: false, initialPage: 1, loaded: false }
  });
  const [loadingKey, setLoadingKey] = useState<FilterKey | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setFeeds((prev) => ({
      ...prev,
      latest: { articles: initialArticles, hasMore, initialPage, loaded: true }
    }));
  }, [initialArticles, hasMore, initialPage]);

  const currentFeed = feeds[activeFilter] ?? feeds.latest;
  const isLoadingCurrent = loadingKey === activeFilter;

  const loadFilter = async (key: FilterKey) => {
    setActiveFilter(key);
    setStatus(null);
    if (feeds[key]?.loaded) return;
    setLoadingKey(key);
    try {
      const query = new URLSearchParams();
      if (categorySlug) query.set("category", categorySlug);
      query.set("limit", String(pageSize));
      query.set("page", "1");
      if (key !== "latest") query.set("filter", key);
      const res = await fetch(`/api/articles?${query.toString()}`);
      if (!res.ok) throw new Error("İçerikler alınamadı");
      const data = await res.json();
      const articles = Array.isArray(data.articles) ? data.articles : [];
      const nextPage = data.nextPage ?? null;
      setFeeds((prev) => ({
        ...prev,
        [key]: { articles, hasMore: Boolean(nextPage), initialPage: 1, loaded: true }
      }));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pt-1">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          const isLoading = loadingKey === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => loadFilter(filter.key)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                  : "border-border/70 bg-white/80 text-muted-foreground hover:border-primary/30 hover:text-primary"
              }`}
              aria-pressed={isActive}
              disabled={isLoading}
            >
              <span className="font-medium">{filter.label}</span>
              <span className="ml-2 text-[11px] text-muted-foreground/70">{filter.helper}</span>
              {isLoading && <span className="ml-2 text-[11px] text-primary">yükleniyor…</span>}
            </button>
          );
        })}
      </div>

      {status && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{status}</div>
      )}

      <div className="rounded-3xl border border-border/70 bg-gradient-to-b from-white via-white to-primary/5 p-4 sm:p-6 lg:p-8">
        {isLoadingCurrent && (
          <p className="text-sm text-muted-foreground">Seçili filtre yükleniyor…</p>
        )}
        {!isLoadingCurrent && currentFeed.articles.length === 0 && (
          <p className="text-muted-foreground sm:col-span-2 lg:col-span-3">
            Bu filtrede içerik bulunamadı.
          </p>
        )}
        {!isLoadingCurrent && currentFeed.articles.length > 0 && (
          <ArticleFeed
            initialArticles={currentFeed.articles}
            categorySlug={categorySlug}
            pageSize={pageSize}
            initialPage={currentFeed.initialPage}
            hasMore={currentFeed.hasMore}
            activeFilter={activeFilter}
          />
        )}
      </div>
    </div>
  );
}
