import { prisma } from "@/db/prisma";
import { getPaymentPlan } from "@/lib/payments/plans";

export async function extendSubscription(userId: string, planId: string, quantity: number) {
  const plan = getPaymentPlan(planId as "monthly" | "yearly");
  if (!plan) {
    throw new Error("Plan bulunamadi");
  }
  const now = new Date();
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  const baseDate = existing?.expiresAt && existing.expiresAt > now ? existing.expiresAt : now;
  const totalDays = plan.durationDays * Math.max(1, quantity);
  const expiresAt = new Date(baseDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  if (existing) {
    await prisma.subscription.update({
      where: { userId },
      data: { status: "active", plan: planId, expiresAt }
    });
  } else {
    await prisma.subscription.create({
      data: { userId, status: "active", plan: planId, expiresAt }
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "user") {
    await prisma.user.update({ where: { id: userId }, data: { role: "subscriber" } });
  }
}

export async function rollbackSubscription(userId: string, planId: string, quantity: number) {
  const plan = getPaymentPlan(planId as "monthly" | "yearly");
  if (!plan) {
    throw new Error("Plan bulunamadi");
  }
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (!existing) return;

  const totalDays = plan.durationDays * Math.max(1, quantity);
  const newExpiry = new Date(existing.expiresAt.getTime() - totalDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const expiresAt = newExpiry < now ? now : newExpiry;
  const status = expiresAt <= now ? "canceled" : "active";

  await prisma.subscription.update({
    where: { userId },
    data: { expiresAt, status }
  });

  if (expiresAt <= now) {
    await prisma.user.update({ where: { id: userId }, data: { role: "user" } });
  }
}
