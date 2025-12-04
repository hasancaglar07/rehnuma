import { AdminShell } from "@/components/admin/admin-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CategoryList } from "@/components/admin/category-list";
import { requireAdmin } from "@/lib/auth";

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/kategoriler");
  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminShell title="Kategori Yönetimi" description="Yeni kategori ekle, düzenle, sıralama">
        <CategoryList />
      </AdminShell>
      <Footer />
    </div>
  );
}
