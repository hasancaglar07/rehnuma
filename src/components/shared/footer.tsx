import Link from "next/link";

const navigation = [
  { href: "/sayilar", label: "Sayılar" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/yazarlar", label: "Yazarlar" },
  { href: "/blog", label: "Blog" },
  { href: "/kurumsal", label: "Kurumsal" }
];

const legalLinks = [
  { href: "/gizlilik-politikasi", label: "Gizlilik" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/iletisim", label: "İletişim" }
];

const roseVideoSrc = "/rose-video.mp4";

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          src={roseVideoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/55" />
      </div>

      <div className="relative container py-14 space-y-10">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Rehnüma Kadın Dergisi</p>
            <h2 className="text-3xl md:text-4xl font-serif leading-tight">Bilgeliğin ve zarafetin izinde.</h2>
            <p className="text-muted-foreground text-lg">
              Maneviyat, annelik ve zarif yaşam kültürünü dijital bir deneyimde buluşturan Rehnüma; sakin, akıcı ve güvenli
              bir okuma atmosferi sunar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sayilar" className="px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:-translate-y-0.5 transition">
                Sayılara Git
              </Link>
              <Link
                href="/iletisim"
                className="px-5 py-3 rounded-full border border-primary/30 bg-white text-primary hover:-translate-y-0.5 transition shadow-sm"
              >
                İletişime Geç
              </Link>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Keşfet</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Bilgilendirme</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {legalLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Destek</p>
                <Link href="mailto:destek@rehnuma.com" className="hover:text-primary">
                  destek@rehnuma.com
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border/70 bg-white/70 backdrop-blur-sm">
        <div className="container py-6 text-sm text-muted-foreground flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Rehnüma Kadın Dergisi</span>
          <div className="flex flex-wrap gap-3">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
