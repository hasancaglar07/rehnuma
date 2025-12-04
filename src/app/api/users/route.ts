import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";

const actionSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["ban", "unban", "promote", "demote"])
});

export async function GET(req: NextRequest) {
  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      subscription: { select: { status: true, plan: true, expiresAt: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ users }, { headers: { "Cache-Control": "private, max-age=30" } });
}

export async function PUT(req: NextRequest) {
  const limiter = await rateLimit("users-update", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  let user;
  if (parsed.data.action === "ban") {
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { isBanned: true } });
  } else if (parsed.data.action === "unban") {
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { isBanned: false } });
  } else if (parsed.data.action === "promote") {
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { role: "admin" } });
  } else if (parsed.data.action === "demote") {
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { role: "user" } });
  }

  await logAudit(auth.user, parsed.data.action, "user", parsed.data.id);
  return NextResponse.json({ user });
}
