import { prisma } from "@/db/prisma";
import type { SessionUser } from "./auth";

export async function logAudit(
  user: SessionUser | null,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        action,
        targetType,
        targetId,
        metadata: metadata ? (metadata as any) : undefined
      }
    });
  } catch (err) {
    console.error("[audit] failed", err);
  }
}
