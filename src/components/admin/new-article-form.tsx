"use client";
import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCsrfToken } from "@/utils/client-cookies";
import { normalizeEmphasisSpacing } from "@/utils/markdown";
import { slugify } from "@/utils/slugify";

const MarkdownPreview = (props: ComponentProps<typeof ReactMarkdown>) => {
  return <ReactMarkdown {...props} />;
};

type Category = { id: string; name: string; slug: string };
type UploadTarget = "coverUrl" | "audioUrl";

const schema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  slug: z
    .string()
    .min(3, "Slug en az 3 karakter olmalı")
    .regex(/^[a-z0-9-]+$/, "Slug sadece ingilizce harf, rakam ve tire içerebilir"),
  content: z.string().min(20, "İçerik en az 20 karakter olmalı"),
  categorySlug: z.string().min(1, "Kategori seçin"),
  coverUrl: z.string().url("Geçersiz URL").optional().or(z.literal("")),
  audioUrl: z.string().url("Geçersiz URL").optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  publishAt: z.string().datetime().optional().or(z.literal("")),
  isPaywalled: z.boolean().optional(),
  excerpt: z.string().max(320, "Özet en fazla 320 karakter").optional().or(z.literal("")),
  metaTitle: z.string().max(120, "Meta başlık en fazla 120 karakter").optional().or(z.literal("")),
  metaDescription: z.string().max(220, "Meta açıklama en fazla 220 karakter").optional().or(z.literal(""))
});
type FormValues = z.infer<typeof schema>;

type Mode = "create" | "edit";
type Props = {
  mode?: Mode;
  initialData?: Partial<FormValues> & { slug?: string };
};

const FALLBACK_CATEGORIES: Category[] = [
  { name: "Annelik & Çocuk", slug: "annelik-cocuk", id: "fallback-1" },
  { name: "Maneviyat & İslami İlimler", slug: "maneviyat-islami-ilimler", id: "fallback-2" },
  { name: "Aile & Evlilik", slug: "aile-evlilik", id: "fallback-3" }
];

export function NewArticleForm({ mode = "create", initialData }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    reset,
    setValue,
    setError
  } = useForm<FormValues>({
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      content: initialData?.content ?? "",
      categorySlug: initialData?.categorySlug ?? "",
      coverUrl: initialData?.coverUrl ?? "",
      audioUrl: initialData?.audioUrl ?? "",
      status: initialData?.status ?? "draft",
      publishAt: initialData?.publishAt ?? "",
      isPaywalled: initialData?.isPaywalled ?? false,
      excerpt: initialData?.excerpt ?? "",
      metaTitle: initialData?.metaTitle ?? "",
      metaDescription: initialData?.metaDescription ?? ""
    }
  });
  const contentRegister = register("content");

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error" | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const incoming = Array.isArray(data.categories) ? data.categories : [];
        setCategories(incoming.length ? incoming : FALLBACK_CATEGORIES);
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  const contentValue = watch("content");
  const selectedCategory = watch("categorySlug");
  const titleValue = watch("title");
  const slugValue = watch("slug");

  const categoryOptions = useMemo(() => (categories.length ? categories : FALLBACK_CATEGORIES), [categories]);

  useEffect(() => {
    if (mode === "edit" || slugEdited) return;
    const nextSlug = slugify(titleValue || "");
    setValue("slug", nextSlug, { shouldDirty: Boolean(titleValue), shouldValidate: false });
  }, [titleValue, slugEdited, mode, setValue]);

  useEffect(() => {
    if (!slugValue) {
      setSlugStatus("idle");
      return;
    }
    const normalized = slugify(slugValue);
    if (normalized !== slugValue) {
      setValue("slug", normalized, { shouldDirty: true, shouldValidate: true });
      return;
    }
    if (mode === "edit" && slugValue === initialData?.slug) {
      setSlugStatus("available");
      return;
    }
    const controller = new AbortController();
    setSlugStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/articles/${encodeURIComponent(slugValue)}?preview=1`, { signal: controller.signal });
        setSlugStatus(res.ok ? "taken" : "available");
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setSlugStatus("idle");
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [slugValue, mode, initialData?.slug]);

  type FormatConfig = {
    prefix?: string;
    suffix?: string;
    placeholder?: string;
    block?: boolean;
    multiline?: boolean;
  };

  const applyFormat = (config: FormatConfig) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selection = selectionStart !== selectionEnd ? value.slice(selectionStart, selectionEnd) : config.placeholder ?? "metin";
    const prefix = config.prefix ?? "";
    const suffix = config.suffix ?? "";
    const shouldTrimInner = !config.block && !config.multiline && (prefix === "**" || prefix === "_" || prefix === "*");
    const inner = shouldTrimInner ? selection.trim() || selection : selection;
    let wrapped = inner;

    if (config.multiline) {
      const lines = inner.split("\n").filter((line, idx, arr) => !(arr.length === 1 && !line.trim()));
      const safeLines = lines.length ? lines : [config.placeholder ?? "metin"];
      wrapped = safeLines.map((line) => `${prefix}${line || config.placeholder || ""}`).join("\n");
      if (suffix) wrapped += suffix;
    } else {
      wrapped = `${prefix}${inner}${suffix}`;
    }

    const needsGapBefore = config.block && selectionStart > 0 && value.slice(selectionStart - 2, selectionStart) !== "\n\n";
    const needsGapAfter = config.block && value.slice(selectionEnd, selectionEnd + 2) !== "\n\n";

    const nextValue = `${value.slice(0, selectionStart)}${needsGapBefore ? "\n\n" : ""}${wrapped}${
      needsGapAfter ? "\n\n" : ""
    }${value.slice(selectionEnd)}`;

    setValue("content", nextValue, { shouldDirty: true });
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = selectionStart + (needsGapBefore ? 2 : 0) + wrapped.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const contentLength = contentValue?.length ?? 0;
  const wordCount = contentValue?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const estimatedMinutes = wordCount ? Math.max(1, Math.round(wordCount / 190)) : 0;
  const previewText = contentValue?.trim() ?? "";
  const normalizedPreview = normalizeEmphasisSpacing(previewText);

  const handleFileUpload = async (file: File, target: UploadTarget) => {
    setUploading(target);
    setStatusMessage(null);
    setStatusTone(null);
    const body = new FormData();
    body.append("file", file);
    body.append("filename", `${target}-${file.name}`);
    const res = await fetch("/api/upload", { method: "POST", body, headers: { "x-csrf-token": getCsrfToken() } });
    setUploading(null);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusTone("error");
      setStatusMessage(err.error || "Yükleme başarısız");
      return;
    }
    const data = await res.json();
    setValue(target, data.url, { shouldDirty: true });
    setStatusTone("success");
    setStatusMessage("Dosya yüklendi");
  };

  const onSubmit = handleSubmit(async (values) => {
    setStatusMessage(null);
    setStatusTone(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fields = Array.from(new Set(parsed.error.issues.map((issue) => issue.path[0] as string)));
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormValues;
        setError(key, { type: "manual", message: issue.message });
      });
      setStatusTone("error");
      setStatusMessage(`Eksik ya da hatalı alanları düzeltin: ${fields.join(", ")}`);
      requestAnimationFrame(() => {
        const firstError = document.querySelector("[data-field-error='true']");
        if (firstError instanceof HTMLElement) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (slugStatus === "taken" && mode === "create") {
      setStatusTone("error");
      setStatusMessage("Bu slug başka bir yazıda kullanılıyor.");
      return;
    }
    const payload = {
      ...parsed.data,
      coverUrl: parsed.data.coverUrl || undefined,
      audioUrl: parsed.data.audioUrl || undefined,
      publishAt: parsed.data.publishAt || undefined,
      excerpt: parsed.data.excerpt || undefined,
      metaTitle: parsed.data.metaTitle || undefined,
      metaDescription: parsed.data.metaDescription || undefined,
      isPaywalled: parsed.data.isPaywalled ?? false
    };
    const endpoint = mode === "edit" ? "/api/articles/update" : "/api/articles/create";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusTone("error");
      setStatusMessage(err.error || "Kaydedilemedi, alanları kontrol edin.");
      return;
    }
    setStatusTone("success");
    setStatusMessage(mode === "edit" ? "Güncellendi" : "Kaydedildi");
    if (mode === "create") {
      reset({
        status: "draft",
        title: "",
        slug: "",
        content: "",
        categorySlug: selectedCategory,
        coverUrl: "",
        audioUrl: "",
        publishAt: "",
        isPaywalled: false,
        excerpt: "",
        metaTitle: "",
        metaDescription: ""
      });
    }
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Başlık</label>
        <input
          {...register("title")}
          placeholder="Başlık"
          className="border rounded-lg p-3 bg-background"
          onBlur={(e) => {
            const normalized = slugify(e.target.value);
            if (!slugEdited && mode === "create") {
              setValue("slug", normalized, { shouldDirty: true });
            }
          }}
        />
        {errors.title && <p className="text-sm text-rose-600" data-field-error="true">{errors.title.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Slug</label>
        <input
          {...register("slug", {
            onChange: () => setSlugEdited(true),
            onBlur: (e) => {
              const normalized = slugify(e.target.value);
              setValue("slug", normalized, { shouldDirty: true });
            }
          })}
          placeholder="slug"
          className="border rounded-lg p-3 bg-background"
          readOnly={mode === "edit"}
        />
        {errors.slug && <p className="text-sm text-rose-600" data-field-error="true">{errors.slug.message}</p>}
        {mode === "create" && slugValue && (
          <p className="text-xs text-muted-foreground">
            Slug durumu:{" "}
            {slugStatus === "checking"
              ? "Kontrol ediliyor…"
              : slugStatus === "taken"
                ? "Kullanımda"
                : "Uygun"}
          </p>
        )}
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium">İçerik</label>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{wordCount} kelime</span>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <span>{wordCount ? `~${estimatedMinutes} dk` : "Okuma süresi yok"}</span>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <span>{contentLength} karakter</span>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="rounded-xl border border-border bg-background/80 p-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "# ", block: true, placeholder: "Bölüm Başlığı" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "## ", block: true, placeholder: "Alt Başlık" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "**", suffix: "**", placeholder: "vurgulu" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  Kalın
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "_", suffix: "_", placeholder: "italik" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  İtalik
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "- ", multiline: true, block: true, placeholder: "Madde" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  Liste
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "1. ", multiline: true, block: true, placeholder: "Adım" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  Numaralı
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "> ", multiline: true, block: true, placeholder: "Alıntı" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  Alıntı
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "[", suffix: "](https://...)", placeholder: "link metni" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  Bağlantı
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "```\n", suffix: "\n```", block: true, placeholder: "kod" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  Kod
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat({ prefix: "---", block: true, placeholder: "" })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium transition hover:-translate-y-0.5"
                >
                  Ayraç
                </button>
              </div>
              <textarea
                {...contentRegister}
                ref={(el) => {
                  contentRegister.ref(el);
                  contentRef.current = el;
                }}
                placeholder="Başlangıç, giriş, alt başlıklar ve güçlü alıntılarla zenginleştirin."
                className="mt-3 min-h-[240px] w-full rounded-xl border border-border bg-background/70 p-4 font-serif leading-7 shadow-inner"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Markdown destekli: # başlık, **kalın**, _italik_, listeler, alıntı ve kod blokları.</span>
              </div>
              {errors.content && <p className="text-sm text-rose-600">{errors.content.message}</p>}
            </div>
          </div>
          <div className="rounded-xl border border-border/80 bg-secondary/40 p-3 shadow-inner">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Canlı önizleme</span>
              <span className="text-xs text-muted-foreground">Okuyucunun göreceği düzen</span>
            </div>
            <div className="mt-3 max-h-[520px] overflow-y-auto rounded-lg bg-background/70 p-3">
              {previewText ? (
              <div className="prose prose-sm md:prose prose-headings:font-serif prose-p:leading-relaxed prose-li:leading-relaxed prose-img:rounded-xl max-w-none">
                  <MarkdownPreview remarkPlugins={[remarkGfm]}>{normalizedPreview}</MarkdownPreview>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Metin yazmaya başladığınızda burada biçimli önizleme görünecek.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Kategori</label>
        <select {...register("categorySlug")} className="border rounded-lg p-3 bg-background">
          <option value="">Kategori seçin</option>
          {categoryOptions.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categorySlug && <p className="text-sm text-rose-600" data-field-error="true">{errors.categorySlug.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Durum</label>
        <select {...register("status")} className="border rounded-lg p-3 bg-background">
          <option value="draft">Taslak</option>
          <option value="published">Yayınla</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Yayın Zamanı</label>
        <input
          type="datetime-local"
          {...register("publishAt")}
          className="border rounded-lg p-3 bg-background"
        />
        <p className="text-xs text-muted-foreground">Boş bırakılırsa hemen yayınlanır. Gelecek tarih planlama için.</p>
      </div>

      <div className="grid gap-2">
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" {...register("isPaywalled")} className="h-4 w-4" />
          Paywall (abonelik gereksin)
        </label>
        <p className="text-xs text-muted-foreground">İşaretlenirse ödeme duvarı arkasına alınır.</p>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Özet</label>
        <textarea
          {...register("excerpt")}
          placeholder="En fazla 320 karakter"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
        {errors.excerpt && <p className="text-sm text-rose-600">{errors.excerpt.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Meta Başlık</label>
        <input {...register("metaTitle")} placeholder="SEO başlık (opsiyonel)" className="border rounded-lg p-3 bg-background" />
        {errors.metaTitle && <p className="text-sm text-rose-600">{errors.metaTitle.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Meta Açıklama</label>
        <textarea
          {...register("metaDescription")}
          placeholder="SEO açıklaması (opsiyonel)"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
        {errors.metaDescription && <p className="text-sm text-rose-600">{errors.metaDescription.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Kapak Görseli</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input {...register("coverUrl")} placeholder="Kapak URL" className="border rounded-lg p-3 bg-background flex-1" />
          <label className="px-3 py-2 rounded-lg border border-border bg-background text-sm cursor-pointer hover:-translate-y-0.5 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "coverUrl");
              }}
            />
            {uploading === "coverUrl" ? "Yükleniyor..." : "Blob'a yükle"}
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Görseli yüklerseniz URL otomatik doldurulur (public Blob).</p>
        {errors.coverUrl && <p className="text-sm text-rose-600">{errors.coverUrl.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Ses Dosyası</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input {...register("audioUrl")} placeholder="Audio URL" className="border rounded-lg p-3 bg-background flex-1" />
          <label className="px-3 py-2 rounded-lg border border-border bg-background text-sm cursor-pointer hover:-translate-y-0.5 transition">
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "audioUrl");
              }}
            />
            {uploading === "audioUrl" ? "Yükleniyor..." : "Blob'a yükle"}
          </label>
        </div>
        <p className="text-xs text-muted-foreground">MP3 veya M4A desteklenir. Yüklerseniz player otomatik çalışır.</p>
        {errors.audioUrl && <p className="text-sm text-rose-600">{errors.audioUrl.message}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground w-fit disabled:opacity-70"
        >
          {isSubmitting ? "Kaydediliyor..." : mode === "edit" ? "Güncelle" : "Kaydet"}
        </button>
        {isDirty && <p className="text-xs text-muted-foreground">Kaydedilmemiş değişiklikler var</p>}
        {statusMessage && (
          <p className={`text-sm ${statusTone === "error" ? "text-rose-600" : "text-muted-foreground"}`}>{statusMessage}</p>
        )}
      </div>
    </form>
  );
}
