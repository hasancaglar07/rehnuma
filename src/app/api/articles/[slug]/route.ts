import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const allowDraft = searchParams.get("preview") === "1";
  const article = await prisma.article.findFirst({
    where: { slug, ...(allowDraft ? {} : { status: "published" }) },
    include: { category: true }
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ article }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=120" } });
}
