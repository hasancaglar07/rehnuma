import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  const isExpired = subscription?.expiresAt && subscription.expiresAt < new Date();
  const normalized = subscription ? { ...subscription, status: isExpired ? "expired" : subscription.status } : null;
  return NextResponse.json({ subscription: normalized }, { headers: { "Cache-Control": "private, max-age=60" } });
}
