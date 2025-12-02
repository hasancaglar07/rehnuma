import { AdminShell } from "@/components/admin/admin-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { IssueManager } from "@/components/admin/issue-manager";

export default function AdminIssuePage() {
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
