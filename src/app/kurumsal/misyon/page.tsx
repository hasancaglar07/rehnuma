import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Misyon | Rehnüma Kadın Dergisi",
  description: "Kadınların iç dünyasını zenginleştiren, aileyi güçlendiren, kültür ve sanatla hayatı güzelleştiren içerikler üretmek."
};

export default function MisyonPage() {
  return (
    <div className="min-h-screen">
      <main className="container space-y-8 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Kurumsal</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">Misyon</h1>
          <p className="text-lg text-muted-foreground">
            Kadınların iç dünyasını zenginleştiren, aileyi güçlendiren, kültür ve sanatla hayatı güzelleştiren içerikler üretmek.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-4 max-w-4xl">
          <p className="text-base md:text-lg leading-relaxed text-foreground/90">
            Rehnüma’nın misyonu; kadınların ruhsal ve zihinsel yolculuklarında güvenilir bir refakatçi olmak, aileyi ve sosyal
            bağları güçlendirecek ilhamı sunmak ve kültür-sanatla günlük hayatı daha zarif kılmaktır.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Maneviyatı besleyen, güven veren içerikler üretmek</li>
            <li>• Kadınların üretkenliğini ve estetik duyarlılığını desteklemek</li>
            <li>• Aileyi güçlendiren ve toplumsal iyiliği önceleyen öneriler sunmak</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
