import type { Metadata } from "next";

const paragraphs = [
  "Rehnüma, kadınların ruhsal, entelektüel ve kültürel gelişimini desteklemek amacıyla hazırlanan bir yaşam dergisidir. Modern dünyanın yoğun akışına karşı sakinlik, derinlik ve ilham sunmayı; kadının hem içsel hem de sosyal ihtiyaçlarına incelikle dokunmayı hedefler.",
  "Hayata zarafetle bakan, üretmeyi değerli gören ve kültürel köklerle bağ kuran kadınlar için güvenilir bir rehber olmayı amaçlayan Rehnüma; manevi duyarlılığı, kültürel farkındalığı ve estetik bir yaşam anlayışını bir araya getirir.",
  "Her sayısında dinginlik, farkındalık ve ilham taşıyan içerikler sunan Rehnüma; aileden sanata, kişisel gelişimden kültürel mirasa kadar geniş bir yelpazede kadının hayatına değer katar.",
  "Rehnüma, kadınların dünyasına ışık düşürmeyi; onların duygu, düşünce ve üretim yolculuklarında zarafetle eşlik etmeyi amaçlar. Bu yolculukta her kadın için bir nefes, bir durak, bir ilham kaynağı olmak dileğiyle…"
];

export const metadata: Metadata = {
  title: "Hakkımızda | Rehnüma Kadın Dergisi",
  description: "Rehnüma'nın hikayesi, kadınlara sunduğu rehberlik ve değerler dünyası."
};

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen">
      <main className="container space-y-10 py-12 lg:py-16">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Kurumsal</p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">Hakkımızda</h1>
          <p className="text-lg text-muted-foreground">
            Kadınların içsel yolculuğuna zarafetle eşlik eden, maneviyat ve kültürü buluşturan dijital dergi deneyimi.
          </p>
        </div>

        <div className="space-y-5 max-w-4xl">
          {paragraphs.map((text) => (
            <p key={text.slice(0, 24)} className="text-base md:text-lg leading-relaxed text-foreground/90">
              {text}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}
