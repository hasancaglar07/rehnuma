import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { requireCsrfGuard, requestIp, requireRoleGuard } from "@/lib/api-guards";
import { ensureAuthorProfileForUser } from "@/lib/auth";

const publishAtSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || !Number.isNaN(new Date(val).getTime()), {
    message: "Yayın zamanı geçerli bir tarih/saat olmalı"
  });

const schema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter"),
  slug: z.string().min(3, "Slug en az 3 karakter"),
  content: z.string().min(20, "İçerik en az 20 karakter"),
  categorySlug: z.string().min(1, "Kategori gerekli"),
  coverUrl: z.string().url().optional().or(z.literal("")),
  audioUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("draft"),
  isPaywalled: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  publishAt: publishAtSchema,
  excerpt: z.string().max(320).optional(),
  metaTitle: z.string().max(120).optional(),
  metaDescription: z.string().max(220).optional(),
  authorId: z.string().optional()
});

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("articles-create", requestIp(req));
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

  const isAuthor = auth.user.role === "author";
  if (isAuthor && parsed.data.status === "published") {
    return NextResponse.json({ error: "Yazarlar sadece taslak kaydedebilir" }, { status: 403 });
  }

  const fallbackAuthorId = await ensureAuthorProfileForUser(auth.user.id, auth.user.email, auth.user.email);
  let selectedAuthorId = fallbackAuthorId;
  if (!isAuthor && parsed.data.authorId) {
    const chosen = await prisma.authorProfile.findUnique({ where: { id: parsed.data.authorId } });
    if (chosen) selectedAuthorId = chosen.id;
  }

  const article = await prisma.article.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      content: parsed.data.content,
      status: isAuthor ? "draft" : parsed.data.status,
      publishedAt:
        isAuthor || parsed.data.status === "draft"
          ? null
          : parsed.data.publishAt
            ? new Date(parsed.data.publishAt)
            : new Date(),
      isPaywalled: parsed.data.isPaywalled ?? false,
      isFeatured: parsed.data.isFeatured ?? false,
      isRecommended: parsed.data.isRecommended ?? false,
      excerpt: parsed.data.excerpt,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      coverUrl: parsed.data.coverUrl || undefined,
      audioUrl: parsed.data.audioUrl || undefined,
      category: { connect: { slug: parsed.data.categorySlug } },
      author: selectedAuthorId ? { connect: { id: selectedAuthorId } } : undefined
    }
  });

  revalidatePath("/");
  revalidatePath(`/yazi/${article.slug}`);
  revalidatePath(`/kategori/${parsed.data.categorySlug}`);

  await logAudit(auth.user, "create", "article", article.id, { slug: article.slug, status: article.status });

  return NextResponse.json({ article }, { status: 201 });
}
