import { AdminShell } from "@/components/admin/admin-shell";
import { NewArticleForm } from "@/components/admin/new-article-form";
import { requireAdmin } from "@/lib/auth";

export default async function AdminNewArticlePage() {
  await requireAdmin("/admin/yazi-yeni");
  return (
    <div className="min-h-screen">
      <AdminShell title="Yeni Yazı" description="Başlık, slug, içerik ve medya ekleyin">
        <NewArticleForm />
      </AdminShell>
    </div>
  );
}
