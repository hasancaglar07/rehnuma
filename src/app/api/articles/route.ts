import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const articles = await prisma.article.findMany({
    where: category ? { category: { slug: category } } : {},
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  return NextResponse.json({ articles });
}
