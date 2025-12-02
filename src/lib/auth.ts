import { cookies } from "next/headers";
import { prisma } from "@/db/prisma";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  subscriptionStatus?: string;
};

export async function getSession(): Promise<{ user: SessionUser | null }> {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return { user: null };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });
  if (!user) return { user: null };

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscription?.status
    }
  };
}

export function setMockSession(userId: string) {
  // Placeholder: in gerçek kullanımda auth sağlayıcısı entegre edilmeli.
  // Server Actions içinde Response cookies API ile set edilebilir.
  return userId;
}
