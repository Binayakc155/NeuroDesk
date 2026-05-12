-- AlterTable
ALTER TABLE "FocusSession"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "pausedAt" TIMESTAMP(3),
ADD COLUMN "pausedDuration" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing completed sessions so historical data matches the new lifecycle semantics
UPDATE "FocusSession"
SET "status" = 'completed'
WHERE "endTime" IS NOT NULL;
