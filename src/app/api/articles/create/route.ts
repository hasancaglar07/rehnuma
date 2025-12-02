import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit("articles-create");
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const cookies = req.headers.get("cookie") || "";
  const role = cookies.match(/role=([^;]+)/)?.[1] || "user";
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, slug, content, categorySlug, coverUrl, audioUrl } = await req.json();
  if (!title || !slug || !content || !categorySlug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      coverUrl,
      audioUrl,
      category: { connect: { slug: categorySlug } }
    }
  });

  return NextResponse.json({ article }, { status: 201 });
}
