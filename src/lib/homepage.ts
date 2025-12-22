export const DEFAULT_HOMEPAGE_CONTENT = {
  heroBadge: "Dijital Dergi",
  heroTitle: "Bilgeliğin ve Zarafetin Izinde",
  heroAccent: "Kadinlara Rehber.",
  heroDescription:
    "Islami ilimler, annelik, siir ve manevi yazilarla dolu modern ve zarif bir deneyim. Sakin, akici ve sefkatli bir okuma atmosferi icin tasarlandi.",
  heroPrimaryCtaLabel: "Son Sayiyi Oku",
  heroPrimaryCtaHref: "/dergi",
  heroSecondaryCtaLabel: "Aboneligi Baslat",
  heroSecondaryCtaHref: "/abonelik",
  heroImageUrl: "",
  heroImageAlt: "Rehnuma hero",
  recommendationsTitle: "Tavsiyeler",
  recommendationsDescription: "Editor secimleriyle ozenle derlenen guncel tavsiyeler."
};

export type HomepageContent = typeof DEFAULT_HOMEPAGE_CONTENT;

export function normalizeHomepageContent(content?: Partial<Record<keyof HomepageContent, string | null>> | null): HomepageContent {
  if (!content) return DEFAULT_HOMEPAGE_CONTENT;
  return {
    heroBadge: content.heroBadge ?? "",
    heroTitle: content.heroTitle ?? DEFAULT_HOMEPAGE_CONTENT.heroTitle,
    heroAccent: content.heroAccent ?? "",
    heroDescription: content.heroDescription ?? DEFAULT_HOMEPAGE_CONTENT.heroDescription,
    heroPrimaryCtaLabel: content.heroPrimaryCtaLabel ?? DEFAULT_HOMEPAGE_CONTENT.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: content.heroPrimaryCtaHref ?? DEFAULT_HOMEPAGE_CONTENT.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: content.heroSecondaryCtaLabel ?? "",
    heroSecondaryCtaHref: content.heroSecondaryCtaHref ?? "",
    heroImageUrl: content.heroImageUrl ?? "",
    heroImageAlt: content.heroImageAlt ?? DEFAULT_HOMEPAGE_CONTENT.heroImageAlt,
    recommendationsTitle: content.recommendationsTitle ?? DEFAULT_HOMEPAGE_CONTENT.recommendationsTitle,
    recommendationsDescription: content.recommendationsDescription ?? ""
  };
}
