"use client";
import { useEffect } from "react";
import { SakuraPlugin } from "@/lib/sakura-plugin";

export function SakuraMount() {
  useEffect(() => {
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    let instance: SakuraPlugin | undefined;
    try {
      instance = new SakuraPlugin("#sakura-layer", {
        className: "sakura",
        colors: [
          { gradientColorStart: "rgba(132, 20, 80, 0.95)", gradientColorEnd: "rgba(214, 122, 176, 0.85)", gradientColorDegree: 125 },
          { gradientColorStart: "rgba(132, 20, 80, 0.9)", gradientColorEnd: "rgba(232, 157, 198, 0.8)", gradientColorDegree: 145 }
        ],
        delay: reduceMotion ? 1200 : isMobile ? 800 : 380,
        fallSpeed: reduceMotion ? 0.4 : 0.7,
        minSize: 10,
        maxSize: reduceMotion ? 12 : isMobile ? 16 : 20
      });
    } catch (e) {
      console.error("[sakura] init failed", e);
    }

    return () => {
      if (instance) instance.stop();
      document.querySelector("#sakura-layer")?.querySelectorAll(".sakura").forEach((n) => n.remove());
    };
  }, []);

  return <div id="sakura-layer" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" />;
}
