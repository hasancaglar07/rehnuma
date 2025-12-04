export function toExcerpt(text: string, max = 140) {
  if (!text) return "";
  const clean = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}…`;
}
