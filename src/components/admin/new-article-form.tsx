"use client";
import { useState } from "react";

export function NewArticleForm() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      content: formData.get("content"),
      categorySlug: formData.get("categorySlug"),
      coverUrl: formData.get("coverUrl"),
      audioUrl: formData.get("audioUrl")
    };
    const res = await fetch("/api/articles/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setStatus(res.ok ? "Kaydedildi" : "Hata");
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <input name="title" placeholder="Başlık" className="border rounded-lg p-3" required />
      <input name="slug" placeholder="slug" className="border rounded-lg p-3" required />
      <textarea name="content" placeholder="İçerik" className="border rounded-lg p-3 min-h-[180px]" required />
      <input name="categorySlug" placeholder="Kategori slug" className="border rounded-lg p-3" required />
      <input name="coverUrl" placeholder="Kapak URL" className="border rounded-lg p-3" />
      <input name="audioUrl" placeholder="Audio URL" className="border rounded-lg p-3" />
      <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground w-fit">
        Yayınla
      </button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </form>
  );
}
