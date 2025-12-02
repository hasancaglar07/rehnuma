"use client";
import { useEffect } from "react";
import { SakuraPlugin } from "@/lib/sakura-plugin";

export function SakuraMount() {
  useEffect(() => {
    let instance: SakuraPlugin | undefined;
    try {
      instance = new SakuraPlugin("body", {
        className: "sakura",
        colors: [
          { gradientColorStart: "rgba(132, 20, 80, 0.95)", gradientColorEnd: "rgba(214, 122, 176, 0.85)", gradientColorDegree: 125 },
          { gradientColorStart: "rgba(132, 20, 80, 0.9)", gradientColorEnd: "rgba(232, 157, 198, 0.8)", gradientColorDegree: 145 }
        ],
        delay: 380,
        fallSpeed: 0.7,
        minSize: 12,
        maxSize: 20
      });
    } catch (e) {
      console.error("[sakura] init failed", e);
    }

    return () => {
      if (instance) instance.stop();
      document.querySelectorAll(".sakura").forEach((n) => n.remove());
    };
  }, []);

  return null;
}
