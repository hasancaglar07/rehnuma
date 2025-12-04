"use client";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

type Props = { pdfUrl: string };

type Theme = {
  id: string;
  label: string;
  bg: string;
  text: string;
  border: string;
};

const themes: Theme[] = [
  { id: "light", label: "Beyaz", bg: "bg-white", text: "text-slate-900", border: "border-slate-200" },
  { id: "cream", label: "Krem", bg: "bg-[#fdf8ef]", text: "text-[#2c1b10]", border: "border-[#e6d7bd]" },
  { id: "sepia", label: "Sepya", bg: "bg-[#f3e7d3]", text: "text-[#24170c]", border: "border-[#ddc9a8]" },
  { id: "night", label: "Gece", bg: "bg-[#0f172a]", text: "text-slate-100", border: "border-slate-700" }
];

type PageCache = Map<string, HTMLCanvasElement>;
type OutlineItem = { title: string; page: number };
type PdfModule = typeof import("pdfjs-dist");

const normalizePdfModule = (mod: any): PdfModule => {
  // pdfjs-dist can be ESM or CJS; normalize to the actual API object.
  return (mod && (mod.default || mod)) as PdfModule;
};

export function FlipbookViewer({ pdfUrl }: Props) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [userScale, setUserScale] = useState(1.0);
  const [themeId, setThemeId] = useState<Theme["id"]>("cream");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Array<{ page: number; src: string }>>([]);
  const [showThumbs, setShowThumbs] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [showOutline, setShowOutline] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "spread">("spread");
  const [fitMode, setFitMode] = useState<"fitWidth" | "fitHeight">("fitWidth");
  const [isMobile, setIsMobile] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [resumeInfo, setResumeInfo] = useState<{ page: number } | null>(null);
  const [outlineQuery, setOutlineQuery] = useState("");
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [viewerHeight, setViewerHeight] = useState(420);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cacheRef = useRef<PageCache>(new Map());
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number>(0);
  const swipeRef = useRef<{ x: number; time: number } | null>(null);
  const pdfRef = useRef<PdfModule | null>(null);
  const responsiveInitRef = useRef(false);
  const savedStateRef = useRef<{ page?: number; scale?: number; themeId?: string; viewMode?: "single" | "spread"; fitMode?: "fitWidth" | "fitHeight" } | null>(null);

  const storageKey = useMemo(() => `flipbook:${pdfUrl}`, [pdfUrl]);
  const loadPdfModule = async (): Promise<PdfModule> => {
    if (pdfRef.current) return pdfRef.current;
    let lastErr: unknown = null;
    // Try self-hosted ESM in /public/pdfjs first to avoid bundler resolution issues.
    if (typeof window !== "undefined") {
      try {
        // @ts-expect-error webpackIgnore allows loading from public path at runtime.
        const mod = normalizePdfModule(await import(/* webpackIgnore: true */ "/pdfjs/pdf.min.mjs"));
        pdfRef.current = mod;
        return mod;
      } catch (err) {
        lastErr = err;
        console.warn("[pdf] load failed for /pdfjs/pdf.min.mjs", err);
      }
    }
    try {
      const legacy = normalizePdfModule(await import("pdfjs-dist/legacy/build/pdf.mjs"));
      pdfRef.current = legacy;
      return legacy;
    } catch (err) {
      lastErr = err;
      console.warn("[pdf] load failed for pdfjs-dist/legacy/build/pdf.mjs", err);
    }
    throw lastErr instanceof Error ? lastErr : new Error("pdfjs-dist yüklenemedi");
  };

  const theme = useMemo(() => themes.find((t) => t.id === themeId) || themes[0], [themeId]);

  const cacheKey = (page: number, scale: number) => `${page}-${scale.toFixed(2)}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const mod = await loadPdfModule();
        if (mod.GlobalWorkerOptions) {
          mod.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
        }
        const loaded = await mod.getDocument({
          url: pdfUrl,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/cmaps/",
          cMapPacked: true
        }).promise;
        if (cancelled) return;
        setDoc(loaded as PDFDocumentProxy);
        setNumPages(loaded.numPages || 0);
        setPageNum(1);
      } catch (err) {
        if (cancelled) return;
        setError("PDF yüklenemedi");
        console.error("[pdf] load failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      cacheRef.current.clear();
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        savedStateRef.current = parsed;
      } else {
        savedStateRef.current = null;
      }
    } catch {
      savedStateRef.current = null;
    }
  }, [storageKey]);

  useEffect(() => {
    const update = () => {
      const mobile = typeof window !== "undefined" && window.innerWidth < 900;
      setIsMobile(mobile);
      if (!responsiveInitRef.current) {
        setViewMode(mobile ? "single" : "spread");
        setShowThumbs(!mobile);
        setImmersiveMode(mobile);
        responsiveInitRef.current = true;
      }
      const h = typeof window !== "undefined" ? Math.max(420, window.innerHeight - (mobile ? 160 : 220)) : 420;
      setViewerHeight(h);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!numPages) return;
    const saved = savedStateRef.current;
    if (!saved) return;
    if (saved.page) {
      const next = Math.min(numPages, Math.max(1, saved.page));
      setPageNum(next);
      if (next > 1) setResumeInfo({ page: next });
    }
    if (saved.scale) setUserScale(Math.min(2.5, Math.max(0.6, saved.scale)));
    if (saved.themeId) setThemeId(saved.themeId as Theme["id"]);
    if (saved.viewMode) setViewMode(saved.viewMode);
    if (saved.fitMode) setFitMode(saved.fitMode);
  }, [numPages]);

  useEffect(() => {
    if (!doc) {
      setOutline([]);
      return;
    }
    let cancelled = false;
    const loadOutline = async () => {
      try {
        const outlineData = await doc.getOutline();
        if (!outlineData || cancelled) return;

        const entries: OutlineItem[] = [];
        const walk = async (items: any[]) => {
          for (const item of items) {
            if (!item) continue;
            const dest = item.dest;
            let pageIndex: number | null = null;
            if (dest) {
              const resolved = Array.isArray(dest) ? dest : await doc.getDestination(dest);
              if (resolved && resolved[0]) {
                pageIndex = await doc.getPageIndex(resolved[0]);
              }
            }
            if (pageIndex !== null && pageIndex >= 0) {
              entries.push({ title: item.title || "Başlık", page: pageIndex + 1 });
            }
            if (item.items?.length) {
              await walk(item.items);
            }
          }
        };
        await walk(outlineData);
        if (!cancelled) setOutline(entries);
      } catch (e) {
        console.warn("[pdf] outline fetch failed", e);
      }
    };
    loadOutline();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  useEffect(() => {
    if (!doc) {
      setThumbnails([]);
      return;
    }
    let cancelled = false;
    setThumbnails([]);

    const buildThumbs = async () => {
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelled) break;
        try {
          const page = await doc.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          const targetWidth = 140;
          const thumbScale = Math.min(0.6, Math.max(0.2, targetWidth / baseViewport.width));
          const viewport = page.getViewport({ scale: thumbScale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          if (cancelled) break;
          setThumbnails((prev) => [...prev, { page: i, src: canvas.toDataURL("image/png") }]);
        } catch (e) {
          console.warn("[pdf] thumb failed", e);
        }
      }
    };
    buildThumbs();

    return () => {
      cancelled = true;
    };
  }, [doc]);

  useEffect(() => {
    const renderPage = async () => {
      if (!doc || !canvasRef.current || !containerRef.current) return;

      const pages: number[] =
        viewMode === "spread" && pageNum < numPages ? [pageNum, pageNum + 1] : [pageNum];

      const firstPage = await doc.getPage(pages[0]);
      const baseViewport = firstPage.getViewport({ scale: 1 });
      const containerWidth = containerRef.current.clientWidth || baseViewport.width;
      const availableHeight = viewerHeight || (typeof window !== "undefined" ? window.innerHeight - 200 : baseViewport.height);

      const fitWidthScale = Math.max(0.4, Math.min(2.8, (containerWidth - 24) / (baseViewport.width * pages.length)));
      const fitHeightScale = Math.max(0.4, Math.min(2.8, availableHeight / baseViewport.height));
      const baseScale = fitMode === "fitHeight" ? fitHeightScale : fitWidthScale;
      const finalScale = Math.max(0.4, Math.min(3, baseScale * userScale));

      const views = await Promise.all(
        pages.map(async (p) => {
          const key = cacheKey(p, finalScale);
          const cached = cacheRef.current.get(key);
          if (cached) return cached;
          const page = await doc.getPage(p);
          const viewport = page.getViewport({ scale: finalScale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");
          if (!context) return canvas;
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          cacheRef.current.set(key, canvas);
          return canvas;
        })
      );

      const totalWidth = views.reduce((sum, c) => sum + c.width, 12 * (views.length - 1));
      const maxHeight = Math.max(...views.map((c) => c.height));
      const canvas = canvasRef.current;
      canvas.width = totalWidth;
      canvas.height = maxHeight;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      let offsetX = 0;
      views.forEach((c, idx) => {
        const y = (maxHeight - c.height) / 2;
        context.drawImage(c, offsetX, y);
        offsetX += c.width + (idx === views.length - 1 ? 0 : 12);
      });
    };

    renderPage().catch((err) => {
      console.error("[pdf] render failed", err);
      setError("Sayfa çizilemedi");
    });
  }, [doc, pageNum, userScale, fitMode, viewMode, numPages, viewerHeight]);

  const step = viewMode === "spread" ? 2 : 1;
  const nextPage = () => setPageNum((p) => Math.min(numPages, p + step));
  const prevPage = () => setPageNum((p) => Math.max(1, p - step));
  const zoomIn = () => setUserScale((s) => Math.min(2.5, s + 0.1));
  const zoomOut = () => setUserScale((s) => Math.max(0.6, s - 0.1));
  const fitWidth = () => setFitMode("fitWidth");
  const fitHeight = () => setFitMode("fitHeight");

  const toggleFullscreen = () => {
    const node = wrapperRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      node.requestFullscreen().catch(() => undefined);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key.toLowerCase() === "f") toggleFullscreen();
      if (e.key.toLowerCase() === "o") setShowOutline((v) => !v);
      if (e.key.toLowerCase() === "t") setShowThumbs((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [numPages]);

  useEffect(() => {
    if (!numPages) return;
    if (typeof window === "undefined") return;
    const payload = { page: pageNum, scale: userScale, themeId, viewMode, fitMode };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore write failures
    }
  }, [pageNum, userScale, themeId, viewMode, fitMode, storageKey, numPages]);

  useEffect(() => {
    const show = () => {
      setControlsVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setControlsVisible(false), 2200);
    };
    const node = wrapperRef.current;
    if (!node) return;
    if (isMobile) {
      setControlsVisible(true);
      return;
    }
    node.addEventListener("pointermove", show);
    node.addEventListener("pointerdown", show);
    show();
    return () => {
      node.removeEventListener("pointermove", show);
      node.removeEventListener("pointerdown", show);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isMobile]);

  useEffect(() => {
    if (immersiveMode) {
      setShowThumbs(false);
      setShowOutline(false);
      setControlsVisible(true);
    }
  }, [immersiveMode]);

  const handleDoubleTap = () => {
    setUserScale((s) => (s < 1.2 ? 1.6 : 1.0));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      handleDoubleTap();
    }
    lastTapRef.current = now;
    swipeRef.current = { x: e.clientX, time: now };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const swipe = swipeRef.current;
    if (!swipe) return;
    const dx = e.clientX - swipe.x;
    const dt = Date.now() - swipe.time;
    if (dt < 400 && Math.abs(dx) > 60) {
      if (dx < 0) nextPage();
      else prevPage();
    }
    swipeRef.current = null;
  };

  const progress = numPages ? Math.round((pageNum / numPages) * 100) : 0;
  const pageLabel = `${pageNum} / ${numPages || "?"}`;
  const controlsAreVisible = controlsVisible || isMobile || immersiveMode;
  const toggleViewMode = () => setViewMode((v) => (v === "spread" ? "single" : "spread"));
  const handleSliderChange = (value: number) => {
    if (!numPages) return;
    const next = Math.max(1, Math.min(numPages, value));
    setPageNum(next);
  };

  const filteredOutline = outlineQuery
    ? outline.filter((item) => item.title.toLowerCase().includes(outlineQuery.toLowerCase()))
    : outline;

  const wrapperClasses = `space-y-3 pb-20 md:pb-4 ${isFullscreen ? "max-h-screen overflow-y-auto" : ""}`;

  return (
    <div className={wrapperClasses} ref={wrapperRef}>
      <div
        className={`flex flex-col gap-3 rounded-2xl border border-border bg-background/80 p-3 shadow-sm transition-opacity duration-200 ${
          controlsAreVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                onClick={prevPage}
                disabled={pageNum <= 1}
                className="rounded-full border px-3 py-1 font-semibold disabled:opacity-50"
                aria-label="Önceki sayfa"
              >
                ←
              </button>
              <button
                onClick={nextPage}
                disabled={pageNum >= numPages}
                className="rounded-full border px-3 py-1 font-semibold disabled:opacity-50"
                aria-label="Sonraki sayfa"
              >
                →
              </button>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <input
                type="range"
                min={1}
                max={numPages || 1}
                value={pageNum}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                aria-label="Sayfa seç"
              />
              <span className="rounded-md border bg-background px-2 py-1 text-xs text-foreground">{pageLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <label htmlFor="goto-page" className="hidden sm:inline">
                Git
              </label>
              <input
                id="goto-page"
                type="number"
                min={1}
                max={numPages || 1}
                value={pageNum}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-16 rounded-md border border-border bg-background px-2 py-1 text-right text-xs"
                aria-label="Sayfa numarası gir"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <button onClick={zoomOut} className="rounded-full border px-3 py-1 font-semibold">
              -
            </button>
            <button
              onClick={fitWidth}
              className={`rounded-full border px-3 py-1 font-semibold ${fitMode === "fitWidth" ? "bg-primary/10 text-foreground" : ""}`}
            >
              Genişlik
            </button>
            <button
              onClick={fitHeight}
              className={`rounded-full border px-3 py-1 font-semibold ${fitMode === "fitHeight" ? "bg-primary/10 text-foreground" : ""}`}
            >
              Yükseklik
            </button>
            <button onClick={zoomIn} className="rounded-full border px-3 py-1 font-semibold">
              +
            </button>
            <button onClick={toggleViewMode} className="rounded-full border px-3 py-1 font-semibold">
              {viewMode === "spread" ? "Tek sayfa" : "Çift sayfa"}
            </button>
            <button
              onClick={() => setImmersiveMode((v) => !v)}
              className={`rounded-full border px-3 py-1 font-semibold ${immersiveMode ? "bg-primary/10 text-foreground" : ""}`}
            >
              {immersiveMode ? "Sade mod açık" : "Sade mod"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              aria-label={`Tema ${t.label}`}
              className={`h-6 w-6 rounded-full border ${t.border} ${t.bg} ${themeId === t.id ? "ring-2 ring-primary" : ""}`}
            />
          ))}
          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <button
              onClick={() => setShowThumbs((v) => !v)}
              className="rounded-full border px-3 py-1 font-semibold"
              aria-pressed={showThumbs}
            >
              {showThumbs ? "Önizleme kapat" : "Önizleme aç"}
            </button>
            <button onClick={() => setShowOutline((v) => !v)} className="rounded-full border px-3 py-1 font-semibold">
              {showOutline ? "İçindekiler kapat" : "İçindekiler"}
            </button>
            <button onClick={toggleFullscreen} className="rounded-full border px-3 py-1 font-semibold">
              {isFullscreen ? "Tam ekran çık" : "Tam ekran"}
            </button>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border px-3 py-1 font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground"
            >
              İndir/Aç
            </a>
          </div>
        </div>
      </div>

      {resumeInfo && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary md:w-max">
          <span className="font-semibold">Kaldığın yerden devam</span>
          <button
            onClick={() => setPageNum(resumeInfo.page)}
            className="rounded-full border border-primary/60 px-3 py-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground"
          >
            Sayfa {resumeInfo.page}
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-background/80 p-3 text-xs text-muted-foreground shadow-sm md:hidden">
        <p className="text-foreground">Mobil ipucu: çift dokun zoom yapar, sağ/sol kaydır sayfa değiştirir.</p>
      </div>

      <div
        ref={containerRef}
        className={`${immersiveMode ? "rounded-none border-0 shadow-none" : "rounded-3xl border shadow-lg"} bg-background/60 ${theme.bg} ${theme.text} ${theme.border}`}
        style={{ minHeight: viewerHeight, maxHeight: isFullscreen ? "calc(100vh - 96px)" : undefined, overflowY: isFullscreen ? "auto" : undefined }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {error && <p className="p-4 text-sm text-rose-600">{error}</p>}
        {loading && <div className="p-4 text-sm text-muted-foreground">PDF yükleniyor...</div>}
        <canvas ref={canvasRef} className="mx-auto block h-auto w-full max-w-full" />
      </div>

      {showThumbs && thumbnails.length > 0 && (
        <div className="rounded-2xl border border-border bg-background/70 p-2 shadow-sm">
          <div className="flex items-center justify-between px-2 pb-2 text-xs text-muted-foreground">
            <span>İçerik önizleme</span>
            <span>{pageLabel}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {thumbnails.map((thumb) => (
              <button
                key={thumb.page}
                onClick={() => setPageNum(thumb.page)}
                className={`relative flex-shrink-0 rounded-lg border transition ${
                  pageNum === thumb.page ? "border-primary/40 ring-2 ring-primary" : "border-border hover:-translate-y-0.5"
                }`}
                aria-label={`Sayfa ${thumb.page}`}
              >
                <img src={thumb.src} alt={`Sayfa ${thumb.page}`} className="h-24 w-auto rounded-lg object-cover sm:h-28" loading="lazy" />
                <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">{thumb.page}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showOutline && outline.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded-2xl border border-border bg-background/80 p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground">İçindekiler</p>
            <input
              type="search"
              value={outlineQuery}
              onChange={(e) => setOutlineQuery(e.target.value)}
              placeholder="Başlıkta ara"
              className="w-40 rounded-md border border-border bg-background px-2 py-1 text-xs"
            />
          </div>
          <div className="grid gap-1 text-sm">
            {filteredOutline.map((item, idx) => (
              <button
                key={`${item.title}-${idx}`}
                onClick={() => setPageNum(item.page)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                  pageNum === item.page ? "border-primary/40 bg-primary/10" : "border-border hover:-translate-y-0.5"
                }`}
              >
                <span className="text-[11px] text-muted-foreground">#{item.page}</span>
                <span className="truncate">{item.title}</span>
              </button>
            ))}
            {filteredOutline.length === 0 && <p className="py-2 text-xs text-muted-foreground">Eşleşen başlık bulunamadı.</p>}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span>{progress}%</span>
      </div>

      {!isFullscreen && (
        <div className="fixed inset-x-0 bottom-3 z-30 px-4 md:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 text-[11px] text-muted-foreground shadow-lg backdrop-blur">
            <button
              onClick={prevPage}
              disabled={pageNum <= 1}
              className="rounded-full border border-border px-2 py-1 font-semibold text-foreground disabled:opacity-40"
              aria-label="Önceki sayfa"
            >
              ←
            </button>
            <input
              type="range"
              min={1}
              max={numPages || 1}
              value={pageNum}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              aria-label="Sayfa seç"
            />
            <button
              onClick={nextPage}
              disabled={pageNum >= numPages}
              className="rounded-full border border-border px-2 py-1 font-semibold text-foreground disabled:opacity-40"
              aria-label="Sonraki sayfa"
            >
              →
            </button>
            <button onClick={zoomOut} className="rounded-full border border-border px-2 py-1 font-semibold text-foreground">
              -
            </button>
            <button onClick={zoomIn} className="rounded-full border border-border px-2 py-1 font-semibold text-foreground">
              +
            </button>
            <button onClick={toggleViewMode} className="rounded-full border border-border px-2 py-1 font-semibold text-foreground">
              {viewMode === "spread" ? "Tek" : "Çift"}
            </button>
          </div>
          <div className="h-4 pb-[env(safe-area-inset-bottom)]" />
        </div>
      )}
    </div>
  );
}
