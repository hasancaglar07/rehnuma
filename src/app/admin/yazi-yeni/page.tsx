import { AdminShell } from "@/components/admin/admin-shell";
import { NewArticleForm } from "@/components/admin/new-article-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/db/prisma";
import Link from "next/link";

export default async function AdminNewArticlePage() {
  const user = await requireRole(["admin", "editor", "author"], "/admin/yazi-yeni");
  const allowPublish = user.role !== "author";
  const profile = await prisma.authorProfile.findFirst({ where: { userId: user.id }, select: { id: true } });
  return (
    <div className="min-h-screen">
      <AdminShell
        title="Yeni Yazı"
        description="Başlık, slug, içerik ve medya ekleyin"
        actions={
          <>
            <Link href="/admin/yazilar" className="px-3 py-2 rounded-full border border-border text-sm">
              Yazılar listesi
            </Link>
            <Link href="/blog" className="px-3 py-2 rounded-full border border-border text-sm">
              Blogu gör
            </Link>
          </>
        }
      >
        <NewArticleForm
          allowPublish={allowPublish}
          initialData={{ authorId: profile?.id }}
          allowAuthorSelect={user.role !== "author"}
        />
      </AdminShell>
    </div>
  );
}
