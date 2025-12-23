import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { requireRoleGuard } from "@/lib/api-guards";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const allowDraft = searchParams.get("preview") === "1";
  if (!allowDraft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireRoleGuard(req, ["admin", "editor", "author"]);
  if (auth instanceof NextResponse) return auth;

  const article = await prisma.article.findFirst({ where: { slug }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
