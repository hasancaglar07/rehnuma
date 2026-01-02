import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { KurumsalManager } from "@/components/admin/kurumsal-manager";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminKurumsalPage() {
  await requireAdmin("/admin/kurumsal");
  return (
    <div className="min-h-screen">
      <AdminShell
        title="Kurumsal Yonetimi"
        description="Hakkimizda, misyon, vizyon ve kunye metinlerini guncelle"
        actions={
          <Link href="/kurumsal" className="px-3 py-2 rounded-full border border-border text-sm">
            Kurumsal sayfayi gor
          </Link>
        }
      >
        <KurumsalManager />
      </AdminShell>
    </div>
  );
}
