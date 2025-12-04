import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number()
    })
  )
});

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("categories-reorder", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const updates = parsed.data.items.map((item) =>
    prisma.category.update({
      where: { id: item.id },
      data: { order: item.order }
    })
  );

  await prisma.$transaction(updates);

  revalidatePath("/");
  await logAudit(auth.user, "reorder", "category", undefined, { count: parsed.data.items.length });

  return NextResponse.json({ ok: true });
}
