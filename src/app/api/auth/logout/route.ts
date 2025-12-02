import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("userId", "", { expires: new Date(0), path: "/" });
  res.cookies.set("role", "", { expires: new Date(0), path: "/" });
  res.cookies.set("subscriptionStatus", "", { expires: new Date(0), path: "/" });
  return res;
}
