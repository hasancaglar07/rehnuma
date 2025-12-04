"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SsoCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">Üye kaydınız tamamlanıyor, lütfen bekleyin...</p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
