import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { verifyPassword } from "@/utils/password";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit("auth-login");
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true }
  });
  if (!user || !user.password || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("userId", user.id, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  res.cookies.set("role", user.role, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  if (user.subscription?.status) {
    res.cookies.set("subscriptionStatus", user.subscription.status, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  }
  return res;
}
