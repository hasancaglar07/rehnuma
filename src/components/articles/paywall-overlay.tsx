"use client";
import Link from "next/link";

type Props = {
  returnTo: string;
  isSignedIn?: boolean;
  hasAudio?: boolean;
  wordCount?: number;
  readingMinutes?: number;
};

export function PaywallOverlay({ returnTo, isSignedIn, hasAudio, wordCount, readingMinutes }: Props) {
  const benefits = [
    "Tüm yazıların tamamı",
    hasAudio ? "Sesli dinleme" : "Dergi arşivi ve flipbook",
    "Kaydetme ve okuma ilerlemesi"
  ].filter(Boolean);

  return (
    <div className="bg-gradient-to-b from-background/80 to-background/90 backdrop-blur rounded-xl p-6 border shadow-lg text-center">
      <h3 className="text-lg font-semibold">Devamı abonelere özel</h3>
      <p className="text-sm text-muted-foreground mt-2">
        {readingMinutes ? `${readingMinutes} dk · ` : ""}
        {wordCount ? `${wordCount} kelime · ` : ""}Paywallı kaldırmak için giriş yap veya abone ol.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground/90">
        {benefits.map((item) => (
          <span key={item} className="rounded-full border border-border px-3 py-1">
            {item}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {!isSignedIn && (
          <Link
            href={returnTo}
            className="inline-flex px-4 py-2 rounded-full border border-border bg-background hover:-translate-y-0.5 transition"
          >
            Giriş yap
          </Link>
        )}
        <Link
          href="/abonelik"
          className="inline-flex px-4 py-2 rounded-full bg-primary text-primary-foreground hover:-translate-y-0.5 transition"
        >
          Abone ol
        </Link>
      </div>
    </div>
  );
}
