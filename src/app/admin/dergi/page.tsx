import { AdminShell } from "@/components/admin/admin-shell";
import { IssueManager } from "@/components/admin/issue-manager";
import { requireRole } from "@/lib/auth";

export default async function AdminIssuePage() {
  await requireRole(["admin", "editor"], "/admin/dergi");
  return (
    <div className="min-h-screen">
      <AdminShell title="Dergi Yönetimi" description="Ay/Yıl ve PDF yüklemeleri">
        <IssueManager />
      </AdminShell>
    </div>
  );
}
