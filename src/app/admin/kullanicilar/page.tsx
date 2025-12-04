import { AdminShell } from "@/components/admin/admin-shell";
import { UserManager } from "@/components/admin/user-manager";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin("/admin/kullanicilar");
  return (
    <div className="min-h-screen">
      <AdminShell title="Kullanıcı Yönetimi" description="Abonelik durumları, ban/rol yönetimi">
        <UserManager />
      </AdminShell>
    </div>
  );
}
