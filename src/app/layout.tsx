import type { Metadata } from "next";
import "./globals.css";
import { sourceSerif, playfair, parisienne } from "@/styles/fonts";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SakuraMount } from "@/components/shared/sakura-mount";
import { BackgroundGlow } from "@/components/shared/background-glow";
import { ClerkProvider } from "@clerk/nextjs";
import { trTR } from "@clerk/localizations";

const clerkAppearance = {
  variables: {
    colorPrimary: "oklch(var(--primary) / 1)",
    colorText: "oklch(var(--foreground) / 1)",
    colorBackground: "oklch(var(--background) / 1)",
    borderRadius: "12px",
    fontFamily: "'Georgia', 'Times New Roman', serif"
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://example.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        </head>
        <body className={`${sourceSerif.variable} ${playfair.variable} ${parisienne.variable} font-sans antialiased`}>
          <ThemeProvider>
            <div className="relative min-h-screen w-full bg-white overflow-hidden">
              <BackgroundGlow />
              <SakuraMount />
              <div className="relative z-10">{children}</div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
