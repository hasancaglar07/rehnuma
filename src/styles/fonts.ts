import { Playfair_Display, Source_Serif_4, Parisienne } from "next/font/google";

export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

export const parisienne = Parisienne({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: "400",
  display: "swap"
});
