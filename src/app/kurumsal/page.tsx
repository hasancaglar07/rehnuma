import Link from "next/link";
import type { Metadata } from "next";
import { getCorporateContent } from "@/lib/kurumsal-data";

export const metadata: Metadata = {
  title: "Kurumsal | Rehnüma Kadın Dergisi",
  description: "Rehnüma'nın misyonu, vizyonu, hikayesi ve künye bilgileri."
};

export const revalidate = 60;

export default async function KurumsalPage() {
  const content = await getCorporateContent();
  const sections = [
    { title: content.hakkimizda.title, href: "/kurumsal/hakkimizda", description: content.cards.hakkimizda },
    { title: content.misyon.title, href: "/kurumsal/misyon", description: content.cards.misyon },
    { title: content.vizyon.title, href: "/kurumsal/vizyon", description: content.cards.vizyon },
    { title: content.kunye.title, href: "/kurumsal/kunye", description: content.cards.kunye }
  ];
  return (
    <div className="min-h-screen">
      <main className="container space-y-10 py-12 lg:py-16">
        <div className="space-y-4 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Kurumsal</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">{content.landingTitle}</h1>
          <p className="text-lg text-muted-foreground">{content.landingDescription}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-serif">{item.title}</h2>
                <span className="rounded-full border border-border bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
                  Oku
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                Detaya git
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
