import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminGuard, requireCsrfGuard, requireRoleGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/utils/slugify";

const authorSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter"),
  slug: z.string().optional(),
  bio: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  isListed: z.boolean().optional()
});

async function ensureUniqueSlug(base: string, excludeId?: string) {
  const baseSlug = slugify(base || "yazar");
  let slug = baseSlug || "yazar";
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = await prisma.authorProfile.findUnique({ where: { slug } });
    if (!found || (excludeId && found.id === excludeId)) break;
    slug = `${baseSlug || "yazar"}-${counter++}`;
  }
  return slug;
}

export async function GET(req: NextRequest) {
  const auth = await requireRoleGuard(req, ["admin", "editor", "author"]);
  if (auth instanceof NextResponse) return auth;

  const onlyPublished = req.nextUrl.searchParams.get("published") === "1";

  const authors = await prisma.authorProfile.findMany({
    where: onlyPublished
      ? { articles: { some: { status: "published" } } }
      : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      avatarUrl: true,
      website: true,
      instagram: true,
      twitter: true,
      isListed: true,
      userId: true,
      _count: { select: { articles: { where: { status: "published" } } } }
    }
  });

  return NextResponse.json({ authors });
}

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("authors-create", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = authorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const slugSource = parsed.data.slug?.trim() || parsed.data.name;
  const slug = await ensureUniqueSlug(slugSource);

  const author = await prisma.authorProfile.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      bio: parsed.data.bio || undefined,
      avatarUrl: parsed.data.avatarUrl || undefined,
      website: parsed.data.website || undefined,
      instagram: parsed.data.instagram || undefined,
      twitter: parsed.data.twitter || undefined,
      isListed: parsed.data.isListed ?? true
    }
  });

  await logAudit(auth.user, "create", "author", author.id, { slug: author.slug });

  revalidatePath("/yazarlar");
  revalidatePath(`/yazarlar/${author.slug}`);

  return NextResponse.json({ author }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const limiter = await rateLimit("authors-update", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = authorSchema.extend({ id: z.string().min(1) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.authorProfile.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });

  let slug = existing.slug;
  if (parsed.data.slug && parsed.data.slug.trim() !== existing.slug) {
    slug = await ensureUniqueSlug(parsed.data.slug, existing.id);
  }

  const author = await prisma.authorProfile.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name.trim(),
      slug,
      bio: parsed.data.bio || undefined,
      avatarUrl: parsed.data.avatarUrl || undefined,
      website: parsed.data.website || undefined,
      instagram: parsed.data.instagram || undefined,
      twitter: parsed.data.twitter || undefined,
      isListed: parsed.data.isListed ?? existing.isListed
    }
  });

  await logAudit(auth.user, "update", "author", author.id, { slug: author.slug });

  revalidatePath("/yazarlar");
  revalidatePath(`/yazarlar/${author.slug}`);
  if (existing.slug !== author.slug) {
    revalidatePath(`/yazarlar/${existing.slug}`);
  }

  return NextResponse.json({ author });
}

export async function DELETE(req: NextRequest) {
  const limiter = await rateLimit("authors-delete", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ id: z.string().min(1) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const hasArticles = await prisma.article.count({ where: { authorId: parsed.data.id } });
  if (hasArticles > 0) {
    return NextResponse.json({ error: "Yayınlanmış yazısı olan yazar silinemez" }, { status: 400 });
  }

  const deleted = await prisma.authorProfile.delete({ where: { id: parsed.data.id } });
  await logAudit(auth.user, "delete", "author", parsed.data.id);

  revalidatePath("/yazarlar");
  revalidatePath(`/yazarlar/${deleted.slug}`);

  return NextResponse.json({ ok: true });
}
