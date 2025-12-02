import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo-rehnuma.svg";

const links = [
  { href: "/kategori/annelik-cocuk", label: "Annelik" },
  { href: "/kategori/maneviyat-islami-ilimler", label: "Maneviyat" },
  { href: "/kategori/aile-evlilik", label: "Aile" },
  { href: "/dergi", label: "Dergi" },
  { href: "/abonelik", label: "Abonelik" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 header-premium px-3 md:px-6">
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Rehnüma ana sayfa">
            <span className="sr-only">Rehnüma</span>
            <span className="logo-shine">
              <Image src={logo} alt="Rehnüma" className="logo-glow h-10 w-auto" priority />
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            <Link href="/profil" className="nav-link nav-link-muted">
              Profil
            </Link>
            <Link href="/admin" className="nav-link nav-link-muted hidden sm:inline-flex">
              Admin
            </Link>
            <Link href="/abonelik" className="nav-cta">
              Abonelik
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
