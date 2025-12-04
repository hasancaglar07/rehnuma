import Link from "next/link";

export function IssueShowcase({ coverUrl }: { coverUrl?: string }) {
  return (
    <section className="container py-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[1.65rem] md:text-[1.85rem] font-serif font-semibold tracking-[-0.01em] text-foreground">
          Bu Ayın Sayısı
        </h2>
        <Link href="/dergi" className="text-sm text-primary">
          Arşive git
        </Link>
      </div>
      <div className="border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 bg-background/70">
        <div className="w-40 h-56 bg-secondary/40 rounded-lg border border-border flex items-center justify-center text-sm">
          {coverUrl ? (
            <img src={coverUrl} alt="Dergi Kapağı" className="w-full h-full object-cover rounded-lg" loading="lazy" />
          ) : (
            "Kapak"
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Yalnızca abonelere özel</p>
          <h3 className="font-sans text-[1.18rem] leading-[1.4] font-semibold tracking-[-0.01em] text-foreground">
            Dijital Dergi
          </h3>
          <p className="text-sm text-muted-foreground">
            Flipbook deneyimi, içindekiler ve yazarlar listesi ile aylık sayılar.
          </p>
          <div className="flex gap-3">
            <Link href="/dergi" className="px-4 py-2 rounded-full bg-primary text-primary-foreground">
              Sayıyı Aç
            </Link>
            <Link href="/abonelik" className="px-4 py-2 rounded-full border border-border">
              Abone Ol
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
