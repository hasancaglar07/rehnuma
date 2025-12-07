import { AdminShell } from "@/components/admin/admin-shell";
import { NewArticleForm } from "@/components/admin/new-article-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/db/prisma";

export default async function AdminNewArticlePage() {
  const user = await requireRole(["admin", "editor", "author"], "/admin/yazi-yeni");
  const allowPublish = user.role !== "author";
  const profile = await prisma.authorProfile.findFirst({ where: { userId: user.id }, select: { id: true } });
  return (
    <div className="min-h-screen">
      <AdminShell title="Yeni Yazı" description="Başlık, slug, içerik ve medya ekleyin">
        <NewArticleForm
          allowPublish={allowPublish}
          initialData={{ authorId: profile?.id }}
          allowAuthorSelect={user.role !== "author"}
        />
      </AdminShell>
    </div>
  );
}
