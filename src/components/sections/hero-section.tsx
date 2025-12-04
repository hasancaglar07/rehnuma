import Link from "next/link";
import Image from "next/image";
import HeroImage from "@/assets/hero.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container relative">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Dijital Dergi</p>
            <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
              Bilgeliğin ve Zarafetin İzinde <span className="font-accent text-rose-700">Kadınlara Rehber.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              İslami ilimler, annelik, şiir ve manevi yazılarla dolu modern ve zarif bir deneyim. Sakin, akıcı ve şefkatli bir okuma atmosferi için tasarlandı.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dergi"
                className="px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:-translate-y-0.5 transition"
              >
                Son Sayıyı Oku
              </Link>
              <Link
                href="/abonelik"
                className="px-5 py-3 rounded-full border border-primary/30 bg-white text-primary hover:-translate-y-0.5 transition shadow-sm"
              >
                Aboneliği Başlat
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative h-[420px] w-full overflow-hidden">
              <Image
                src={HeroImage}
                alt="Rehnüma hero"
                fill
                className="object-cover object-center scale-110 translate-x-6 rounded-l-[40px]"
                priority
                placeholder="blur"
              />
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-l from-transparent via-white/55 to-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
