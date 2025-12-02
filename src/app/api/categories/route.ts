import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ categories: [] });
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}
