import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/url";

export async function GET() {
  const baseUrl = getBaseUrl();
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /profil
Disallow: /giris
Disallow: /kayit
Disallow: /sso-callback
Sitemap: ${baseUrl}/sitemap.xml`;
  return new NextResponse(body, { status: 200, headers: { "Content-Type": "text/plain" } });
}
