import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "./auth";

export type GuardResult = { user: SessionUser } | NextResponse;

export async function requireAuthGuard(_req: Request): Promise<GuardResult> {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isBanned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { user: session.user };
}

export async function requireAdminGuard(_req: Request): Promise<GuardResult> {
  const auth = await requireAuthGuard(_req);
  if (auth instanceof NextResponse) return auth;
  if (auth.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return auth;
}

export function requireCsrfGuard(_req: Request): NextResponse | null {
  return null;
}

export function requestIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}
