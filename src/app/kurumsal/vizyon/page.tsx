import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vizyon | Rehnüma Kadın Dergisi",
  description: "Zarafeti, bilgeliği ve üretkenliği birleştiren; kadınlara manevi ve kültürel derinlik kazandıran bir yayın olmak."
};

export default function VizyonPage() {
  return (
    <div className="min-h-screen">
      <main className="container space-y-8 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Kurumsal</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">Vizyon</h1>
          <p className="text-lg text-muted-foreground">
            Zarafeti, bilgeliği ve üretkenliği birleştiren; kadınlara manevi ve kültürel derinlik kazandıran bir yayın olmak.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-4 max-w-4xl">
          <p className="text-base md:text-lg leading-relaxed text-foreground/90">
            Rehnüma, her kadının içsel zenginliğini keşfetmesini, kültürel kökleriyle bağ kurmasını ve üretkenliğini zarafetle
            beslemesini destekleyen bir dergi olarak konumlanır.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• İlham verici, derinlikli ve güvenilir içeriklerle yol arkadaşlığı yapmak</li>
            <li>• Manevi duyarlılık ile estetik yaşam anlayışını birleştirmek</li>
            <li>• Dijitalde sakin ve rafine bir okuma deneyimi sağlamak</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
