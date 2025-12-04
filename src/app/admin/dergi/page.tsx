import { AdminShell } from "@/components/admin/admin-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { IssueManager } from "@/components/admin/issue-manager";
import { requireAdmin } from "@/lib/auth";

export default async function AdminIssuePage() {
  await requireAdmin("/admin/dergi");
  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminShell title="Dergi Yönetimi" description="Ay/Yıl ve PDF yüklemeleri">
        <IssueManager />
      </AdminShell>
      <Footer />
    </div>
  );
}
