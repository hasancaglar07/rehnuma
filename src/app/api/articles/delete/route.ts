import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function DELETE(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const role = cookies.match(/role=([^;]+)/)?.[1] || "user";
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

  await prisma.article.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
