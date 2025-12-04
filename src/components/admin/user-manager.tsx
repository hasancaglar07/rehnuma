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

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []));
  }, []);

  const mutate = async (id: string, action: "ban" | "unban" | "promote" | "demote") => {
    setStatus(null);
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      body: JSON.stringify({ id, action })
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

  return (
    <div className="grid gap-3">
      {users.map((user) => (
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
                  onClick={() => mutate(user.id, "ban")}
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
        </div>
      ))}
      {users.length === 0 && <p className="text-muted-foreground">Kullanıcı yok.</p>}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
