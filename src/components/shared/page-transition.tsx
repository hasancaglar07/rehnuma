"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function PageTransition({ children }: Props) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
