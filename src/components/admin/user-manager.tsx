"use client";
import { useEffect, useState } from "react";
import { getCsrfToken } from "@/utils/client-cookies";

type User = {
  id: string;
  email: string;
  role: string;
  isBanned: boolean;
  subscription?: { status: string | null; plan: string | null; expiresAt: string | null } | null;
  createdAt: string;
};

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [banFilter, setBanFilter] = useState<"all" | "banned" | "active">("all");
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subForm, setSubForm] = useState({ plan: "", status: "", expiresAt: "" });

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []));
  }, []);

  const mutate = async (id: string, action: "ban" | "unban" | "promote" | "demote", reason?: string) => {
    setStatus(null);
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify({ id, action, reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "İşlem başarısız");
      return;
    }
    const data = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)));
    setStatus("Güncellendi");
  };

  const updateSubscription = async (userId: string) => {
    setStatus(null);
    const body: Record<string, unknown> = { id: userId, action: "subscription" };
    if (subForm.plan) body.plan = subForm.plan;
    if (subForm.status) body.status = subForm.status;
    if (subForm.expiresAt) body.expiresAt = subForm.expiresAt;
    if (!subForm.plan && !subForm.status && !subForm.expiresAt) {
      setStatus("Plan, durum veya bitiş tarihi girin");
      return;
    }
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Abonelik güncellenemedi");
      return;
    }
    const data = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data.user } : u)));
    setEditingSubId(null);
    setStatus("Abonelik güncellendi");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = search
      ? user.email.toLowerCase().includes(search.toLowerCase()) || user.role.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
    const matchesBan = banFilter === "all" ? true : banFilter === "banned" ? user.isBanned : !user.isBanned;
    return matchesSearch && matchesRole && matchesBan;
  });

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="E-posta veya rol ara"
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="all">Rol: Tümü</option>
          <option value="admin">Admin</option>
          <option value="user">Kullanıcı</option>
        </select>
        <select
          value={banFilter}
          onChange={(e) => setBanFilter(e.target.value as "all" | "banned" | "active")}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="all">Ban durumu</option>
          <option value="active">Aktif</option>
          <option value="banned">Banlı</option>
        </select>
      </div>
      {filteredUsers.map((user) => (
        <div key={user.id} className="border border-border rounded-xl p-4 bg-background/80 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                Rol: {user.role} · Abonelik: {user.subscription?.status ?? "yok"} {user.subscription?.plan ? `(${user.subscription.plan})` : ""}
              </p>
              {user.isBanned && <p className="text-sm text-rose-600">Banlı</p>}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {user.isBanned ? (
                <button
                  type="button"
                  onClick={() => mutate(user.id, "unban")}
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
                >
                  Banı Kaldır
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const reason = window.prompt("Ban gerekçesi (opsiyonel)");
                    mutate(user.id, "ban", reason || undefined);
                  }}
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition text-rose-600"
                >
                  Banla
                </button>
              )}
              {user.role === "admin" ? (
                <button
                  type="button"
                  onClick={() => mutate(user.id, "demote")}
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
                >
                  Admin Kaldır
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => mutate(user.id, "promote")}
                  className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
                >
                  Admin Yap
                </button>
              )}
            </div>
          </div>
          {user.subscription?.expiresAt && (
            <p className="text-xs text-muted-foreground">Son geçerlilik: {new Date(user.subscription.expiresAt).toLocaleDateString("tr-TR")}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              className="px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition"
              onClick={() => {
                setEditingSubId(user.id);
                setSubForm({
                  plan: user.subscription?.plan || "",
                  status: user.subscription?.status || "",
                  expiresAt: user.subscription?.expiresAt
                    ? new Date(user.subscription.expiresAt).toISOString().slice(0, 16)
                    : ""
                });
              }}
            >
              Aboneliği Güncelle
            </button>
          </div>
          {editingSubId === user.id && (
            <div className="grid gap-2 border border-border rounded-lg p-3 bg-background/70">
              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  value={subForm.plan}
                  onChange={(e) => setSubForm((f) => ({ ...f, plan: e.target.value }))}
                  className="border rounded-lg p-2 bg-background"
                >
                  <option value="">Plan</option>
                  <option value="monthly">Aylık</option>
                  <option value="yearly">Yıllık</option>
                  <option value="vip">VIP</option>
                </select>
                <select
                  value={subForm.status}
                  onChange={(e) => setSubForm((f) => ({ ...f, status: e.target.value }))}
                  className="border rounded-lg p-2 bg-background"
                >
                  <option value="">Durum</option>
                  <option value="active">Aktif</option>
                  <option value="trial">Deneme</option>
                  <option value="canceled">İptal</option>
                  <option value="expired">Süresi Doldu</option>
                  <option value="inactive">Pasif</option>
                </select>
                <input
                  type="datetime-local"
                  value={subForm.expiresAt}
                  onChange={(e) => setSubForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="border rounded-lg p-2 bg-background"
                />
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => updateSubscription(user.id)}
                  className="px-3 py-1 rounded-full bg-primary text-primary-foreground"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSubId(null)}
                  className="px-3 py-1 rounded-full border border-border"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {filteredUsers.length === 0 && <p className="text-muted-foreground">Kullanıcı yok.</p>}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
