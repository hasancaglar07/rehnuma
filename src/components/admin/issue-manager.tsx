"use client";
import { useEffect, useState } from "react";

type Issue = { id: string; month: number; year: number; pdfUrl: string };

export function IssueManager() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => setIssues(data.issues ?? []));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      month: Number(formData.get("month")),
      year: Number(formData.get("year")),
      pdfUrl: formData.get("pdfUrl")
    };
    const res = await fetch("/api/issues/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setStatus(res.ok ? "Eklendi" : "Hata");
    if (res.ok) {
      setIssues((prev) => [
        ...prev,
        { id: `${payload.year}-${payload.month}`, month: payload.month, year: payload.year, pdfUrl: String(payload.pdfUrl) }
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <input name="month" type="number" placeholder="Ay" className="border rounded-lg p-3" required />
          <input name="year" type="number" placeholder="Yıl" className="border rounded-lg p-3" required />
        </div>
        <input name="pdfUrl" placeholder="PDF URL" className="border rounded-lg p-3" required />
        <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground w-fit">
          Ekle
        </button>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </form>
      <div className="grid gap-3">
        {issues.map((issue) => (
          <div key={`${issue.year}-${issue.month}-${issue.id}`} className="border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {issue.month}/{issue.year}
              </p>
              <p className="text-sm text-muted-foreground">{issue.pdfUrl}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
