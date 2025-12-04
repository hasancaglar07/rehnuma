import { NextResponse } from "next/server";

function redirectToClerk(req: Request, status: 302 | 307 = 302) {
  const url = new URL(req.url);
  url.pathname = "/sso-callback";
  return NextResponse.redirect(url, status);
}

export async function GET(req: Request) {
  return redirectToClerk(req, 302);
}

export async function POST(req: Request) {
  return redirectToClerk(req, 307);
}
