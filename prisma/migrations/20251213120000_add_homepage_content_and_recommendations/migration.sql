-- Add recommendation flag to articles
ALTER TABLE "Article" ADD COLUMN "isRecommended" BOOLEAN NOT NULL DEFAULT false;

-- Add visibility flag to author profiles
ALTER TABLE "AuthorProfile" ADD COLUMN "isListed" BOOLEAN NOT NULL DEFAULT true;

-- Homepage content settings
CREATE TABLE "HomepageContent" (
  "id" TEXT NOT NULL,
  "heroBadge" TEXT,
  "heroTitle" TEXT NOT NULL,
  "heroAccent" TEXT,
  "heroDescription" TEXT NOT NULL,
  "heroPrimaryCtaLabel" TEXT NOT NULL,
  "heroPrimaryCtaHref" TEXT NOT NULL,
  "heroSecondaryCtaLabel" TEXT,
  "heroSecondaryCtaHref" TEXT,
  "heroImageUrl" TEXT,
  "heroImageAlt" TEXT,
  "recommendationsTitle" TEXT NOT NULL,
  "recommendationsDescription" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);
