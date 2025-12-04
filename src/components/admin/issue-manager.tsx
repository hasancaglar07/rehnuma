"use client";
import { useEffect, useState } from "react";
import { getCsrfToken } from "@/utils/client-cookies";

type IssueArticleLink = {
  id: string;
  article: { id: string; title: string; slug: string };
  reviewer?: { id: string; email: string } | null;
  role?: string | null;
  order: number;
};

type Issue = { id: string; month: number; year: number; pdfUrl: string; coverUrl?: string | null; articles?: IssueArticleLink[] };
type ArticleOption = { id: string; title: string; slug: string };
type ReviewerOption = { id: string; email: string; name?: string | null };
type LinkedArticle = { articleId: string; reviewerId?: string; role?: string };

export function IssueManager() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"cover" | "pdf" | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ month: "", year: "", pdfUrl: "", coverUrl: "" });
  const [articleOptions, setArticleOptions] = useState<ArticleOption[]>([]);
  const [reviewers, setReviewers] = useState<ReviewerOption[]>([]);
  const [linkedArticles, setLinkedArticles] = useState<LinkedArticle[]>([]);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ month: "", year: "", pdfUrl: "", coverUrl: "" });
    setLinkedArticles([]);
    setEditingIssueId(null);
  };

  const loadData = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const [issueRes, articleRes, reviewerRes] = await Promise.all([fetch("/api/issues"), fetch("/api/articles?all=1"), fetch("/api/users")]);
      const safeJson = async (res: Response) => {
        const text = await res.text();
        if (!text) return {};
        try {
          return JSON.parse(text);
        } catch {
          return {};
        }
      };

      if (!issueRes.ok) {
        setStatus("Dergi verisi alınamadı");
        return false;
      }
      const issueData = await safeJson(issueRes);
      setIssues(issueData.issues ?? []);

      if (!articleRes.ok) {
        setStatus("Yazılar yüklenemedi");
        return false;
      }
      const articleData = await safeJson(articleRes);
      setArticleOptions(
        (articleData.articles ?? []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug
        }))
      );
      if (reviewerRes.ok) {
        const reviewerData = await safeJson(reviewerRes);
        setReviewers(reviewerData.users ?? []);
      }
      return true;
    } catch (err) {
      console.error("[issue-manager] load failed", err);
      setStatus("Veriler alınamadı");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEdit = (issue: Issue) => {
    setStatus(null);
    setEditingIssueId(issue.id);
    setForm({
      month: String(issue.month),
      year: String(issue.year),
      pdfUrl: issue.pdfUrl,
      coverUrl: issue.coverUrl || ""
    });
    setLinkedArticles(
      (issue.articles ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          articleId: item.article.id,
          reviewerId: item.reviewer?.id,
          role: item.role || ""
        }))
    );
  };

  const handleFileUpload = async (file: File, target: "coverUrl" | "pdfUrl") => {
    setStatus(null);
    setUploading(target === "coverUrl" ? "cover" : "pdf");
    const body = new FormData();
    body.append("file", file);
    body.append("filename", `${target}-${file.name}`);
    const res = await fetch("/api/upload", { method: "POST", body, headers: { "x-csrf-token": getCsrfToken() } });
    setUploading(null);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Yükleme başarısız");
      return;
    }
    const data = await res.json();
    setForm((prev) => ({ ...prev, [target]: data.url }));
    setStatus("Dosya yüklendi");
  };

  const addLinkedArticle = () => {
    const available = articleOptions.find((opt) => !linkedArticles.some((l) => l.articleId === opt.id));
    if (available) {
      setLinkedArticles((prev) => [...prev, { articleId: available.id, role: "yazar" }]);
    }
  };

  const updateLinked = (index: number, patch: Partial<LinkedArticle>) => {
    setLinkedArticles((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const moveLinked = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= linkedArticles.length) return;
    const copy = [...linkedArticles];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setLinkedArticles(copy);
  };

  const removeLinked = (index: number) => {
    setLinkedArticles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    const month = Number(form.month);
    const year = Number(form.year);
    const basePayload = {
      month,
      year,
      pdfUrl: form.pdfUrl,
      coverUrl: form.coverUrl || undefined,
      articles: linkedArticles.map((item, idx) => ({
        articleId: item.articleId,
        reviewerId: item.reviewerId,
        role: item.role,
        order: idx
      }))
    };
    const payload = editingIssueId ? { ...basePayload, id: editingIssueId } : basePayload;
    if (!payload.month || !payload.year || !payload.pdfUrl) {
      setStatus("Ay, yıl ve PDF zorunlu");
      setIsSubmitting(false);
      return;
    }
    if (payload.month < 1 || payload.month > 12) {
      setStatus("Ay 1-12 arasında olmalı");
      setIsSubmitting(false);
      return;
    }
    if (payload.year < 2020) {
      setStatus("Yıl 2020 ve sonrası olmalı");
      setIsSubmitting(false);
      return;
    }
    try {
      const isEditing = Boolean(editingIssueId);
      const res = await fetch(isEditing ? "/api/issues" : "/api/issues/create", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus(err.error || "Hata");
        return;
      }
      resetForm();
      const loaded = await loadData();
      if (loaded) {
        setStatus(isEditing ? "Güncellendi" : "Eklendi");
      }
    } catch (err) {
      console.error("[issue-manager] save failed", err);
      setStatus("Dergi kaydedilemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const editingIssue = editingIssueId ? issues.find((i) => i.id === editingIssueId) : null;

  return (
    <div className="space-y-6">
      {status && <div className="rounded-lg border border-border bg-background/80 px-3 py-2 text-sm">{status}</div>}
      {editingIssue && (
        <div className="rounded-lg border border-border bg-background/70 px-3 py-2 text-sm flex items-center justify-between gap-3">
          <span>
            {editingIssue.month}/{editingIssue.year} sayısını düzenliyorsunuz.
          </span>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setStatus(null);
            }}
            className="text-xs text-muted-foreground underline"
          >
            Düzenlemeyi iptal et
          </button>
        </div>
      )}
      {loading && <div className="text-sm text-muted-foreground">Dergi verileri yükleniyor…</div>}
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="month"
            type="number"
            placeholder="Ay"
            className="border rounded-lg p-3"
            value={form.month}
            onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
            required
          />
          <input
            name="year"
            type="number"
            placeholder="Yıl"
            className="border rounded-lg p-3"
            value={form.year}
            onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">PDF</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              name="pdfUrl"
              placeholder="PDF URL"
              className="border rounded-lg p-3 flex-1"
              value={form.pdfUrl}
              onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))}
              required
            />
            <label className="px-3 py-2 rounded-lg border border-border bg-background text-sm cursor-pointer hover:-translate-y-0.5 transition">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "pdfUrl");
                }}
              />
              {uploading === "pdf" ? "Yükleniyor..." : "Blob'a yükle"}
            </label>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Kapak Görseli (opsiyonel)</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              name="coverUrl"
              placeholder="Kapak URL"
              className="border rounded-lg p-3 flex-1"
              value={form.coverUrl}
              onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
            />
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
              {uploading === "cover" ? "Yükleniyor..." : "Blob'a yükle"}
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Bu sayıya eklenecek yazılar</p>
            <button type="button" onClick={addLinkedArticle} className="text-sm text-primary">
              Yazı ekle
            </button>
          </div>
          {linkedArticles.length === 0 && <p className="text-sm text-muted-foreground">Henüz yazı iliştirilmedi.</p>}
          {linkedArticles.map((item, idx) => (
            <div key={`${item.articleId}-${idx}`} className="grid gap-2 md:grid-cols-[2fr,1.5fr,1fr] items-center">
              <select
                className="border rounded-lg p-2"
                value={item.articleId}
                onChange={(e) => updateLinked(idx, { articleId: e.target.value })}
              >
                {articleOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} disabled={linkedArticles.some((l, lIdx) => lIdx !== idx && l.articleId === opt.id)}>
                    {opt.title}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-lg p-2"
                value={item.reviewerId || ""}
                onChange={(e) => updateLinked(idx, { reviewerId: e.target.value || undefined })}
              >
                <option value="">Hakem seç (opsiyonel)</option>
                {reviewers.map((rev) => (
                  <option key={rev.id} value={rev.id}>
                    {rev.email}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded-lg p-2 flex-1"
                  placeholder="Rol (yazar/hakem)"
                  value={item.role || ""}
                  onChange={(e) => updateLinked(idx, { role: e.target.value })}
                />
                <div className="flex items-center gap-1">
                  <button type="button" className="rounded-full border border-border px-2 py-1" onClick={() => moveLinked(idx, "up")} disabled={idx === 0}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-border px-2 py-1"
                    onClick={() => moveLinked(idx, "down")}
                    disabled={idx === linkedArticles.length - 1}
                  >
                    ↓
                  </button>
                  <button type="button" className="text-rose-600 text-sm" onClick={() => removeLinked(idx)}>
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground w-fit disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? "Kaydediliyor..." : editingIssueId ? "Güncelle" : "Ekle"}
          </button>
          {editingIssueId && (
            <button
              type="button"
              className="text-sm text-muted-foreground underline"
              onClick={() => {
                resetForm();
                setStatus(null);
              }}
            >
              İptal
            </button>
          )}
        </div>
      </form>
      <div className="grid gap-3">
        {issues.map((issue) => (
          <div
            key={`${issue.year}-${issue.month}-${issue.id}`}
            className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-background/80"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-20 border border-border rounded-lg overflow-hidden bg-secondary/40 text-xs text-muted-foreground flex items-center justify-center">
                  {issue.coverUrl ? <img src={issue.coverUrl} alt="Kapak" className="w-full h-full object-cover" /> : "Kapak"}
                </div>
                <div>
                  <p className="font-semibold">
                    {issue.month}/{issue.year}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{issue.pdfUrl}</p>
                  <div className="flex flex-wrap gap-2 text-xs mt-1">
                    {issue.pdfUrl && (
                      <a className="text-primary underline" href={issue.pdfUrl} target="_blank" rel="noreferrer">
                        PDF'yi aç
                      </a>
                    )}
                    {issue.coverUrl && (
                      <a className="text-primary underline" href={issue.coverUrl} target="_blank" rel="noreferrer">
                        Kapak önizleme
                      </a>
                    )}
                    <span className="text-muted-foreground">Yazı: {issue.articles?.length ?? 0} adet</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingIssueId === issue.id && <span className="text-xs text-emerald-700">Düzenleniyor</span>}
                <button type="button" className="text-sm text-primary underline" onClick={() => startEdit(issue)}>
                  Düzenle
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">İliştirilen Yazılar</p>
              {issue.articles?.length ? (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {issue.articles
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2">
                        <span>{item.article.title}</span>
                        <div className="flex items-center gap-2">
                          {item.role && <span className="text-xs text-muted-foreground">{item.role}</span>}
                          {item.reviewer?.email && <span className="text-xs text-emerald-700">Hakem: {item.reviewer.email}</span>}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Yazı iliştirilmedi.</p>
              )}
            </div>
          </div>
        ))}
        {issues.length === 0 && <p className="text-muted-foreground">Dergi yok.</p>}
      </div>
    </div>
  );
}
