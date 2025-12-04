import type { Metadata } from "next";
import "./globals.css";
import { sourceSerif, literata, parisienne } from "@/styles/fonts";
import { SakuraMount } from "@/components/shared/sakura-mount";
import { BackgroundGlow } from "@/components/shared/background-glow";
import { PageTransition } from "@/components/shared/page-transition";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import HeroImage from "@/assets/hero.png";
import { ClerkProvider } from "@clerk/nextjs";
import { trTR } from "@clerk/localizations";
import { getBaseUrl } from "@/lib/url";

const clerkAppearance = {
  variables: {
    colorPrimary: "oklch(var(--primary) / 1)",
    colorText: "oklch(var(--foreground) / 1)",
    colorBackground: "oklch(var(--background) / 1)",
    borderRadius: "12px",
    fontFamily: "'Source Serif 4', 'Literata', serif"
  },
  elements: {
    formFieldInput: "border border-border rounded-xl bg-white/90 text-sm px-3 py-2.5",
    formButtonPrimary:
      "rounded-full bg-[oklch(var(--primary)/1)] text-white font-semibold py-2.5 hover:brightness-110 transition shadow",
    card: "shadow-xl border border-border/70 bg-white/90 backdrop-blur-sm rounded-2xl",
    headerTitle: "font-serif text-2xl",
    headerSubtitle: "text-sm text-muted-foreground",
    footer: "hidden",
    footerActionLink: "hidden"
  }
};

const clerkLocalization = {
  ...trTR,
  locale: "tr-TR",
  signIn: {
    ...trTR.signIn,
    start: {
      ...trTR.signIn?.start,
      title: "Giriş Yap",
      subtitle: "Hesabınla devam et"
    }
  },
  signUp: {
    ...trTR.signUp,
    start: {
      ...trTR.signUp?.start,
      title: "Üye Ol",
      subtitle: "Hızlıca kayıt ol, aboneliğini başlat"
    }
  }
};

export const metadata: Metadata = {
  title: "Rehnüma Kadın Dergisi",
  description: "Bilgeliğin ve zarafetin izinde dijital dergi deneyimi.",
  metadataBase: new URL(getBaseUrl()),
  applicationName: "Rehnüma Kadın Dergisi",
  referrer: "origin-when-cross-origin",
  themeColor: "#ffffff",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Rehnüma Kadın Dergisi",
    description: "Bilgeliğin ve zarafetin izinde dijital dergi deneyimi.",
    url: getBaseUrl(),
    siteName: "Rehnüma Kadın Dergisi",
    type: "website",
    locale: "tr_TR",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Rehnüma Kadın Dergisi" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Rehnüma Kadın Dergisi",
    description: "Bilgeliğin ve zarafetin izinde dijital dergi deneyimi.",
    images: ["/og-default.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = getBaseUrl();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Rehnüma Kadın Dergisi",
      url: baseUrl,
      logo: `${baseUrl}/og-default.png`,
      sameAs: []
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Rehnüma Kadın Dergisi",
      url: baseUrl
    }
  ];

  return (
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl="/giris"
      signUpUrl="/giris?tab=register"
      localization={clerkLocalization}
    >
      <html lang="tr" suppressHydrationWarning>
        <head>
          <link rel="stylesheet" href="/sakura/sakura.min.css" />
          <link rel="preload" as="image" href={HeroImage.src} />
          <link rel="preconnect" href="https://clerk.services" />
          <link rel="dns-prefetch" href="https://clerk.services" />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={`${sourceSerif.variable} ${literata.variable} ${parisienne.variable} font-sans antialiased`}>
          <div className="relative min-h-screen w-full bg-white overflow-hidden">
            <BackgroundGlow />
            <SakuraMount />
            <div className="relative z-10">
              <header>
                <Navbar />
              </header>
              <PageTransition>
                <main>{children}</main>
              </PageTransition>
              <Footer />
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
