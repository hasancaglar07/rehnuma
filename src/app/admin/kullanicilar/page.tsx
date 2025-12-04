import { AdminShell } from "@/components/admin/admin-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { UserManager } from "@/components/admin/user-manager";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin("/admin/kullanicilar");
  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminShell title="Kullanıcı Yönetimi" description="Abonelik durumları, ban/rol yönetimi">
        <UserManager />
      </AdminShell>
      <Footer />
    </div>
  );
}
