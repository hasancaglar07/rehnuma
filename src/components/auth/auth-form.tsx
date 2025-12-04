"use client";

import { useEffect, useState } from "react";
import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const authAppearance = {
  variables: {
    colorPrimary: "oklch(var(--primary) / 1)",
    colorText: "oklch(var(--foreground) / 1)",
    colorBackground: "oklch(var(--background) / 1)",
    borderRadius: "12px",
    fontFamily: "'Source Serif 4', 'Literata', serif"
  },
  elements: {
    rootBox: "w-full flex justify-center",
    card: "shadow-lg border border-border/70 bg-white/95 backdrop-blur-sm rounded-2xl w-full max-w-full",
    formFieldInput: "border border-border rounded-xl bg-white/95 text-sm px-3 py-2.5",
    formButtonPrimary:
      "rounded-full bg-[oklch(var(--primary)/1)] text-white font-semibold py-2.5 hover:brightness-110 transition shadow",
    headerTitle: "font-serif text-2xl",
    headerSubtitle: "text-sm text-muted-foreground",
    footer: "hidden",
    footerActionLink: "hidden"
  }
};

type Mode = "login" | "register";

type Props = {
  returnTo?: string;
  initialTab?: Mode;
};

export function AuthForm({ returnTo = "/profil", initialTab = "login" }: Props) {
  const [mode, setMode] = useState<Mode>(initialTab);
  useEffect(() => setMode(initialTab), [initialTab]);

  const toggleMode = () => setMode((prev) => (prev === "login" ? "register" : "login"));
  const modeTitle = mode === "login" ? "Giriş Yap" : "Üye Ol";
  const modeSubtitle =
    mode === "login" ? "E-postan ve şifrenle devam et." : "Yeni hesap oluştur, aboneliğe geç.";

  return (
    <div className="mx-auto w-full max-w-xl sm:max-w-2xl space-y-4 sm:space-y-5 px-3 sm:px-4">
      <div className="mb-2 flex flex-col items-center gap-2 text-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif">{modeTitle}</h1>
          <p className="text-sm text-muted-foreground">{modeSubtitle}</p>
        </div>
        <Button variant="link" onClick={toggleMode} className="px-0">
          {mode === "login" ? "Üye Ol" : "Giriş Yap"}
        </Button>
      </div>

      <SignedIn>
        <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm">
          <p className="font-semibold">Zaten giriş yaptınız.</p>
          <p className="text-muted-foreground">Profil sayfasına giderek aboneliğinizi yönetebilirsiniz.</p>
        </div>
      </SignedIn>

      <SignedOut>
        {mode === "login" ? (
          <SignIn
            path="/giris"
            routing="path"
            redirectUrl={returnTo}
            signUpUrl="/giris?tab=register"
            appearance={authAppearance}
          />
        ) : (
          <SignUp
            path="/giris"
            routing="path"
            redirectUrl={returnTo}
            signInUrl="/giris"
            appearance={authAppearance}
          />
        )}
      </SignedOut>
    </div>
  );
}
