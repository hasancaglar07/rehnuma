import { NextRequest, NextResponse } from "next/server";
import { randomHex } from "@/utils/crypto";
import { put } from "@vercel/blob";
import { requireAdminGuard, requireCsrfGuard, requestIp } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

const ALLOWED_MIME = ["image/", "audio/", "application/pdf"];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  const limiter = await rateLimit("blob-upload", requestIp(req));
  if (!limiter.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const csrf = requireCsrfGuard(req);
  if (csrf) return csrf;

  const auth = await requireAdminGuard(req);
  if (auth instanceof NextResponse) return auth;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Blob token missing" }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.some((prefix) => mime.startsWith(prefix))) {
    return NextResponse.json({ error: "Sadece görsel, ses veya PDF yüklenebilir" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Dosya çok büyük" }, { status: 413 });
  }

  const rawFilename = (form.get("filename") as string | null) || file.name || "upload";
  const sanitized = rawFilename.replace(/[^\w.\-]/g, "_");
  const filename = `${Date.now()}-${randomHex(8)}-${sanitized}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      token,
      contentType: mime
    });
    await logAudit(auth.user, "upload", "blob", blob.url, { mime });
    return NextResponse.json({ url: blob.url, contentType: mime });
  } catch (err) {
    console.error("[upload] failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
