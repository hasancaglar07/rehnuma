import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const { user } = await getSession();
  return NextResponse.json(
    {
      role: user?.role ?? null,
      subscriptionStatus: user?.subscriptionStatus ?? null
    },
    { headers: { "Cache-Control": "private, max-age=30" } }
  );
}
