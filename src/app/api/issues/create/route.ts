import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const role = cookies.match(/role=([^;]+)/)?.[1] || "user";
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { month, year, pdfUrl } = await req.json();
  if (!month || !year || !pdfUrl) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const issue = await prisma.issue.create({
    data: { month, year, pdfUrl }
  });

  return NextResponse.json({ issue }, { status: 201 });
}
