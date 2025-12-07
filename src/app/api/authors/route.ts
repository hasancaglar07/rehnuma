import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { requireRoleGuard } from "@/lib/api-guards";

export async function GET(req: NextRequest) {
  const auth = await requireRoleGuard(req, ["admin", "editor", "author"]);
  if (auth instanceof NextResponse) return auth;

  const onlyPublished = req.nextUrl.searchParams.get("published") === "1";

  const authors = await prisma.authorProfile.findMany({
    where: onlyPublished
      ? { articles: { some: { status: "published" } } }
      : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, bio: true, _count: { select: { articles: { where: { status: "published" } } } } }
  });

  return NextResponse.json({ authors });
}
