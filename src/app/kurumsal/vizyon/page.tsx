import type { Metadata } from "next";
import { getCorporateContent } from "@/lib/kurumsal-data";

export const metadata: Metadata = {
  title: "Vizyon | Rehnüma Kadın Dergisi",
  description: "Zarafeti, bilgeliği ve üretkenliği birleştiren; kadınlara manevi ve kültürel derinlik kazandıran bir yayın olmak."
};

export const revalidate = 60;

export default async function VizyonPage() {
  const { vizyon } = await getCorporateContent();
  return (
    <div className="min-h-screen">
      <main className="container space-y-8 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Kurumsal</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">{vizyon.title}</h1>
          <p className="text-lg text-muted-foreground">{vizyon.description}</p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-4 max-w-4xl">
          <p className="text-base md:text-lg leading-relaxed text-foreground/90">{vizyon.body}</p>
          <ul className="space-y-2 text-muted-foreground">
            {vizyon.bullets.map((item, index) => (
              <li key={`${index}-${item.slice(0, 12)}`}>• {item}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
