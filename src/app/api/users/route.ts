import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { ensureAuthorProfileForUser } from "@/lib/auth";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.enum(["ban", "unban", "promote", "demote", "setRole"]),
    id: z.string().min(1),
    role: z.enum(["admin", "editor", "author", "user"]).optional(),
    reason: z.string().max(200).optional()
  }),
  z.object({
    action: z.literal("subscription"),
    id: z.string().min(1),
    plan: z.enum(["monthly", "yearly", "vip"]).optional(),
    status: z.enum(["active", "canceled", "expired", "trial", "inactive"]).optional(),
    expiresAt: z.string().datetime().optional()
  })
]);

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
  let auditMeta: Record<string, unknown> | undefined;
  if (parsed.data.action === "ban") {
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { isBanned: true } });
    auditMeta = parsed.data.reason ? { reason: parsed.data.reason } : undefined;
  } else if (parsed.data.action === "unban") {
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { isBanned: false } });
    auditMeta = parsed.data.reason ? { reason: parsed.data.reason } : undefined;
  } else if (parsed.data.action === "promote") {
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { role: "admin" } });
    await prisma.authorProfile.updateMany({ where: { userId: parsed.data.id }, data: { isListed: false } });
  } else if (parsed.data.action === "demote") {
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { role: "user" } });
    await prisma.authorProfile.updateMany({ where: { userId: parsed.data.id }, data: { isListed: false } });
  } else if (parsed.data.action === "setRole") {
    if (!parsed.data.role) {
      return NextResponse.json({ error: "Rol gerekli" }, { status: 400 });
    }
    user = await prisma.user.update({ where: { id: parsed.data.id }, data: { role: parsed.data.role } });
    if (parsed.data.role === "author" || parsed.data.role === "editor") {
      await ensureAuthorProfileForUser(user.id, user.name || user.email, user.email);
      await prisma.authorProfile.updateMany({ where: { userId: user.id }, data: { isListed: true } });
    } else {
      await prisma.authorProfile.updateMany({ where: { userId: user.id }, data: { isListed: false } });
    }
  } else if (parsed.data.action === "subscription") {
    const exists = await prisma.subscription.findUnique({ where: { userId: parsed.data.id } });
    const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : exists?.expiresAt;
    if (!exists && !parsed.data.plan) {
      return NextResponse.json({ error: "Plan gerekli" }, { status: 400 });
    }
    const data: any = {};
    if (parsed.data.plan) data.plan = parsed.data.plan;
    if (parsed.data.status) data.status = parsed.data.status;
    if (expiresAt) data.expiresAt = expiresAt;
    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
    }
    if (exists) {
      await prisma.subscription.update({
        where: { userId: parsed.data.id },
        data
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: parsed.data.id,
          plan: data.plan,
          status: data.status || "active",
          expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
    user = await prisma.user.findUnique({
      where: { id: parsed.data.id },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
        subscription: { select: { status: true, plan: true, expiresAt: true } }
      }
    });
    auditMeta = {
      plan: data.plan ?? exists?.plan,
      status: data.status ?? exists?.status,
      expiresAt: (data.expiresAt ?? exists?.expiresAt)?.toISOString()
    };
  }

  await logAudit(auth.user, parsed.data.action, "user", parsed.data.id, auditMeta);
  return NextResponse.json({ user });
}
