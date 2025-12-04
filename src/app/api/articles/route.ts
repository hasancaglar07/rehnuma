import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const includeAll = searchParams.get("all") === "1";

  let statusFilter: string | undefined = "published";
  if (includeAll) {
    const session = await getSession();
    if (session.user?.role === "admin") {
      statusFilter = undefined;
    }
  }

  const articles = await prisma.article.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(statusFilter ? { status: statusFilter } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  return NextResponse.json({ articles }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=120" } });
}
