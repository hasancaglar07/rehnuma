"use client";
import Link from "next/link";

export function PaywallOverlay() {
  return (
    <div className="bg-gradient-to-b from-background/80 to-background/90 backdrop-blur rounded-xl p-6 border shadow-lg text-center">
      <h3 className="text-lg font-semibold">Devamını okumak için abone olun.</h3>
      <p className="text-sm text-muted-foreground mt-2">Tam içerik, sesli anlatım ve dergi arşivi abonelere açık.</p>
      <Link
        href="/abonelik"
        className="inline-flex mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:-translate-y-0.5 transition"
      >
        Aboneliği Başlat
      </Link>
    </div>
  );
}
