import { AdminShell } from "@/components/admin/admin-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { NewArticleForm } from "@/components/admin/new-article-form";

export default function AdminNewArticlePage() {
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
