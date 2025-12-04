import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Giriş işlemleri Clerk tarafından yönetiliyor. Lütfen Clerk giriş bileşenini kullanın." }, { status: 410 });
}
