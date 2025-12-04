import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  slug: z.string().min(1, "Slug gerekli"),
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  categorySlug: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  audioUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).optional(),
  isPaywalled: z.boolean().optional(),
  publishAt: z.string().datetime().optional(),
  excerpt: z.string().max(320).optional(),
  metaTitle: z.string().max(120).optional(),
  metaDescription: z.string().max(220).optional()
});

export async function PUT(req: NextRequest) {
  const limiter = await rateLimit("articles-update", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.article.findUnique({
    where: { slug: parsed.data.slug },
    select: { category: { select: { slug: true } } }
  });

  const article = await prisma.article.update({
    where: { slug: parsed.data.slug },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      coverUrl: parsed.data.coverUrl || undefined,
      audioUrl: parsed.data.audioUrl || undefined,
      status: parsed.data.status,
      publishedAt: parsed.data.publishAt ? new Date(parsed.data.publishAt) : undefined,
      isPaywalled: parsed.data.isPaywalled,
      excerpt: parsed.data.excerpt,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      category: parsed.data.categorySlug ? { connect: { slug: parsed.data.categorySlug } } : undefined
    }
  });

  revalidatePath("/");
  revalidatePath(`/yazi/${parsed.data.slug}`);
  if (existing?.category?.slug) revalidatePath(`/kategori/${existing.category.slug}`);
  if (parsed.data.categorySlug) revalidatePath(`/kategori/${parsed.data.categorySlug}`);

  await logAudit(auth.user, "update", "article", article.id, { slug: parsed.data.slug, status: parsed.data.status });

  return NextResponse.json({ article });
}
