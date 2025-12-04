import { Playfair_Display, Parisienne, Source_Serif_4 } from "next/font/google";

// Display + accent font stack
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-serif"
});

export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans"
});

export const parisienne = Parisienne({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-accent"
});
