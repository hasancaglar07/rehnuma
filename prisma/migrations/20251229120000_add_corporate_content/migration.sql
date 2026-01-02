-- Corporate content settings
CREATE TABLE "CorporateContent" (
  "id" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CorporateContent_pkey" PRIMARY KEY ("id")
);
