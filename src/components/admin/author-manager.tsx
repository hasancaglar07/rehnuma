"use client";

import { useEffect, useMemo, useState } from "react";
import { getCsrfToken } from "@/utils/client-cookies";
import { CopyButton } from "@/components/admin/copy-button";

type Author = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  isListed: boolean;
  userId?: string | null;
  _count?: { articles: number };
};

const emptyForm = {
  name: "",
  slug: "",
  bio: "",
  avatarUrl: "",
  website: "",
  instagram: "",
  twitter: "",
  isListed: true
};

export function AuthorManager() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [listFilter, setListFilter] = useState<"all" | "listed" | "hidden">("all");

  const loadAuthors = () => {
    setListLoading(true);
    fetch("/api/authors")
      .then((res) => res.json())
      .then((data) => setAuthors(data.authors ?? []))
      .catch(() => setStatus("Yazarlar yuklenemedi"))
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const filteredAuthors = useMemo(() => {
    const term = search.trim().toLowerCase();
    return authors.filter((author) => {
      const matchesSearch = term
        ? author.name.toLowerCase().includes(term) || author.slug.toLowerCase().includes(term)
        : true;
      const matchesList =
        listFilter === "all" ? true : listFilter === "listed" ? author.isListed : !author.isListed;
      return matchesSearch && matchesList;
    });
  }, [authors, listFilter, search]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      setStatus("Yazar adi gerekli");
      return;
    }
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify(createForm)
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Yazar eklenemedi");
      return;
    }
    setCreateForm({ ...emptyForm });
    loadAuthors();
    setStatus("Yazar eklendi");
  };

  const startEdit = (author: Author) => {
    setEditingId(author.id);
    setEditForm({
      name: author.name,
      slug: author.slug,
      bio: author.bio || "",
      avatarUrl: author.avatarUrl || "",
      website: author.website || "",
      instagram: author.instagram || "",
      twitter: author.twitter || "",
      isListed: author.isListed
    });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.name.trim()) {
      setStatus("Yazar adi gerekli");
      return;
    }
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/authors", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify({ id, ...editForm })
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Guncelleme basarisiz");
      return;
    }
    setEditingId(null);
    loadAuthors();
    setStatus("Guncellendi");
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/authors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify({ id })
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Silme basarisiz");
      return;
    }
    setAuthors((prev) => prev.filter((author) => author.id !== id));
    setStatus("Silindi");
  };

  return (
    <div className="grid gap-4">
      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <p className="font-semibold">Yeni Yazar</p>
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
            placeholder="slug (opsiyonel)"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={createForm.avatarUrl}
            onChange={(e) => setCreateForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            placeholder="Avatar URL"
            className="border rounded-lg p-3 bg-background sm:col-span-2"
          />
          <textarea
            value={createForm.bio}
            onChange={(e) => setCreateForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Bio"
            className="border rounded-lg p-3 bg-background sm:col-span-2"
            rows={3}
          />
          <input
            value={createForm.website}
            onChange={(e) => setCreateForm((f) => ({ ...f, website: e.target.value }))}
            placeholder="Web sitesi"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={createForm.instagram}
            onChange={(e) => setCreateForm((f) => ({ ...f, instagram: e.target.value }))}
            placeholder="Instagram"
            className="border rounded-lg p-3 bg-background"
          />
          <input
            value={createForm.twitter}
            onChange={(e) => setCreateForm((f) => ({ ...f, twitter: e.target.value }))}
            placeholder="Twitter"
            className="border rounded-lg p-3 bg-background"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={createForm.isListed}
              onChange={(e) => setCreateForm((f) => ({ ...f, isListed: e.target.checked }))}
            />
            Listede goster
          </label>
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

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Yazar ara (ad veya slug)"
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <select
          value={listFilter}
          onChange={(e) => setListFilter(e.target.value as typeof listFilter)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="all">Tümü</option>
          <option value="listed">Listede</option>
          <option value="hidden">Gizli</option>
        </select>
        <span className="text-xs text-muted-foreground">
          {filteredAuthors.length}/{authors.length} yazar
        </span>
        {(search || listFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setListFilter("all");
            }}
            className="text-xs text-muted-foreground underline"
          >
            Temizle
          </button>
        )}
      </div>

      <div className="grid gap-3">
        {listLoading && <p className="text-sm text-muted-foreground">Yazarlar yukleniyor...</p>}
        {!listLoading && filteredAuthors.map((author) => (
          <div key={author.id} className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-background/80">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold">{author.name}</p>
                <p className="text-sm text-muted-foreground">{author.slug}</p>
                <p className="text-xs text-muted-foreground">
                  {author._count?.articles ?? 0} yazi
                  {author.userId ? " · Bagli kullanici" : ""}
                  {author.isListed ? " · Listede" : " · Gizli"}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <a href={`/yazarlar/${author.slug}`} className="text-primary underline" target="_blank" rel="noreferrer">
                    Profili ac
                  </a>
                  <CopyButton
                    text={`/yazarlar/${author.slug}`}
                    label="Link kopyala"
                    className="text-xs text-muted-foreground underline"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
                  onClick={() => startEdit(author)}
                >
                  Duzenle
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition text-rose-600"
                  onClick={() => handleDelete(author.id)}
                >
                  Sil
                </button>
              </div>
            </div>
            {editingId === author.id && (
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
                <input
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                  placeholder="Avatar URL"
                  className="border rounded-lg p-3 bg-background sm:col-span-2"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Bio"
                  className="border rounded-lg p-3 bg-background sm:col-span-2"
                  rows={3}
                />
                <input
                  value={editForm.website}
                  onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="Web sitesi"
                  className="border rounded-lg p-3 bg-background"
                />
                <input
                  value={editForm.instagram}
                  onChange={(e) => setEditForm((f) => ({ ...f, instagram: e.target.value }))}
                  placeholder="Instagram"
                  className="border rounded-lg p-3 bg-background"
                />
                <input
                  value={editForm.twitter}
                  onChange={(e) => setEditForm((f) => ({ ...f, twitter: e.target.value }))}
                  placeholder="Twitter"
                  className="border rounded-lg p-3 bg-background"
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.isListed}
                    onChange={(e) => setEditForm((f) => ({ ...f, isListed: e.target.checked }))}
                  />
                  Listede goster
                </label>
                <div className="flex gap-2 text-sm sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate(author.id)}
                    className="px-3 py-1 rounded-full bg-primary text-primary-foreground"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 rounded-full border border-border"
                  >
                    Iptal
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!listLoading && filteredAuthors.length === 0 && <p className="text-muted-foreground">Yazar yok.</p>}
      </div>
    </div>
  );
}
