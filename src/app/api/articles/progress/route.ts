import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAuthGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  slug: z.string().min(1, "Slug gerekli"),
  progress: z.number().min(0).max(100)
});

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("articles-progress", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAuthGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const article = await prisma.article.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Yazı bulunamadı" }, { status: 404 });

  const record = await prisma.readingProgress.upsert({
    where: { userId_articleId: { userId: auth.user.id, articleId: article.id } },
    update: { progress: Math.min(100, Math.max(0, Math.round(parsed.data.progress))) },
    create: { userId: auth.user.id, articleId: article.id, progress: Math.round(parsed.data.progress) }
  });

  revalidatePath("/profil/okuma-gecmisi");

  return NextResponse.json({ progress: record.progress });
}
