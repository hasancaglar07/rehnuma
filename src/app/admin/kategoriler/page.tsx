import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryList } from "@/components/admin/category-list";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/kategoriler");
  return (
    <div className="min-h-screen">
      <AdminShell
        title="Kategori Yönetimi"
        description="Yeni kategori ekle, düzenle, sıralama"
        actions={
          <Link href="/kategoriler" className="px-3 py-2 rounded-full border border-border text-sm">
            Kategorileri gör
          </Link>
        }
      >
        <CategoryList />
      </AdminShell>
    </div>
  );
}
