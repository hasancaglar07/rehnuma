"use client";
import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string };

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  return (
    <div className="grid gap-3">
      {categories.map((cat) => (
        <div key={cat.id} className="border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">{cat.name}</p>
            <p className="text-sm text-muted-foreground">{cat.slug}</p>
          </div>
        </div>
      ))}
      {categories.length === 0 && <p className="text-muted-foreground">Kategori bulunamadı.</p>}
    </div>
  );
}
