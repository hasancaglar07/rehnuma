import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/utils/slugify";

const prisma = new PrismaClient();

async function ensureProfile(userId: string, name: string | null) {
  const existing = await prisma.authorProfile.findUnique({ where: { userId } });
  if (existing) return existing.id;
  const baseName = name || "Rehnüma Yazarı";
  const baseSlug = slugify(baseName || "yazar");
  let slug = baseSlug;
  let counter = 1;
  // ensure unique slug
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = await prisma.authorProfile.findUnique({ where: { slug } });
    if (!found) break;
    slug = `${baseSlug}-${counter++}`;
  }
  const created = await prisma.authorProfile.create({
    data: {
      name: baseName,
      slug,
      userId
    }
  });
  return created.id;
}

async function main() {
  const authorUsers = await prisma.user.findMany({
    where: { role: { in: ["author", "editor"] } },
    select: { id: true, name: true, email: true }
  });
  let createdProfiles = 0;

  for (const user of authorUsers) {
    const profileId = await ensureProfile(user.id, user.name || user.email);
    if (profileId) createdProfiles += 1;
  }

  console.log(`Profil oluştur/bağlandı: ${createdProfiles}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
