"use client";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Açık moda geç" : "Karanlık moda geç"}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M21.752 15.002A9.718 9.718 0 0 1 12 21.75 9.75 9.75 0 0 1 8.25 3a.75.75 0 0 1 .75.75 8.25 8.25 0 0 0 12 12 .75.75 0 0 1 .752-.748Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.59 1.591M5.25 12H3m4.227-4.773-1.591-1.59M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      )}
      <span>{isDark ? "Karanlık" : "Aydınlık"}</span>
    </button>
  );
}
