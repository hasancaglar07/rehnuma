import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const includeAll = searchParams.get("all") === "1";
  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");

  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 30) : null;
  const page = pageParam ? Math.max(parseInt(pageParam, 10) || 1, 1) : 1;

  let statusFilter: string | undefined = "published";
  if (includeAll) {
    const session = await getSession();
    if (session.user?.role === "admin") {
      statusFilter = undefined;
    }
  }

  const baseWhere = {
    ...(category ? { category: { slug: category } } : {}),
    ...(statusFilter ? { status: statusFilter } : {})
  };

  // Pagination
  if (limit) {
    const take = limit + 1; // fetch one extra to check hasMore
    const skip = (page - 1) * limit;

    const articles = await prisma.article.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      include: { category: true },
      skip,
      take
    });

    const hasMore = articles.length > limit;
    const data = hasMore ? articles.slice(0, limit) : articles;
    const nextPage = hasMore ? page + 1 : null;

    return NextResponse.json(
      { articles: data, nextPage },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  }

  const articles = await prisma.article.findMany({
    where: baseWhere,
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  return NextResponse.json({ articles }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=120" } });
}
