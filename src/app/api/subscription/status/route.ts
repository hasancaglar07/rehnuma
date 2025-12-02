import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const userId = cookies.match(/userId=([^;]+)/)?.[1];
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  return NextResponse.json({ subscription });
}
