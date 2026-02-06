-- AlterTable
ALTER TABLE "Vocabulary" ADD COLUMN     "addedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT;

-- CreateIndex
CREATE INDEX "Vocabulary_level_idx" ON "Vocabulary"("level");

-- CreateIndex
CREATE INDEX "Vocabulary_pos_idx" ON "Vocabulary"("pos");

-- CreateIndex
CREATE INDEX "Vocabulary_word_level_idx" ON "Vocabulary"("word", "level");
