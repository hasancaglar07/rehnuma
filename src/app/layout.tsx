import type { Metadata } from "next";
import "./globals.css";
import { sourceSerif, playfair, parisienne } from "@/styles/fonts";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SakuraMount } from "@/components/shared/sakura-mount";
import { BackgroundGlow } from "@/components/shared/background-glow";

export const metadata: Metadata = {
  title: "Rehnüma Kadın Dergisi",
  description: "Bilgeliğin ve zarafetin izinde dijital dergi deneyimi.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://example.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
