const DEFAULT_BASE_URL = "https://rehnuma-lilac.vercel.app";

export function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_URL;
  if (raw?.startsWith("http://") || raw?.startsWith("https://")) {
    return raw;
  }
  if (raw) {
    return `https://${raw}`;
  }
  return DEFAULT_BASE_URL;
}
