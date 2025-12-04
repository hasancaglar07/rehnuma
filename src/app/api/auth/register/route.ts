import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Kayıt işlemleri artık Clerk üzerinden ilerliyor. Lütfen Clerk kayıt bileşenini kullanın." }, { status: 410 });
}
