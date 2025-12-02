import { NextResponse } from "next/server";

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${process.env.NEXT_PUBLIC_URL || "https://example.com"}/sitemap.xml`;
  return new NextResponse(body, { status: 200, headers: { "Content-Type": "text/plain" } });
}
