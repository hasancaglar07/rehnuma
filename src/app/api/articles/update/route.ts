import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function PUT(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const role = cookies.match(/role=([^;]+)/)?.[1] || "user";
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug, title, content, categorySlug, coverUrl, audioUrl } = await req.json();
  if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

  const article = await prisma.article.update({
    where: { slug },
    data: {
      title,
      content,
      coverUrl,
      audioUrl,
      category: categorySlug ? { connect: { slug: categorySlug } } : undefined
    }
  });

  return NextResponse.json({ article });
}
