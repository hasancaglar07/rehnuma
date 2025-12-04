import { AdminShell } from "@/components/admin/admin-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { NewArticleForm } from "@/components/admin/new-article-form";
import { requireAdmin } from "@/lib/auth";

export default async function AdminNewArticlePage() {
  await requireAdmin("/admin/yazi-yeni");
  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminShell title="Yeni Yazı" description="Başlık, slug, içerik ve medya ekleyin">
        <NewArticleForm />
      </AdminShell>
      <Footer />
    </div>
  );
}
