import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { logAudit } from "@/lib/audit";
import { normalizeCorporateContent } from "@/lib/kurumsal";

const itemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1)
});

const sectionSchema = z.object({
  title: z.string().min(1),
  items: z.array(itemSchema).min(1)
});

const schema = z.object({
  landingTitle: z.string().min(3),
  landingDescription: z.string().min(10),
  cards: z.object({
    hakkimizda: z.string().min(3),
    misyon: z.string().min(3),
    vizyon: z.string().min(3),
    kunye: z.string().min(3)
  }),
  hakkimizda: z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    paragraphs: z.array(z.string().min(5)).min(1)
  }),
  misyon: z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    body: z.string().min(5),
    bullets: z.array(z.string().min(2)).min(1)
  }),
  vizyon: z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    body: z.string().min(5),
    bullets: z.array(z.string().min(2)).min(1)
  }),
  kunye: z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    sections: z.array(sectionSchema).min(1)
  })
});

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ content: normalizeCorporateContent() });
  }
  const content = await prisma.corporateContent.findFirst();
  return NextResponse.json({ content: normalizeCorporateContent(content?.content) });
}

export async function PUT(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Veritabani bulunamadi" }, { status: 503 });
  }
  const limiter = await rateLimit("kurumsal-update", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Cok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const payload = normalizeCorporateContent(parsed.data);

  const existing = await prisma.corporateContent.findFirst({ select: { id: true } });
  const content = existing
    ? await prisma.corporateContent.update({ where: { id: existing.id }, data: { content: payload } })
    : await prisma.corporateContent.create({ data: { content: payload } });

  revalidatePath("/kurumsal");
  revalidatePath("/kurumsal/hakkimizda");
  revalidatePath("/kurumsal/misyon");
  revalidatePath("/kurumsal/vizyon");
  revalidatePath("/kurumsal/kunye");

  await logAudit(auth.user, "update", "kurumsal", content.id);

  return NextResponse.json({ content: normalizeCorporateContent(content.content) });
}
