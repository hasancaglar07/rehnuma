import Link from "next/link";
import HeroImage from "@/assets/hero.png";
import type { HomepageContent } from "@/lib/homepage";

type Props = {
  content: HomepageContent;
};

export function HeroSection({ content }: Props) {
  const imageUrl = content.heroImageUrl || HeroImage.src;
  const imageAlt = content.heroImageAlt || "Rehnuma hero";
  const hasSecondary = Boolean(content.heroSecondaryCtaLabel && content.heroSecondaryCtaHref);

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container relative">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="max-w-3xl space-y-6">
            {content.heroBadge ? (
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{content.heroBadge}</p>
            ) : null}
            <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
              {content.heroTitle}{" "}
              {content.heroAccent ? <span className="font-accent text-rose-700">{content.heroAccent}</span> : null}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {content.heroDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={content.heroPrimaryCtaHref}
                className="px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:-translate-y-0.5 transition"
              >
                {content.heroPrimaryCtaLabel}
              </Link>
              {hasSecondary ? (
                <Link
                  href={content.heroSecondaryCtaHref!}
                  className="px-5 py-3 rounded-full border border-primary/30 bg-white text-primary hover:-translate-y-0.5 transition shadow-sm"
                >
                  {content.heroSecondaryCtaLabel}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative h-[420px] w-full overflow-hidden">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full w-full object-cover object-center scale-110 translate-x-6 rounded-l-[40px]"
                loading="eager"
              />
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-l from-transparent via-white/55 to-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
