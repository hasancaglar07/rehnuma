import "server-only";

import { prisma } from "@/db/prisma";
import { normalizeCorporateContent, type CorporateContent } from "@/lib/kurumsal";

export async function getCorporateContent(): Promise<CorporateContent> {
  if (!process.env.DATABASE_URL) {
    return normalizeCorporateContent();
  }
  const content = await prisma.corporateContent.findFirst();
  return normalizeCorporateContent(content?.content);
}
