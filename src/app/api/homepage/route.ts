import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { logAudit } from "@/lib/audit";
import { normalizeHomepageContent } from "@/lib/homepage";

const schema = z.object({
  heroBadge: z.string().optional().or(z.literal("")),
  heroTitle: z.string().min(3, "Baslik en az 3 karakter"),
  heroAccent: z.string().optional().or(z.literal("")),
  heroDescription: z.string().min(10, "Aciklama en az 10 karakter"),
  heroPrimaryCtaLabel: z.string().min(2),
  heroPrimaryCtaHref: z.string().min(1),
  heroSecondaryCtaLabel: z.string().optional().or(z.literal("")),
  heroSecondaryCtaHref: z.string().optional().or(z.literal("")),
  heroImageUrl: z.string().optional().or(z.literal("")),
  heroImageAlt: z.string().optional().or(z.literal("")),
  recommendationsTitle: z.string().min(2),
  recommendationsDescription: z.string().optional().or(z.literal(""))
});

export async function GET() {
  const content = await prisma.homepageContent.findFirst();
  return NextResponse.json({ content: normalizeHomepageContent(content ?? undefined) });
}

export async function PUT(req: NextRequest) {
  const limiter = await rateLimit("homepage-update", requestIp(req));
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

  const payload = {
    heroBadge: parsed.data.heroBadge || null,
    heroTitle: parsed.data.heroTitle,
    heroAccent: parsed.data.heroAccent || null,
    heroDescription: parsed.data.heroDescription,
    heroPrimaryCtaLabel: parsed.data.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: parsed.data.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: parsed.data.heroSecondaryCtaLabel || null,
    heroSecondaryCtaHref: parsed.data.heroSecondaryCtaHref || null,
    heroImageUrl: parsed.data.heroImageUrl || null,
    heroImageAlt: parsed.data.heroImageAlt || null,
    recommendationsTitle: parsed.data.recommendationsTitle,
    recommendationsDescription: parsed.data.recommendationsDescription || null
  };

  const existing = await prisma.homepageContent.findFirst({ select: { id: true } });
  const content = existing
    ? await prisma.homepageContent.update({ where: { id: existing.id }, data: payload })
    : await prisma.homepageContent.create({ data: payload });

  revalidatePath("/");

  await logAudit(auth.user, "update", "homepage", content.id);

  return NextResponse.json({ content: normalizeHomepageContent(content) });
}
