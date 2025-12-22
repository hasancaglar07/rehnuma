import { AdminShell } from "@/components/admin/admin-shell";
import { IssueManager } from "@/components/admin/issue-manager";
import { requireRole } from "@/lib/auth";
import Link from "next/link";

export default async function AdminIssuePage() {
  await requireRole(["admin", "editor"], "/admin/dergi");
  return (
    <div className="min-h-screen">
      <AdminShell
        title="Dergi Yönetimi"
        description="Ay/Yıl ve PDF yüklemeleri"
        actions={
          <Link href="/dergi" className="px-3 py-2 rounded-full border border-border text-sm">
            Dergi arsivi
          </Link>
        }
      >
        <IssueManager />
      </AdminShell>
    </div>
  );
}
