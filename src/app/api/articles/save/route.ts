import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAuthGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  slug: z.string().min(1, "Slug gerekli"),
  action: z.enum(["save", "unsave"]).default("save")
});

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("articles-save", requestIp(req));
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

  if (parsed.data.action === "save") {
    await prisma.savedArticle.upsert({
      where: { userId_articleId: { userId: auth.user.id, articleId: article.id } },
      create: { userId: auth.user.id, articleId: article.id },
      update: {}
    });
    revalidatePath("/profil/kaydedilenler");
    return NextResponse.json({ saved: true });
  }

  await prisma.savedArticle.deleteMany({ where: { userId: auth.user.id, articleId: article.id } });
  revalidatePath("/profil/kaydedilenler");
  return NextResponse.json({ saved: false });
}
