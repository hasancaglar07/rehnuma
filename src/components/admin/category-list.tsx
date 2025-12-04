"use client";
import { useEffect, useMemo, useState } from "react";
import { getCsrfToken } from "@/utils/client-cookies";

type Category = { id: string; name: string; slug: string; order?: number };

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", slug: "" });
  const [editForm, setEditForm] = useState({ name: "", slug: "" });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [categories]
  );

  const handleCreate = async () => {
    if (!createForm.name || !createForm.slug) {
      setStatus("Ad ve slug gerekli");
      return;
    }
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify(createForm)
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Kategori eklenemedi");
      return;
    }
    const data = await res.json();
    setCategories((prev) => [...prev, data.category]);
    setCreateForm({ name: "", slug: "" });
    setStatus("Kategori eklendi");
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify({ id })
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Silme başarısız");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setStatus("Silindi");
  };

  const handleEditStart = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug });
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify({ id, ...editForm })
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Güncelleme başarısız");
      return;
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: editForm.name, slug: editForm.slug } : c))
    );
    setEditingId(null);
    setStatus("Güncellendi");
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const index = sorted.findIndex((c) => c.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    const payload = reordered.map((cat, idx) => ({ id: cat.id, order: idx }));

    setCategories((prev) => {
      const map = Object.fromEntries(payload.map((p) => [p.id, p.order]));
      return prev.map((c) => ({ ...c, order: map[c.id] ?? c.order }));
    });

    await fetch("/api/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify({ items: payload })
    });
  };

  return (
    <div className="grid gap-4">
      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <p className="font-semibold">Yeni Kategori</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={createForm.name}
            onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ad"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={createForm.slug}
            onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="slug"
            className="border rounded-lg p-3 bg-background"
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground w-fit disabled:opacity-70"
        >
          {loading ? "Kaydediliyor..." : "Ekle"}
        </button>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </div>

      <div className="grid gap-3">
        {sorted.map((cat, idx) => (
          <div key={cat.id} className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-background/80">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold">{cat.name}</p>
                <p className="text-sm text-muted-foreground">{cat.slug}</p>
                <p className="text-xs text-muted-foreground">Sıra: {idx + 1}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
                  onClick={() => handleMove(cat.id, "up")}
                  disabled={idx === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
                  onClick={() => handleMove(cat.id, "down")}
                  disabled={idx === sorted.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
                  onClick={() => handleEditStart(cat)}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition text-rose-600"
                  onClick={() => handleDelete(cat.id)}
                >
                  Sil
                </button>
              </div>
            </div>
            {editingId === cat.id && (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ad"
                  className="border rounded-lg p-3 bg-background"
                />
                <input
                  value={editForm.slug}
                  onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="slug"
                  className="border rounded-lg p-3 bg-background"
                />
                <div className="flex items-center gap-3 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate(cat.id)}
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground w-fit"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-muted-foreground"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {sorted.length === 0 && <p className="text-muted-foreground">Kategori bulunamadı.</p>}
      </div>
    </div>
  );
}
