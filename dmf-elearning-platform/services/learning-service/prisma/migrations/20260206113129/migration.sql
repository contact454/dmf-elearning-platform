/*
  Warnings:

  - You are about to drop the `UserVocabularyProgress_old` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserVocabularyProgress_old" DROP CONSTRAINT "UserVocabularyProgress_vocabId_fkey";

-- AlterTable
ALTER TABLE "vocabulary_items" RENAME CONSTRAINT "Vocabulary_pkey" TO "vocabulary_items_pkey";

-- DropTable
DROP TABLE "UserVocabularyProgress_old";

-- RenameIndex
ALTER INDEX "user_word_unique" RENAME TO "user_word_progress_user_id_word_id_key";

-- RenameIndex
ALTER INDEX "Vocabulary_level_idx" RENAME TO "vocabulary_items_level_idx";

-- RenameIndex
ALTER INDEX "Vocabulary_pos_idx" RENAME TO "vocabulary_items_pos_idx";

-- RenameIndex
ALTER INDEX "Vocabulary_word_key" RENAME TO "vocabulary_items_word_key";

-- RenameIndex
ALTER INDEX "Vocabulary_word_level_idx" RENAME TO "vocabulary_items_word_level_idx";
