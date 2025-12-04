"use client";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArticleAudio } from "./audio-player";
import { ArticleContent } from "./article-content";
import { getCsrfToken } from "@/utils/client-cookies";
import { cn } from "@/lib/cn";

type Props = {
  article: { slug: string; title: string; content: string; audioUrl?: string | null };
  isSubscriber: boolean;
  initialSaved?: boolean;
  initialProgress?: number;
};

type ReadingTheme = {
  id: string;
  label: string;
  bgClass: string;
  textClass: string;
  controlClass: string;
  borderClass: string;
  proseClass?: string;
  swatchClass: string;
  style?: CSSProperties;
  isDark?: boolean;
};

const themes: ReadingTheme[] = [
  {
    id: "clean",
    label: "Beyaz",
    bgClass: "bg-white",
    textClass: "text-slate-900",
    controlClass: "bg-white/90 border-slate-200/80",
    borderClass: "border-slate-200/80",
    proseClass: "prose-slate",
    swatchClass: "bg-white border border-slate-200"
  },
  {
    id: "cream",
    label: "Krem",
    bgClass: "bg-[#fdf8ef]",
    textClass: "text-[#2c1b10]",
    controlClass: "bg-[#fdf8ef]/90 border-[#e6d7bd]",
    borderClass: "border-[#e6d7bd]",
    proseClass: "prose-stone",
    swatchClass: "bg-[#fdf8ef] border border-[#e6d7bd]"
  },
  {
    id: "sepia",
    label: "Sepya",
    bgClass: "bg-[#f3e7d3]",
    textClass: "text-[#24170c]",
    controlClass: "bg-[#f3e7d3]/92 border-[#ddc9a8]",
    borderClass: "border-[#ddc9a8]",
    proseClass: "prose-stone",
    swatchClass: "bg-[#f3e7d3] border border-[#ddc9a8]"
  },
  {
    id: "dusk",
    label: "Akşam",
    bgClass: "bg-[#0f172a]",
    textClass: "text-slate-100",
    controlClass: "bg-[#0f172a]/85 border-white/15",
    borderClass: "border-white/10",
    proseClass: "prose-invert",
    swatchClass: "bg-gradient-to-br from-[#0f172a] to-[#111827] border border-white/25",
    isDark: true
  },
  {
    id: "midnight",
    label: "Gece",
    bgClass: "bg-[#0b0b0f]",
    textClass: "text-[#e5e7eb]",
    controlClass: "bg-[#0b0b0f]/85 border-white/20",
    borderClass: "border-white/15",
    proseClass: "prose-invert",
    swatchClass: "bg-[#0b0b0f] border border-white/20",
    style: {
      backgroundImage:
        "radial-gradient(circle at 16% 18%, rgba(255,255,255,0.06), transparent 26%), radial-gradient(circle at 84% 12%, rgba(255,255,255,0.05), transparent 18%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.04), transparent 24%)"
    },
    isDark: true
  }
];

export function ArticleReader({ article, isSubscriber, initialSaved = false, initialProgress = 0 }: Props) {
  const [fontScale, setFontScale] = useState(100);
  const [saved, setSaved] = useState(initialSaved);
  const [progress, setProgress] = useState(initialProgress);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<ReadingTheme["id"]>("clean");

  const theme = useMemo(() => themes.find((t) => t.id === themeId) || themes[0], [themeId]);

  const clampFont = (next: number) => Math.min(120, Math.max(90, next));

  useEffect(() => {
    document.body.classList.add("no-sakura");
    return () => document.body.classList.remove("no-sakura");
  }, []);

  useEffect(() => {
    if (!initialProgress) return;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    if (scrollable > 0) {
      const target = Math.min(scrollable, Math.round((initialProgress / 100) * scrollable));
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  }, [initialProgress]);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const current = scrollable > 0 ? Math.min(100, Math.round((doc.scrollTop / scrollable) * 100)) : 0;
      setProgress(current);
    };
    handleScroll();
    const onScroll = () => window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isSubscriber) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        await fetch("/api/articles/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken()
          },
          body: JSON.stringify({ slug: article.slug, progress }),
          signal: controller.signal
        });
      } catch {
        // ignore
      }
    }, 500);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [article.slug, isSubscriber, progress]);

  const toggleSave = async () => {
    setStatusMessage(null);
    const next = !saved;
    setSaved(next);
    const res = await fetch("/api/articles/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": getCsrfToken()
      },
      body: JSON.stringify({ slug: article.slug, action: next ? "save" : "unsave" })
    });
    if (!res.ok) {
      setSaved(!next);
      const err = await res.json().catch(() => ({}));
      setStatusMessage(err.error || "İşlem başarısız");
    } else {
      setStatusMessage(next ? "Kaydedildi" : "Kaydın kaldırıldı");
    }
  };

  const progressLabel = useMemo(() => `${progress}%`, [progress]);
  const progressTrack = theme.isDark ? "bg-white/20" : "bg-secondary/60";
  const progressText = theme.isDark ? "text-slate-200" : "text-muted-foreground";
  const saveIdleClass = theme.isDark ? "border border-white/40 bg-white/5 text-white" : "border border-border bg-background text-foreground";

  return (
    <div
      className={cn(
        "mx-[-1.5rem] w-[calc(100%+3rem)] sm:mx-auto sm:w-full max-w-4xl space-y-8 rounded-none border-x-0 sm:rounded-3xl sm:border shadow-lg transition-colors duration-300 p-4 sm:p-6 md:p-8",
        theme.bgClass,
        theme.textClass,
        theme.borderClass
      )}
      style={theme.style}
    >
      <div
        className={cn(
          "sticky top-16 z-20 flex flex-wrap items-center gap-3 md:gap-4 rounded-2xl border p-3 shadow-md backdrop-blur transition-colors duration-200",
          theme.controlClass
        )}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFontScale((v) => clampFont(v - 5))}
            className="rounded-full border border-border px-3 py-1 text-sm"
          >
            A-
          </button>
          <span className="text-sm text-muted-foreground w-12 text-center">{fontScale}%</span>
          <button
            type="button"
            onClick={() => setFontScale((v) => clampFont(v + 5))}
            className="rounded-full border border-border px-3 py-1 text-sm"
          >
            A+
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">Zemin</span>
          <div className="flex items-center gap-2">
            {themes.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setThemeId(opt.id)}
                aria-pressed={themeId === opt.id}
                aria-label={`${opt.label} tema`}
                className={cn(
                  "h-8 w-8 rounded-lg border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
                  opt.swatchClass,
                  themeId === opt.id ? "ring-2 ring-primary scale-105" : "hover:-translate-y-0.5"
                )}
                style={opt.style}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSave}
            className={cn("rounded-full px-4 py-2 text-sm transition", saved ? "bg-emerald-600 text-white" : saveIdleClass)}
          >
            {saved ? "Kaydedildi" : "Kaydet"}
          </button>
          {statusMessage && <span className="text-xs opacity-80">{statusMessage}</span>}
        </div>
        {isSubscriber && (
          <div className="ml-auto flex items-center gap-2 min-w-[180px]">
            <div className={cn("h-2 flex-1 rounded-full overflow-hidden", progressTrack)}>
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className={cn("text-xs w-10 text-right", progressText)}>{progressLabel}</span>
          </div>
        )}
      </div>
      <ArticleAudio src={article.audioUrl || undefined} />
      <ArticleContent
        content={article.content}
        isSubscriber={isSubscriber}
        fontScale={fontScale}
        className={theme.proseClass}
      />
    </div>
  );
}
