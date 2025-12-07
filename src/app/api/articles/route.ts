import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/auth";
import { isShortRead } from "@/utils/reading-time";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const includeAll = searchParams.get("all") === "1";
  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  const filterParam = searchParams.get("filter");

  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 30) : null;
  const page = pageParam ? Math.max(parseInt(pageParam, 10) || 1, 1) : 1;
  const filter: "latest" | "featured" | "short" =
    filterParam === "featured" ? "featured" : filterParam === "short" ? "short" : "latest";

  let statusFilter: string | undefined = "published";
  if (includeAll) {
    const session = await getSession();
    if (session.user?.role === "admin" || session.user?.role === "editor") {
      statusFilter = undefined;
    }
  }

  const categoryWhere = category
    ? {
        OR: [{ category: { slug: category } }, { category: { parent: { slug: category } } }]
      }
    : {};

  const baseWhere = {
    ...categoryWhere,
    ...(statusFilter ? { status: statusFilter } : {})
  };
  const where: Prisma.ArticleWhereInput = {
    ...baseWhere,
    ...(filter === "featured" ? { isFeatured: true } : {})
  };
  const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [{ publishedAt: "desc" }, { createdAt: "desc" }];
  const include: Prisma.ArticleInclude = { category: true };

  // Pagination
  if (limit) {
    const take = limit + 1; // fetch one extra to check hasMore
    const skip = (page - 1) * limit;

    if (filter === "short") {
      const { articles, nextPage } = await paginateShort(where, orderBy, include, { limit, page });
      return NextResponse.json(
        { articles, nextPage },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
      );
    }

    const articles = await prisma.article.findMany({ where, orderBy, include, skip, take });

    const hasMore = articles.length > limit;
    const data = hasMore ? articles.slice(0, limit) : articles;
    const nextPage = hasMore ? page + 1 : null;

    return NextResponse.json(
      { articles: data, nextPage },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  }

  const articles = await prisma.article.findMany({ where, orderBy, include });
  const data = filter === "short" ? articles.filter((article) => isShortRead(article.content)) : articles;

  return NextResponse.json(
    { articles: data },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=120" } }
  );
}

async function paginateShort(
  where: Prisma.ArticleWhereInput,
  orderBy: Prisma.ArticleOrderByWithRelationInput[],
  include: Prisma.ArticleInclude,
  opts: { limit: number; page: number }
) {
  const { limit, page } = opts;
  const shortToSkip = (page - 1) * limit;
  const batchSize = Math.min(Math.max(limit * 3, 25), 120);

  let cursor = 0;
  let remainingSkip = shortToSkip;
  let collected: Awaited<ReturnType<typeof prisma.article.findMany>> = [];
  let exhausted = false;

  while (collected.length < limit + 1 && !exhausted) {
    const batch = await prisma.article.findMany({ where, orderBy, include, skip: cursor, take: batchSize });
    if (batch.length < batchSize) exhausted = true;
    cursor += batch.length;
    let filtered = batch.filter((article) => isShortRead(article.content));

    if (remainingSkip > 0) {
      if (remainingSkip >= filtered.length) {
        remainingSkip -= filtered.length;
        filtered = [];
      } else {
        filtered = filtered.slice(remainingSkip);
        remainingSkip = 0;
      }
    }

    collected = [...collected, ...filtered];
    if (batch.length === 0) break;
  }

  const hasMore = collected.length > limit;
  const articles = hasMore ? collected.slice(0, limit) : collected;
  const nextPage = hasMore ? page + 1 : null;

  return { articles, nextPage };
}
