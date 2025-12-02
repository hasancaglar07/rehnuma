import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ issues: [] });
  }

  const issues = await prisma.issue.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }]
  });
  return NextResponse.json({ issues });
}
