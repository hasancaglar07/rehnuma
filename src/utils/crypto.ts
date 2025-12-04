const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashSha256Hex(input: string) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
    return toHex(digest);
  }
  const nodeCrypto = await import("crypto");
  return nodeCrypto.createHash("sha256").update(input).digest("hex");
}

export function randomHex(bytes: number) {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Node.js fallback
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = require("crypto") as typeof import("crypto");
  return nodeCrypto.randomBytes(bytes).toString("hex");
}
