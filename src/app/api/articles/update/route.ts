import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireCsrfGuard, requestIp, requireRoleGuard } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { ensureAuthorProfileForUser } from "@/lib/auth";

const publishAtSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || !Number.isNaN(new Date(val).getTime()), {
    message: "Yayın zamanı geçerli bir tarih/saat olmalı"
  });

const schema = z.object({
  slug: z.string().min(1, "Slug gerekli"),
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  categorySlug: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  audioUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).optional(),
  isPaywalled: z.boolean().optional(),
  publishAt: publishAtSchema,
  excerpt: z.string().max(320).optional(),
  metaTitle: z.string().max(120).optional(),
  metaDescription: z.string().max(220).optional(),
  authorId: z.string().optional()
});

export async function PUT(req: NextRequest) {
  const limiter = await rateLimit("articles-update", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireRoleGuard(req, ["admin", "editor", "author"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.article.findUnique({
    where: { slug: parsed.data.slug },
    select: { category: { select: { slug: true } }, author: { select: { id: true, userId: true } }, status: true }
  });
  if (!existing) {
    return NextResponse.json({ error: "Yazı bulunamadı" }, { status: 404 });
  }

  const isAuthor = auth.user.role === "author";
  if (isAuthor && existing.author?.userId && existing.author.userId !== auth.user.id) {
    return NextResponse.json({ error: "Yazar kendi yazısını düzenleyebilir" }, { status: 403 });
  }
  if (isAuthor && existing.status === "published") {
    return NextResponse.json({ error: "Yayınlanmış yazıyı düzenleyemezsiniz" }, { status: 403 });
  }
  if (isAuthor && parsed.data.status === "published") {
    return NextResponse.json({ error: "Yazarlar yayınlayamaz" }, { status: 403 });
  }

  let nextAuthorId: string | undefined = existing.author?.id ?? undefined;
  if (!isAuthor && parsed.data.authorId) {
    const chosen = await prisma.authorProfile.findUnique({ where: { id: parsed.data.authorId } });
    if (chosen) nextAuthorId = chosen.id;
  }
  if (!nextAuthorId) {
    const profileId = await ensureAuthorProfileForUser(auth.user.id, auth.user.email, auth.user.email);
    nextAuthorId = profileId ?? undefined;
  }

  const article = await prisma.article.update({
    where: { slug: parsed.data.slug },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      coverUrl: parsed.data.coverUrl || undefined,
      audioUrl: parsed.data.audioUrl || undefined,
      status: isAuthor ? "draft" : parsed.data.status,
      publishedAt: isAuthor
        ? null
        : parsed.data.publishAt
          ? new Date(parsed.data.publishAt)
          : parsed.data.status === "published"
            ? new Date()
            : undefined,
      isPaywalled: parsed.data.isPaywalled,
      excerpt: parsed.data.excerpt,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      category: parsed.data.categorySlug ? { connect: { slug: parsed.data.categorySlug } } : undefined,
      author: nextAuthorId ? { connect: { id: nextAuthorId } } : undefined
    }
  });

  revalidatePath("/");
  revalidatePath(`/yazi/${parsed.data.slug}`);
  if (existing?.category?.slug) revalidatePath(`/kategori/${existing.category.slug}`);
  if (parsed.data.categorySlug) revalidatePath(`/kategori/${parsed.data.categorySlug}`);

  await logAudit(auth.user, "update", "article", article.id, { slug: parsed.data.slug, status: parsed.data.status });

  return NextResponse.json({ article });
}
