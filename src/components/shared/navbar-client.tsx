"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

import logo from "@/assets/logo-rehnuma.svg";

const navLinks = [
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/sayilar", label: "Sayılar" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/yazarlar", label: "Yazarlar" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" }
];

export function NavbarClient() {
  const { isSignedIn, user } = useUser();
  const [serverRole, setServerRole] = useState<string | null>(null);
  const role = useMemo(() => {
    const metaRole = user?.publicMetadata?.role as string | undefined;
    return metaRole || serverRole || null;
  }, [serverRole, user?.publicMetadata?.role]);
  const isAdmin = role === "admin";
  const isContentManager = role === "admin" || role === "editor" || role === "author";
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const closeAdminMenuTimeout = useRef<NodeJS.Timeout | null>(null);

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
  const openAdminMenu = () => {
    if (closeAdminMenuTimeout.current) {
      clearTimeout(closeAdminMenuTimeout.current);
    }
    setIsAdminMenuOpen(true);
  };
  const scheduleCloseAdminMenu = () => {
    if (closeAdminMenuTimeout.current) {
      clearTimeout(closeAdminMenuTimeout.current);
    }
    closeAdminMenuTimeout.current = setTimeout(() => setIsAdminMenuOpen(false), 200);
  };

  const profileLink = isSignedIn ? { href: "/profil", label: "Profil" } : null;
  const adminMenuLinks = isAdmin
    ? [
        { href: "/admin", label: "Admin" },
        { href: "/admin/kullanicilar", label: "Kullanıcılar" },
        { href: "/admin/yazilar", label: "Yönetim" }
      ]
    : [];
  const contentManagerLink = !isAdmin && isContentManager ? { href: "/admin/yazilar", label: "Yönetim" } : null;
  const mobileNavItems = [
    ...navLinks,
    ...(profileLink ? [profileLink] : []),
    ...adminMenuLinks,
    ...(!isAdmin && isContentManager ? [{ href: "/admin/yazilar", label: "Yönetim" }] : [])
  ];

  useEffect(() => {
    return () => {
      if (closeAdminMenuTimeout.current) {
        clearTimeout(closeAdminMenuTimeout.current);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 header-premium px-3 md:px-6">
      <div className="container">
        <div className="flex flex-col gap-2">
          <div className="header-shell flex w-full items-center justify-between gap-2 overflow-visible">
            <Link href="/" className="inline-flex items-center gap-3 shrink-0" aria-label="Rehnüma ana sayfa">
              <span className="sr-only">Rehnüma</span>
              <span className="logo-shine">
                <Image src={logo} alt="Rehnüma" className="logo-glow h-11 w-auto md:h-12" priority />
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
              {contentManagerLink ? (
                <Link href={contentManagerLink.href} prefetch={false} className="nav-link nav-link-muted">
                  {contentManagerLink.label}
                </Link>
              ) : null}
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
                <span className="sr-only">Menü</span>
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
                {isAdmin && adminMenuLinks.length > 0 && (
                  <div
                    className="relative"
                    onMouseEnter={openAdminMenu}
                    onMouseLeave={scheduleCloseAdminMenu}
                    onFocus={openAdminMenu}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        scheduleCloseAdminMenu();
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="nav-link nav-link-muted inline-flex items-center gap-1"
                      aria-haspopup="true"
                      aria-expanded={isAdminMenuOpen}
                      onClick={() => setIsAdminMenuOpen((prev) => !prev)}
                    >
                      Admin
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${isAdminMenuOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div
                      className={`absolute right-0 z-40 mt-2 w-52 flex-col gap-1 rounded-2xl border border-black/5 bg-white/95 p-2 shadow-xl backdrop-blur ${
                        isAdminMenuOpen ? "flex" : "hidden"
                      }`}
                      onMouseEnter={openAdminMenu}
                      onMouseLeave={scheduleCloseAdminMenu}
                    >
                      {adminMenuLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={false}
                          className="nav-link flex w-full justify-start rounded-xl px-3 py-2 text-left"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
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
                {mobileNavItems.map((item) => (
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
