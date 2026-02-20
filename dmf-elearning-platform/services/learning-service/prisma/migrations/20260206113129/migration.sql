/*
  Warnings:

  - You are about to drop the `UserVocabularyProgress_old` table. If the table is not empty, all the data it contains will be lost.

*/
-- NOTE:
-- This migration is made idempotent to support clean database bootstrap where
-- "UserVocabularyProgress_old" may not exist.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'UserVocabularyProgress_old'
      AND constraint_name = 'UserVocabularyProgress_vocabId_fkey'
  ) THEN
    ALTER TABLE "UserVocabularyProgress_old" DROP CONSTRAINT "UserVocabularyProgress_vocabId_fkey";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'vocabulary_items'
      AND constraint_name = 'Vocabulary_pkey'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'vocabulary_items'
      AND constraint_name = 'vocabulary_items_pkey'
  ) THEN
    ALTER TABLE "vocabulary_items" RENAME CONSTRAINT "Vocabulary_pkey" TO "vocabulary_items_pkey";
  END IF;
END $$;

DROP TABLE IF EXISTS "UserVocabularyProgress_old";

DO $$
BEGIN
  IF to_regclass('"user_word_unique"') IS NOT NULL
    AND to_regclass('"user_word_progress_user_id_word_id_key"') IS NULL THEN
    ALTER INDEX "user_word_unique" RENAME TO "user_word_progress_user_id_word_id_key";
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('"Vocabulary_level_idx"') IS NOT NULL
    AND to_regclass('"vocabulary_items_level_idx"') IS NULL THEN
    ALTER INDEX "Vocabulary_level_idx" RENAME TO "vocabulary_items_level_idx";
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('"Vocabulary_pos_idx"') IS NOT NULL
    AND to_regclass('"vocabulary_items_pos_idx"') IS NULL THEN
    ALTER INDEX "Vocabulary_pos_idx" RENAME TO "vocabulary_items_pos_idx";
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('"Vocabulary_word_key"') IS NOT NULL
    AND to_regclass('"vocabulary_items_word_key"') IS NULL THEN
    ALTER INDEX "Vocabulary_word_key" RENAME TO "vocabulary_items_word_key";
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('"Vocabulary_word_level_idx"') IS NOT NULL
    AND to_regclass('"vocabulary_items_word_level_idx"') IS NULL THEN
    ALTER INDEX "Vocabulary_word_level_idx" RENAME TO "vocabulary_items_word_level_idx";
  END IF;
END $$;
