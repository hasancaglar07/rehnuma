import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Ad gerekli"),
  slug: z.string().min(2, "Slug gerekli")
});

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ categories: [] }, { status: 200, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" } });
  }

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ categories }, { status: 200, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" } });
}

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("categories-create", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
  const category = await prisma.category.create({
    data: { name: parsed.data.name, slug: parsed.data.slug, order: (maxOrder._max.order ?? 0) + 1 }
  });

  revalidatePath("/");
  revalidatePath(`/kategori/${parsed.data.slug}`);
  await logAudit(auth.user, "create", "category", category.id, { slug: parsed.data.slug });

  return NextResponse.json({ category }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const limiter = await rateLimit("categories-update", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: parsed.success ? "ID gerekli" : parsed.error.issues[0].message }, { status: 400 });

  const category = await prisma.category.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name, slug: parsed.data.slug }
  });

  revalidatePath("/");
  revalidatePath(`/kategori/${parsed.data.slug}`);
  await logAudit(auth.user, "update", "category", category.id, { slug: parsed.data.slug });

  return NextResponse.json({ category });
}

export async function DELETE(req: NextRequest) {
  const limiter = await rateLimit("categories-delete", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = z.object({ id: z.string().min(1, "ID gerekli") }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  await prisma.category.delete({ where: { id: parsed.data.id } });

  revalidatePath("/");
  await logAudit(auth.user, "delete", "category", parsed.data.id);

  return NextResponse.json({ ok: true });
}
