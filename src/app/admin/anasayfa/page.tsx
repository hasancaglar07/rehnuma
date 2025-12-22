import { AdminShell } from "@/components/admin/admin-shell";
import { HomeManager } from "@/components/admin/home-manager";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  await requireAdmin("/admin/anasayfa");
  return (
    <div className="min-h-screen">
      <AdminShell
        title="Anasayfa Yonetimi"
        description="Hero ve tavsiyeler metinlerini guncelle"
        actions={
          <Link href="/" className="px-3 py-2 rounded-full border border-border text-sm">
            Anasayfayi gor
          </Link>
        }
      >
        <HomeManager />
      </AdminShell>
    </div>
  );
}
