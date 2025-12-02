import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  const issues = await prisma.issue.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }]
  });
  return NextResponse.json({ issues });
}
