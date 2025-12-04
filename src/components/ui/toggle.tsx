import * as React from "react";
import { cn } from "@/lib/cn";

type ToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
};

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(({ className, pressed, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm transition",
        pressed ? "bg-primary text-primary-foreground shadow-sm" : "border-border bg-background text-foreground hover:bg-secondary/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Toggle.displayName = "Toggle";
