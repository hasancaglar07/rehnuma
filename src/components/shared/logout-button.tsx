"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

type Props = {
  redirectTo?: string;
};

export function LogoutButton({ redirectTo = "/" }: Props) {
  return (
    <SignOutButton redirectUrl={redirectTo}>
      <Button variant="outline">Çıkış Yap</Button>
    </SignOutButton>
  );
}
