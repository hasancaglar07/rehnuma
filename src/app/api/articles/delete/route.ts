import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  slug: z.string().min(1, "Slug gerekli")
});

export async function DELETE(req: NextRequest) {
  const limiter = await rateLimit("articles-delete", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const existing = await prisma.article.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true, slug: true, category: { select: { slug: true } } }
  });
  const article = await prisma.article.delete({ where: { slug: parsed.data.slug } });
  revalidatePath("/");
  revalidatePath(`/yazi/${parsed.data.slug}`);
  if (existing?.category?.slug) revalidatePath(`/kategori/${existing.category.slug}`);

  await logAudit(auth.user, "delete", "article", article.id, { slug: parsed.data.slug });

  return NextResponse.json({ ok: true });
}
