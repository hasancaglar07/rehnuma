import { AdminShell } from "@/components/admin/admin-shell";
import { UserManager } from "@/components/admin/user-manager";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin("/admin/kullanicilar");
  return (
    <div className="min-h-screen">
      <AdminShell
        title="Kullanıcı Yönetimi"
        description="Abonelik durumları, ban/rol yönetimi"
        actions={
          <Link href="/abonelik" className="px-3 py-2 rounded-full border border-border text-sm">
            Abonelik sayfasi
          </Link>
        }
      >
        <UserManager />
      </AdminShell>
    </div>
  );
}
