ALTER TABLE "Payment" ADD COLUMN "statusResponse" JSONB;
ALTER TABLE "Payment" ADD COLUMN "refundResponse" JSONB;
ALTER TABLE "Payment" ADD COLUMN "cancelResponse" JSONB;
ALTER TABLE "Payment" ADD COLUMN "refundedAmount" INTEGER;
