import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { requireAuthGuard } from "@/lib/api-guards";

export async function GET(req: NextRequest) {
  const auth = await requireAuthGuard(req);
  if (auth instanceof NextResponse) return auth;

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug gerekli" }, { status: 400 });

  const isSubscriber = auth.user.role === "admin" || auth.user.subscriptionStatus === "active";
  if (!isSubscriber) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const article = await prisma.article.findFirst({
    where: { slug, status: "published" },
    select: { id: true, content: true, audioUrl: true }
  });
  if (!article) return NextResponse.json({ error: "Yazı bulunamadı" }, { status: 404 });

  const [saved, progress] = await Promise.all([
    prisma.savedArticle.findUnique({
      where: { userId_articleId: { userId: auth.user.id, articleId: article.id } },
      select: { id: true }
    }),
    prisma.readingProgress.findUnique({
      where: { userId_articleId: { userId: auth.user.id, articleId: article.id } },
      select: { progress: true }
    })
  ]);

  return NextResponse.json(
    {
      content: article.content,
      audioUrl: article.audioUrl,
      saved: Boolean(saved),
      progress: progress?.progress ?? 0
    },
    { headers: { "Cache-Control": "private, max-age=30" } }
  );
}
