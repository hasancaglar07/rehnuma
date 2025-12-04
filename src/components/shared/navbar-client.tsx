"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

import logo from "@/assets/logo-rehnuma.svg";

const mainLinks = [
  { href: "/kategori/annelik-cocuk", label: "Annelik" },
  { href: "/kategori/maneviyat-islami-ilimler", label: "Maneviyat" },
  { href: "/kategori/aile-evlilik", label: "Aile" },
  { href: "/dergi", label: "Dergi" }
];

export function NavbarClient() {
  const { isSignedIn, user } = useUser();
  const [serverRole, setServerRole] = useState<string | null>(null);
  const isAdmin = useMemo(() => {
    const metaRole = user?.publicMetadata?.role as string | undefined;
    return (metaRole || serverRole) === "admin";
  }, [serverRole, user]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setServerRole(null);
      return;
    }
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setServerRole(data.role ?? null);
      })
      .catch(() => {
        if (!cancelled) setServerRole(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  const profileLink = isSignedIn ? { href: "/profil", label: "Profil" } : null;

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
              {mainLinks.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
              {profileLink ? (
                <Link href={profileLink.href} className="nav-link">
                  {profileLink.label}
                </Link>
              ) : null}
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
                {isAdmin && (
                  <>
                    <Link href="/admin" prefetch={false} className="nav-link nav-link-muted">
                      Admin
                    </Link>
                    <Link href="/admin/kullanicilar" prefetch={false} className="nav-link nav-link-muted">
                      Kullanıcılar
                    </Link>
                  </>
                )}
                <Link href="/abonelik" className="nav-cta">
                  Abone Ol
                </Link>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="nav-link nav-link-muted">Giriş</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="nav-link nav-link-muted">Üye Ol</button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
                </SignedIn>
              </div>
            </div>
          </div>
          {isMobileOpen ? (
            <div
              id="mobile-categories"
              className="lg:hidden rounded-3xl border border-black/5 bg-white/95 px-2 py-2 shadow-lg backdrop-blur-md"
            >
              <nav className="flex flex-col gap-1 text-sm">
                {[...mainLinks]
                  .concat(profileLink ? [profileLink] : [])
                  .concat(isAdmin ? [{ href: "/admin", label: "Admin" }] : [])
                  .concat(isAdmin ? [{ href: "/admin/kullanicilar", label: "Kullanıcılar" }] : [])
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full justify-center text-base ${item.href === "/abonelik" ? "nav-cta" : "nav-link"}`}
                      onClick={closeMobile}
                    >
                      {item.label}
                    </Link>
                  ))}
                <div className="px-2 py-1">
                  <SignedIn>
                    <div className="flex items-center gap-2">
                      <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
                      <Link href="/profil" className="text-sm underline">
                        Profil
                      </Link>
                    </div>
                  </SignedIn>
                  <SignedOut>
                    <div className="flex gap-2">
                      <SignInButton mode="modal">
                        <button className="nav-link nav-link-muted w-full text-center">Giriş</button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="nav-link nav-link-muted w-full text-center">Üye Ol</button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                </div>
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
