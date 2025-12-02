import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { hashPassword } from "@/utils/password";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit("auth-register");
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { email, password, name } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashPassword(password)
    }
  });

  const res = NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
  res.cookies.set("userId", user.id, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  res.cookies.set("role", user.role, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  res.cookies.set("subscriptionStatus", "inactive", { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  return res;
}
