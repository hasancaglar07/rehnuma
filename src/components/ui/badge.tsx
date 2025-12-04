import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "success" | "outline";
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  neutral: "bg-secondary/60 text-foreground",
  success: "bg-emerald-100 text-emerald-800",
  outline: "border border-border text-muted-foreground"
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", variants[variant], className)}
      {...props}
    />
  );
}
