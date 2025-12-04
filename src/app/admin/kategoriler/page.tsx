import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryList } from "@/components/admin/category-list";
import { requireAdmin } from "@/lib/auth";

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/kategoriler");
  return (
    <div className="min-h-screen">
      <AdminShell title="Kategori Yönetimi" description="Yeni kategori ekle, düzenle, sıralama">
        <CategoryList />
      </AdminShell>
    </div>
  );
}
