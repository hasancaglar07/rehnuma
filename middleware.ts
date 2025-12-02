import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";

const PROTECTED = ["/dergi", "/profil", "/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const userId = req.cookies.get("userId")?.value;
  const role = req.cookies.get("role")?.value || "user";
  let subscriptionStatus = req.cookies.get("subscriptionStatus")?.value || "inactive";

  if (!userId) {
    return NextResponse.redirect(new URL("/abonelik", req.url));
  }

  if (subscriptionStatus !== "active") {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    subscriptionStatus = sub?.status ?? "inactive";
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/dergi") && subscriptionStatus !== "active") {
    return NextResponse.redirect(new URL("/abonelik", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
