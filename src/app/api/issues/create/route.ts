import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireRoleGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const schema = z.object({
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

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("issues-create", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireRoleGuard(req, ["admin", "editor"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  try {
    const issue = await prisma.issue.create({
      data: { month: parsed.data.month, year: parsed.data.year, pdfUrl: parsed.data.pdfUrl, coverUrl: parsed.data.coverUrl || undefined }
    });

    if (parsed.data.articles?.length) {
      const items = parsed.data.articles.map((item, idx) => ({
        issueId: issue.id,
        articleId: item.articleId,
        reviewerId: item.reviewerId,
        role: item.role || "author",
        order: item.order ?? idx
      }));
      await prisma.issueArticle.createMany({ data: items, skipDuplicates: true });
    }

    revalidatePath("/dergi");
    revalidatePath(`/dergi/${issue.year}-${String(issue.month).padStart(2, "0")}`);

    await logAudit(auth.user, "create", "issue", issue.id, { month: issue.month, year: issue.year });

    return NextResponse.json({ issue }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Dergi oluşturulamadı" }, { status: 400 });
  }
}
