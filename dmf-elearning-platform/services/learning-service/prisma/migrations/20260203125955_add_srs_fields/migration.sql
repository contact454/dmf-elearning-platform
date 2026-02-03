-- AlterTable
ALTER TABLE "UserVocabularyProgress" ADD COLUMN     "correctReviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lapseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "repetitions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'new';

-- AlterTable
ALTER TABLE "Vocabulary" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "familyWords" TEXT[],
ADD COLUMN     "grammarTags" TEXT[],
ADD COLUMN     "phoneticIpa" TEXT;

-- CreateIndex
CREATE INDEX "UserVocabularyProgress_userId_status_idx" ON "UserVocabularyProgress"("userId", "status");

-- CreateIndex
CREATE INDEX "UserVocabularyProgress_userId_nextReviewAt_idx" ON "UserVocabularyProgress"("userId", "nextReviewAt");
