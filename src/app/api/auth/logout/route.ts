import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  const { sessionId } = await auth();
  if (sessionId) {
    const client = await clerkClient();
    await client.sessions.revokeSession(sessionId);
  }
  return NextResponse.json({ ok: true });
}
