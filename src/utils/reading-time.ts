const WORDS_PER_MINUTE = 190;

export function estimateReadingMinutes(text?: string | null) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  return Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
}

export function isShortRead(text?: string | null, thresholdMinutes = 4) {
  if (!text) return false;
  return estimateReadingMinutes(text) <= thresholdMinutes;
}
