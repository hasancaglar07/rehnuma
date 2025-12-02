"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo-rehnuma.svg";

const links = [
  { href: "/kategori/annelik-cocuk", label: "Annelik" },
  { href: "/kategori/maneviyat-islami-ilimler", label: "Maneviyat" },
  { href: "/kategori/aile-evlilik", label: "Aile" },
  { href: "/dergi", label: "Dergi" },
  { href: "/abonelik", label: "Abonelik" },
  { href: "/profil", label: "Profil" }
];

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 header-premium px-3 md:px-6">
      <div className="container">
        <div className="flex flex-col gap-2">
          <div className="header-shell flex w-full items-center justify-between gap-2 overflow-hidden">
            <Link href="/" className="inline-flex items-center gap-3 shrink-0" aria-label="Rehnüma ana sayfa">
              <span className="sr-only">Rehnüma</span>
              <span className="logo-shine">
                <Image src={logo} alt="Rehnüma" className="logo-glow h-11 w-auto md:h-12" priority />
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              {links.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1.5 text-sm whitespace-nowrap">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/90 px-2.5 py-2 text-sm font-semibold text-neutral-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow lg:hidden"
                aria-expanded={isMobileOpen}
                aria-controls="mobile-categories"
                onClick={toggleMobile}
              >
                <span className="sr-only">Kategoriler</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${isMobileOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="hidden items-center gap-2 lg:flex">
                <Link href="/admin" className="nav-link nav-link-muted">
                  Admin
                </Link>
                <Link href="/abonelik" className="nav-cta">
                  Abonelik
                </Link>
              </div>
            </div>
          </div>
          {isMobileOpen ? (
            <div
              id="mobile-categories"
              className="lg:hidden rounded-3xl border border-black/5 bg-white/95 px-2 py-2 shadow-lg backdrop-blur-md"
            >
              <nav className="flex flex-col gap-1 text-sm">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full justify-center text-base ${
                      item.href === "/abonelik" ? "nav-cta" : "nav-link"
                    }`}
                    onClick={closeMobile}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
