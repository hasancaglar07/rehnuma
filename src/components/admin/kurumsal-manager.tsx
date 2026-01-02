"use client";

import { useEffect, useMemo, useState } from "react";
import { getCsrfToken } from "@/utils/client-cookies";
import { DEFAULT_CORPORATE_CONTENT, type CorporateContent } from "@/lib/kurumsal";

export function KurumsalManager() {
  const [form, setForm] = useState<CorporateContent>(DEFAULT_CORPORATE_CONTENT);
  const [initialForm, setInitialForm] = useState<CorporateContent>(DEFAULT_CORPORATE_CONTENT);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kurumsal")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) {
          setForm(data.content);
          setInitialForm(data.content);
        }
      })
      .catch(() => setStatus("Kurumsal verisi alinamadi"));
  }, []);

  const updateLandingField = (key: "landingTitle" | "landingDescription", value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateCard = (key: keyof CorporateContent["cards"], value: string) => {
    setForm((prev) => ({ ...prev, cards: { ...prev.cards, [key]: value } }));
  };

  const updateHakkimizdaField = (key: "title" | "description", value: string) => {
    setForm((prev) => ({ ...prev, hakkimizda: { ...prev.hakkimizda, [key]: value } }));
  };

  const updateHakkimizdaParagraph = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      hakkimizda: {
        ...prev.hakkimizda,
        paragraphs: prev.hakkimizda.paragraphs.map((item, idx) => (idx === index ? value : item))
      }
    }));
  };

  const updateMisyonField = (key: "title" | "description" | "body", value: string) => {
    setForm((prev) => ({ ...prev, misyon: { ...prev.misyon, [key]: value } }));
  };

  const updateMisyonBullet = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      misyon: {
        ...prev.misyon,
        bullets: prev.misyon.bullets.map((item, idx) => (idx === index ? value : item))
      }
    }));
  };

  const updateVizyonField = (key: "title" | "description" | "body", value: string) => {
    setForm((prev) => ({ ...prev, vizyon: { ...prev.vizyon, [key]: value } }));
  };

  const updateVizyonBullet = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      vizyon: {
        ...prev.vizyon,
        bullets: prev.vizyon.bullets.map((item, idx) => (idx === index ? value : item))
      }
    }));
  };

  const updateKunyeField = (key: "title" | "description", value: string) => {
    setForm((prev) => ({ ...prev, kunye: { ...prev.kunye, [key]: value } }));
  };

  const updateKunyeSectionTitle = (sectionIndex: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      kunye: {
        ...prev.kunye,
        sections: prev.kunye.sections.map((section, idx) => (idx === sectionIndex ? { ...section, title: value } : section))
      }
    }));
  };

  const updateKunyeItem = (sectionIndex: number, itemIndex: number, field: "label" | "value", value: string) => {
    setForm((prev) => ({
      ...prev,
      kunye: {
        ...prev.kunye,
        sections: prev.kunye.sections.map((section, idx) => {
          if (idx !== sectionIndex) return section;
          return {
            ...section,
            items: section.items.map((item, itemIdx) => (itemIdx === itemIndex ? { ...item, [field]: value } : item))
          };
        })
      }
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    const res = await fetch("/api/kurumsal", {
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
    if (data?.content) {
      setForm(data.content);
      setInitialForm(data.content);
    }
    setStatus("Guncellendi");
    setLastSavedAt(new Date().toLocaleString("tr-TR"));
  };

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm]);

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <h2 className="text-lg font-semibold">Kurumsal Giris</h2>
        <input
          value={form.landingTitle}
          onChange={(e) => updateLandingField("landingTitle", e.target.value)}
          placeholder="Baslik"
          className="border rounded-lg p-3 bg-background"
        />
        <textarea
          value={form.landingDescription}
          onChange={(e) => updateLandingField("landingDescription", e.target.value)}
          placeholder="Aciklama"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
      </div>

      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <h2 className="text-lg font-semibold">Kurumsal Kartlari</h2>
        <textarea
          value={form.cards.hakkimizda}
          onChange={(e) => updateCard("hakkimizda", e.target.value)}
          placeholder="Hakkimizda kart aciklamasi"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
        <textarea
          value={form.cards.misyon}
          onChange={(e) => updateCard("misyon", e.target.value)}
          placeholder="Misyon kart aciklamasi"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
        <textarea
          value={form.cards.vizyon}
          onChange={(e) => updateCard("vizyon", e.target.value)}
          placeholder="Vizyon kart aciklamasi"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
        <textarea
          value={form.cards.kunye}
          onChange={(e) => updateCard("kunye", e.target.value)}
          placeholder="Kunye kart aciklamasi"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
      </div>

      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <h2 className="text-lg font-semibold">Hakkimizda</h2>
        <input
          value={form.hakkimizda.title}
          onChange={(e) => updateHakkimizdaField("title", e.target.value)}
          placeholder="Baslik"
          className="border rounded-lg p-3 bg-background"
        />
        <textarea
          value={form.hakkimizda.description}
          onChange={(e) => updateHakkimizdaField("description", e.target.value)}
          placeholder="Ust aciklama"
          className="border rounded-lg p-3 bg-background"
          rows={2}
        />
        <div className="grid gap-2">
          {form.hakkimizda.paragraphs.map((paragraph, index) => (
            <textarea
              key={`hakkimizda-${index}`}
              value={paragraph}
              onChange={(e) => updateHakkimizdaParagraph(index, e.target.value)}
              placeholder={`Paragraf ${index + 1}`}
              className="border rounded-lg p-3 bg-background"
              rows={3}
            />
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <h2 className="text-lg font-semibold">Misyon</h2>
        <input
          value={form.misyon.title}
          onChange={(e) => updateMisyonField("title", e.target.value)}
          placeholder="Baslik"
          className="border rounded-lg p-3 bg-background"
        />
        <textarea
          value={form.misyon.description}
          onChange={(e) => updateMisyonField("description", e.target.value)}
          placeholder="Ust aciklama"
          className="border rounded-lg p-3 bg-background"
          rows={2}
        />
        <textarea
          value={form.misyon.body}
          onChange={(e) => updateMisyonField("body", e.target.value)}
          placeholder="Ana metin"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
        <div className="grid gap-2">
          {form.misyon.bullets.map((bullet, index) => (
            <input
              key={`misyon-bullet-${index}`}
              value={bullet}
              onChange={(e) => updateMisyonBullet(index, e.target.value)}
              placeholder={`Madde ${index + 1}`}
              className="border rounded-lg p-3 bg-background"
            />
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <h2 className="text-lg font-semibold">Vizyon</h2>
        <input
          value={form.vizyon.title}
          onChange={(e) => updateVizyonField("title", e.target.value)}
          placeholder="Baslik"
          className="border rounded-lg p-3 bg-background"
        />
        <textarea
          value={form.vizyon.description}
          onChange={(e) => updateVizyonField("description", e.target.value)}
          placeholder="Ust aciklama"
          className="border rounded-lg p-3 bg-background"
          rows={2}
        />
        <textarea
          value={form.vizyon.body}
          onChange={(e) => updateVizyonField("body", e.target.value)}
          placeholder="Ana metin"
          className="border rounded-lg p-3 bg-background"
          rows={3}
        />
        <div className="grid gap-2">
          {form.vizyon.bullets.map((bullet, index) => (
            <input
              key={`vizyon-bullet-${index}`}
              value={bullet}
              onChange={(e) => updateVizyonBullet(index, e.target.value)}
              placeholder={`Madde ${index + 1}`}
              className="border rounded-lg p-3 bg-background"
            />
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 bg-background/80 grid gap-3">
        <h2 className="text-lg font-semibold">Kunye</h2>
        <input
          value={form.kunye.title}
          onChange={(e) => updateKunyeField("title", e.target.value)}
          placeholder="Baslik"
          className="border rounded-lg p-3 bg-background"
        />
        <textarea
          value={form.kunye.description}
          onChange={(e) => updateKunyeField("description", e.target.value)}
          placeholder="Ust aciklama"
          className="border rounded-lg p-3 bg-background"
          rows={2}
        />
        <div className="grid gap-3">
          {form.kunye.sections.map((section, sectionIndex) => (
            <div key={`kunye-${sectionIndex}`} className="border border-border/70 rounded-xl p-3 bg-secondary/10 grid gap-2">
              <input
                value={section.title}
                onChange={(e) => updateKunyeSectionTitle(sectionIndex, e.target.value)}
                placeholder="Bolum basligi"
                className="border rounded-lg p-2 bg-background"
              />
              {section.items.map((item, itemIndex) => (
                <div key={`kunye-item-${sectionIndex}-${itemIndex}`} className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={item.label}
                    onChange={(e) => updateKunyeItem(sectionIndex, itemIndex, "label", e.target.value)}
                    placeholder="Etiket"
                    className="border rounded-lg p-2 bg-background"
                  />
                  <input
                    value={item.value}
                    onChange={(e) => updateKunyeItem(sectionIndex, itemIndex, "value", e.target.value)}
                    placeholder="Deger"
                    className="border rounded-lg p-2 bg-background"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground disabled:opacity-70" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {isDirty && <span className="text-xs text-muted-foreground">Kaydedilmemis degisiklik var</span>}
        {lastSavedAt && <span className="text-xs text-muted-foreground">Son kaydetme: {lastSavedAt}</span>}
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </form>
  );
}
