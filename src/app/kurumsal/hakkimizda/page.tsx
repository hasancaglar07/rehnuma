import type { Metadata } from "next";
import { getCorporateContent } from "@/lib/kurumsal-data";

export const metadata: Metadata = {
  title: "Hakkımızda | Rehnüma Kadın Dergisi",
  description: "Rehnüma'nın hikayesi, kadınlara sunduğu rehberlik ve değerler dünyası."
};

export const revalidate = 60;

export default async function HakkimizdaPage() {
  const { hakkimizda } = await getCorporateContent();
  return (
    <div className="min-h-screen">
      <main className="container space-y-10 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Kurumsal</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">{hakkimizda.title}</h1>
          <p className="text-lg text-muted-foreground">{hakkimizda.description}</p>
        </div>

        <div className="space-y-5 max-w-4xl">
          {hakkimizda.paragraphs.map((text, index) => (
            <p key={`${index}-${text.slice(0, 12)}`} className="text-base md:text-lg leading-relaxed text-foreground/90">
              {text}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}
