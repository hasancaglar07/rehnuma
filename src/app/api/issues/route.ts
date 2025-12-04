import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ issues: [] }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" } });
  }

  const isLite = req.nextUrl.searchParams.get("lite") === "1";
  if (isLite) {
    const issues = await prisma.issue.findMany({
      select: { id: true, year: true, month: true, coverUrl: true },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });
    return NextResponse.json({ issues }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
  }

  const issues = await prisma.issue.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      articles: {
        include: {
          article: { select: { id: true, title: true, slug: true, coverUrl: true } },
          reviewer: { select: { id: true, email: true } }
        },
        orderBy: { order: "asc" }
      }
    }
  });
  return NextResponse.json({ issues }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" } });
}

const updateSchema = z.object({
  id: z.string().min(1, "ID gerekli"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  pdfUrl: z.string().url("Geçersiz PDF URL"),
  coverUrl: z.string().url().optional().or(z.literal("")),
  articles: z
    .array(
      z.object({
        articleId: z.string(),
        reviewerId: z.string().optional(),
        role: z.string().optional(),
        order: z.number().optional()
      })
    )
    .optional()
});

export async function PUT(req: NextRequest) {
  const limiter = await rateLimit("issues-update", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const existing = await prisma.issue.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return NextResponse.json({ error: "Dergi bulunamadı" }, { status: 404 });

  try {
    const updatedIssue = await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.update({
        where: { id: parsed.data.id },
        data: { month: parsed.data.month, year: parsed.data.year, pdfUrl: parsed.data.pdfUrl, coverUrl: parsed.data.coverUrl || null }
      });

      if (parsed.data.articles) {
        await tx.issueArticle.deleteMany({ where: { issueId: issue.id } });
        if (parsed.data.articles.length) {
          await tx.issueArticle.createMany({
            data: parsed.data.articles.map((item, idx) => ({
              issueId: issue.id,
              articleId: item.articleId,
              reviewerId: item.reviewerId,
              role: item.role || "author",
              order: item.order ?? idx
            })),
            skipDuplicates: true
          });
        }
      }

      return issue;
    });

    const oldSlug = `${existing.year}-${String(existing.month).padStart(2, "0")}`;
    const newSlug = `${parsed.data.year}-${String(parsed.data.month).padStart(2, "0")}`;

    revalidatePath("/dergi");
    revalidatePath(`/dergi/${newSlug}`);
    if (oldSlug !== newSlug) {
      revalidatePath(`/dergi/${oldSlug}`);
    }

    await logAudit(auth.user, "update", "issue", parsed.data.id, { month: parsed.data.month, year: parsed.data.year });

    return NextResponse.json({ issue: updatedIssue });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Bu ay/yıl zaten ekli" }, { status: 400 });
    }
    return NextResponse.json({ error: "Dergi güncellenemedi" }, { status: 400 });
  }
}
