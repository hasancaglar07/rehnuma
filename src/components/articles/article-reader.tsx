"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArticleAudio } from "./audio-player";
import { ArticleContent } from "./article-content";
import { getCsrfToken } from "@/utils/client-cookies";
import { cn } from "@/lib/cn";

type Props = {
  article: {
    slug: string;
    title: string;
    content: string;
    audioUrl?: string | null;
    shareUrl?: string;
    readingMinutes?: number;
    wordCount?: number;
  };
  isSubscriber: boolean;
  isSignedIn?: boolean;
  initialSaved?: boolean;
  initialProgress?: number;
  loginUrl?: string;
  subscribeUrl?: string;
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

export function ArticleReader({
  article,
  isSubscriber,
  isSignedIn = false,
  initialSaved = false,
  initialProgress = 0,
  loginUrl: loginUrlProp,
  subscribeUrl: subscribeUrlProp
}: Props) {
  const [fontScale, setFontScale] = useState(100);
  const [saved, setSaved] = useState(initialSaved);
  const [progress, setProgress] = useState(initialProgress);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<ReadingTheme["id"]>("clean");
  const [shareCopied, setShareCopied] = useState(false);
  const progressRef = useRef(initialProgress);

  const theme = useMemo(() => themes.find((t) => t.id === themeId) || themes[0], [themeId]);
  const shareUrl = useMemo(() => article.shareUrl || (typeof window !== "undefined" ? window.location.href : ""), [article.shareUrl]);
  const loginUrl = useMemo(
    () => loginUrlProp || `/giris?returnTo=${encodeURIComponent(`/yazi/${article.slug}`)}`,
    [article.slug, loginUrlProp]
  );
  const subscribeUrl = useMemo(() => subscribeUrlProp || "/abonelik", [subscribeUrlProp]);

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
    let ticking = false;
    let lastTs = 0;
    const handleScroll = () => {
      const now = performance.now();
      if (now - lastTs < 80) return;
      lastTs = now;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - doc.clientHeight;
        const current = scrollable > 0 ? Math.min(100, Math.round((doc.scrollTop / scrollable) * 100)) : 0;
        const prev = progressRef.current;
        if (Math.abs(current - prev) >= 1) {
          progressRef.current = current;
          setProgress(current);
        }
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const articleBody = useMemo(
    () => (
      <ArticleContent
        content={article.content}
        isSubscriber={isSubscriber}
        fontScale={fontScale}
        className={theme.proseClass}
        paywallMeta={{
          returnTo: loginUrl,
          isSignedIn,
          hasAudio: Boolean(article.audioUrl),
          wordCount: article.wordCount,
          readingMinutes: article.readingMinutes
        }}
      />
    ),
    [
      article.audioUrl,
      article.content,
      article.readingMinutes,
      article.wordCount,
      fontScale,
      isSignedIn,
      isSubscriber,
      loginUrl,
      theme.proseClass
    ]
  );

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1600);
    } catch {
      setShareCopied(false);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: shareUrl });
        return;
      } catch {
        // ignore
      }
    }
    await copyShare();
  };

  const shareLinks = useMemo(() => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(article.title);
    return {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`
    };
  }, [article.title, shareUrl]);

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
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={nativeShare}
          className="rounded-full border border-border bg-background px-3 py-1.5 transition hover:-translate-y-0.5"
        >
          Paylaş
        </button>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border bg-background px-3 py-1.5 transition hover:-translate-y-0.5"
        >
          Whatsapp
        </a>
        <a
          href={shareLinks.x}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border bg-background px-3 py-1.5 transition hover:-translate-y-0.5"
        >
          X
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border bg-background px-3 py-1.5 transition hover:-translate-y-0.5"
        >
          LinkedIn
        </a>
        <button
          type="button"
          onClick={copyShare}
          className="rounded-full border border-border bg-background px-3 py-1.5 transition hover:-translate-y-0.5"
        >
          {shareCopied ? "Kopyalandı" : "Linki kopyala"}
        </button>
      </div>
      {articleBody}
    </div>
  );
}
