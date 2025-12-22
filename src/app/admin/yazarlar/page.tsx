import { AdminShell } from "@/components/admin/admin-shell";
import { AuthorManager } from "@/components/admin/author-manager";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  await requireAdmin("/admin/yazarlar");
  return (
    <div className="min-h-screen">
      <AdminShell
        title="Yazar Yonetimi"
        description="Yazar profilleri ve gorunurluk"
        actions={
          <Link href="/yazarlar" className="px-3 py-2 rounded-full border border-border text-sm">
            Yazarlari gor
          </Link>
        }
      >
        <AuthorManager />
      </AdminShell>
    </div>
  );
}
