"use client";

import { useEffect, useMemo, useState } from "react";
import { getCsrfToken } from "@/utils/client-cookies";
import { DEFAULT_HOMEPAGE_CONTENT, type HomepageContent } from "@/lib/homepage";

export function HomeManager() {
  const [form, setForm] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [initialForm, setInitialForm] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) {
          const next = { ...DEFAULT_HOMEPAGE_CONTENT, ...data.content };
          setForm(next);
          setInitialForm(next);
        }
      })
      .catch(() => setStatus("Anasayfa verisi alinamadi"));
  }, []);

  const updateField = (key: keyof HomepageContent, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = async (file: File) => {
    setStatus(null);
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("filename", `hero-${file.name}`);
    const res = await fetch("/api/upload", { method: "POST", body, headers: { "x-csrf-token": getCsrfToken() } });
    setUploading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Gorsel yuklenemedi");
      return;
    }
    const data = await res.json();
    updateField("heroImageUrl", data.url || "");
    setStatus("Gorsel yuklendi");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    const res = await fetch("/api/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify(form)
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Kaydedilemedi");
      return;
    }
    const data = await res.json();
    const next = { ...form, ...(data.content || {}) };
    setForm(next);
    setInitialForm(next);
    setStatus("Guncellendi");
    setLastSavedAt(new Date().toLocaleString("tr-TR"));
  };

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm]);

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <h2 className="text-lg font-semibold">Hero</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={form.heroBadge}
            onChange={(e) => updateField("heroBadge", e.target.value)}
            placeholder="Ust etiket"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={form.heroTitle}
            onChange={(e) => updateField("heroTitle", e.target.value)}
            placeholder="Manset"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={form.heroAccent}
            onChange={(e) => updateField("heroAccent", e.target.value)}
            placeholder="Vurgulu metin"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={form.heroImageAlt}
            onChange={(e) => updateField("heroImageAlt", e.target.value)}
            placeholder="Gorsel alt metni"
            className="border rounded-lg p-3 bg-background"
          />
          <textarea
            value={form.heroDescription}
            onChange={(e) => updateField("heroDescription", e.target.value)}
            placeholder="Aciklama"
            className="border rounded-lg p-3 bg-background sm:col-span-2"
            rows={3}
          />
          <input
            value={form.heroPrimaryCtaLabel}
            onChange={(e) => updateField("heroPrimaryCtaLabel", e.target.value)}
            placeholder="Birincil CTA label"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={form.heroPrimaryCtaHref}
            onChange={(e) => updateField("heroPrimaryCtaHref", e.target.value)}
            placeholder="Birincil CTA link"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={form.heroSecondaryCtaLabel}
            onChange={(e) => updateField("heroSecondaryCtaLabel", e.target.value)}
            placeholder="Ikincil CTA label"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={form.heroSecondaryCtaHref}
            onChange={(e) => updateField("heroSecondaryCtaHref", e.target.value)}
            placeholder="Ikincil CTA link"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={form.heroImageUrl}
            onChange={(e) => updateField("heroImageUrl", e.target.value)}
            placeholder="Hero gorsel URL"
            className="border rounded-lg p-3 bg-background sm:col-span-2"
          />
          {form.heroImageUrl?.trim() && (
            <div className="rounded-xl border border-border bg-secondary/20 p-2 sm:col-span-2">
              <p className="text-xs text-muted-foreground mb-2">Onizleme</p>
              <div className="overflow-hidden rounded-lg border border-border/70 bg-background">
                <img src={form.heroImageUrl} alt={form.heroImageAlt || "Hero"} className="w-full max-h-64 object-cover" loading="lazy" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 sm:col-span-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            {uploading && <span className="text-xs text-muted-foreground">Yukleniyor...</span>}
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <h2 className="text-lg font-semibold">Tavsiyeler</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={form.recommendationsTitle}
            onChange={(e) => updateField("recommendationsTitle", e.target.value)}
            placeholder="Baslik"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={form.recommendationsDescription}
            onChange={(e) => updateField("recommendationsDescription", e.target.value)}
            placeholder="Aciklama"
            className="border rounded-lg p-3 bg-background"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Tavsiyeler listesi, yazilarin "Tavsiye" isaretine gore otomatik guncellenir.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {isDirty && <span className="text-xs text-muted-foreground">Kaydedilmemis degisiklik var</span>}
        {lastSavedAt && <span className="text-xs text-muted-foreground">Son kaydetme: {lastSavedAt}</span>}
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </form>
  );
}
