"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCsrfToken } from "@/utils/client-cookies";

type Props = {
  slug: string;
  status: string;
  canPublish?: boolean;
  canDelete?: boolean;
};

export function ArticleRowActions({ slug, status, canPublish = true, canDelete = true }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"publish" | "draft" | "delete" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateStatus = async (nextStatus: "published" | "draft") => {
    setLoading(nextStatus === "published" ? "publish" : "draft");
    setMessage(null);
    try {
      const res = await fetch("/api/articles/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken()
        },
        body: JSON.stringify({ slug, status: nextStatus })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Güncellenemedi");
      }
      setMessage(nextStatus === "published" ? "Yayınlandı" : "Taslağa alındı");
      router.refresh();
    } catch (err: any) {
      setMessage(err.message || "İşlem başarısız");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(`"${slug}" slug'lı yazı silinecek. Emin misiniz?`);
    if (!confirm) return;
    setLoading("delete");
    setMessage(null);
    try {
      const res = await fetch("/api/articles/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken()
        },
        body: JSON.stringify({ slug })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Silinemedi");
      }
      setMessage("Silindi");
      router.refresh();
    } catch (err: any) {
      setMessage(err.message || "İşlem başarısız");
    } finally {
      setLoading(null);
    }
  };

  const isPublished = status === "published";

  return (
    <div className="flex flex-col gap-1 text-sm items-end">
      <div className="flex flex-wrap gap-2">
        {canPublish && (
          <button
            type="button"
            onClick={() => updateStatus(isPublished ? "draft" : "published")}
            disabled={loading !== null}
            className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
          >
            {loading === "publish" || loading === "draft"
              ? "Kaydediliyor..."
              : isPublished
                ? "Taslağa Al"
                : "Yayınla"}
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading !== null}
            className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition text-rose-600"
          >
            {loading === "delete" ? "Siliniyor..." : "Sil"}
          </button>
        )}
      </div>
      {message && <span className="text-xs text-muted-foreground">{message}</span>}
    </div>
  );
}
