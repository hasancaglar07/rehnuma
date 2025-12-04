-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "coverUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
