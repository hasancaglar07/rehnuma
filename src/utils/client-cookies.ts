export function getCsrfToken() {
  if (typeof document === "undefined") return "";
  const token = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("csrf_token="));
  return token ? decodeURIComponent(token.split("=")[1] ?? "") : "";
}
