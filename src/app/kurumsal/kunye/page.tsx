import type { Metadata } from "next";
import { getCorporateContent } from "@/lib/kurumsal-data";

export const metadata: Metadata = {
  title: "Künye | Rehnüma Kadın Dergisi",
  description: "Editoryal ekip, iletişim ve yasal bilgilere dair künye iskeleti."
};

export const revalidate = 60;

export default async function KunyePage() {
  const { kunye } = await getCorporateContent();
  return (
    <div className="min-h-screen">
      <main className="container space-y-10 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Kurumsal</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">{kunye.title}</h1>
          <p className="text-lg text-muted-foreground">{kunye.description}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {kunye.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-3"
            >
              <h2 className="text-xl font-serif">{section.title}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <li key={`${section.title}-${item.label}`} className="flex flex-col">
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <span>{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
