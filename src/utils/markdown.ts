// Normalize common markdown quirks (like spaces inside emphasis markers) to avoid rendering mismatches.
export function normalizeEmphasisSpacing(text: string) {
  if (!text) return "";

  // Trim whitespace immediately after opening and before closing bold markers (** or __).
  let normalized = text.replace(/(\*\*|__)\s*([^\r\n]*?)\s*(\1)/g, (_, marker: string, inner: string) => {
    const trimmed = inner.trim();
    return `${marker}${trimmed}${marker}`;
  });

  // Do the same for italic markers (* or _), avoiding double markers.
  normalized = normalized.replace(/(^|[^*])\*\s*([^\r\n*]+?)\s*\*(?!\*)/g, (_, prefix: string, inner: string) => {
    return `${prefix}*${inner.trim()}*`;
  });
  normalized = normalized.replace(/(^|[^_])_\s*([^\r\n_]+?)\s*_(?!_)/g, (_, prefix: string, inner: string) => {
    return `${prefix}_${inner.trim()}_`;
  });

  return normalized;
}
