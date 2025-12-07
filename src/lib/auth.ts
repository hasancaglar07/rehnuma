import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import { slugify } from "@/utils/slugify";
export type SessionUser = {
  id: string;
  email: string;
  role: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  isBanned?: boolean;
};

export function hasRole(user: SessionUser | null, roles: string[]) {
  if (!user) return false;
  return roles.includes(user.role);
}

const hasDatabase = Boolean(process.env.DATABASE_URL);

type SessionClaims = Record<string, unknown> | undefined;

async function fetchClerkUser(userId: string, sessionClaims: SessionClaims) {
  const emailFromClaims =
    (sessionClaims?.email_addresses as string[] | undefined)?.[0] ||
    (sessionClaims?.email as string | undefined);
  const nameFromClaims =
    (sessionClaims?.full_name as string | undefined) || (sessionClaims?.first_name as string | undefined);

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      emailFromClaims ||
      `${userId}@placeholder.example.com`;
    const name = user.fullName || user.firstName || nameFromClaims;
    return { email, name };
  } catch {
    // Fall through to claim-based fallback when Clerk client is unavailable.
  }

  return {
    email: emailFromClaims || `${userId}@placeholder.example.com`,
    name: nameFromClaims
  };
}

async function getDbUser(userId: string, sessionClaims: SessionClaims) {
  const { email, name } = await fetchClerkUser(userId, sessionClaims);
  if (!hasDatabase) {
    return {
      id: userId,
      email,
      role: "user",
      isBanned: false,
      subscriptionStatus: "inactive",
      subscriptionPlan: ""
    };
  }

  const existingById = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
  const existingByEmail =
    existingById ||
    (await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    }));

  const user = existingByEmail
    ? await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { email, name }
      })
    : await prisma.user.create({
        data: { id: userId, email, name, role: "user" }
      });

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

  const isExpired = subscription?.expiresAt && subscription.expiresAt < new Date();
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
    subscriptionStatus: isExpired ? "expired" : subscription?.status ?? "inactive",
    subscriptionPlan: isExpired ? "" : subscription?.plan ?? ""
  };
}

export async function getSession(): Promise<{ user: SessionUser | null }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { user: null };

  const user = await getDbUser(userId, sessionClaims as SessionClaims);
  return { user };
}

export async function getSessionFromRequest(_req: Request): Promise<{ user: SessionUser | null }> {
  return getSession();
}

export async function requireUser(returnTo = "/profil") {
  const session = await getSession();
  if (!session.user) {
    redirect(`/giris?returnTo=${encodeURIComponent(returnTo)}`);
  }
  if (session.user.isBanned) {
    redirect("/abonelik");
  }
  return session.user;
}

export async function requireAdmin(returnTo = "/admin") {
  const user = await requireUser(returnTo);
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}

export async function requireRole(roles: string[], returnTo = "/admin") {
  const user = await requireUser(returnTo);
  if (!roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}

export async function ensureAuthorProfileForUser(userId: string, name?: string | null, email?: string | null) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const existing = await prisma.authorProfile.findUnique({ where: { userId } });
    if (existing) return existing.id;
    const emailLocal = email?.split("@")[0];
    const fallbackName = name || emailLocal || "Rehnüma Yazarı";
    const baseSlug = slugify(fallbackName || "yazar");
    let slug = baseSlug || `yazar-${userId.slice(0, 6)}`;
    let counter = 1;
    // ensure slug unique
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const found = await prisma.authorProfile.findUnique({ where: { slug } });
      if (!found) break;
      slug = `${baseSlug}-${counter++}`;
    }
    const profile = await prisma.authorProfile.create({
      data: {
        name: fallbackName,
        slug,
        user: { connect: { id: userId } }
      }
    });
    return profile.id;
  } catch (err) {
    console.error("[ensureAuthorProfileForUser] failed", err);
    return null;
  }
}
