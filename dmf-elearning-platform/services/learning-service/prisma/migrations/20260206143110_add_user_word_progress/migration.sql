-- Migration: Add UserWordProgress table with SM-2 algorithm fields
-- Phase 1: Vocabulary Learning System
-- Date: 2026-02-06

-- ===================================================================
-- STEP 1: Rename existing tables (backup)
-- ===================================================================

-- Rename Vocabulary table to vocabulary_items (keeping data)
ALTER TABLE "Vocabulary" RENAME TO "vocabulary_items";

-- Rename existing UserVocabularyProgress to _old (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'UserVocabularyProgress') THEN
        ALTER TABLE "UserVocabularyProgress" RENAME TO "UserVocabularyProgress_old";
    END IF;
END $$;

-- ===================================================================
-- STEP 2: Update column names in vocabulary_items for consistency
-- ===================================================================

-- Rename columns to snake_case (only if they don't exist)
DO $$
BEGIN
    -- Check and rename audioUrl to audio_url
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vocabulary_items' AND column_name = 'audioUrl') THEN
        ALTER TABLE "vocabulary_items" RENAME COLUMN "audioUrl" TO "audio_url";
    END IF;
    
    -- Check and rename phoneticIpa to phonetic_ipa
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vocabulary_items' AND column_name = 'phoneticIpa') THEN
        ALTER TABLE "vocabulary_items" RENAME COLUMN "phoneticIpa" TO "phonetic_ipa";
    END IF;
    
    -- Check and rename familyWords to family_words
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vocabulary_items' AND column_name = 'familyWords') THEN
        ALTER TABLE "vocabulary_items" RENAME COLUMN "familyWords" TO "family_words";
    END IF;
    
    -- Check and rename grammarTags to grammar_tags
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vocabulary_items' AND column_name = 'grammarTags') THEN
        ALTER TABLE "vocabulary_items" RENAME COLUMN "grammarTags" TO "grammar_tags";
    END IF;
    
    -- Check and rename addedAt to added_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vocabulary_items' AND column_name = 'addedAt') THEN
        ALTER TABLE "vocabulary_items" RENAME COLUMN "addedAt" TO "added_at";
    END IF;
    
    -- Check and rename createdAt to created_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vocabulary_items' AND column_name = 'createdAt') THEN
        ALTER TABLE "vocabulary_items" RENAME COLUMN "createdAt" TO "created_at";
    END IF;
    
    -- Check and rename updatedAt to updated_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vocabulary_items' AND column_name = 'updatedAt') THEN
        ALTER TABLE "vocabulary_items" RENAME COLUMN "updatedAt" TO "updated_at";
    END IF;
END $$;

-- ===================================================================
-- STEP 3: Create ReviewStatus enum
-- ===================================================================

CREATE TYPE "ReviewStatus" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'MASTERED');

-- ===================================================================
-- STEP 4: Create users table (if doesn't exist)
-- ===================================================================

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- ===================================================================
-- STEP 5: Create user_word_progress table
-- ===================================================================

CREATE TABLE "user_word_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    
    -- SM-2 Algorithm Fields
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval_days" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "next_review" TIMESTAMP(3) NOT NULL,
    
    -- Status Tracking
    "status" "ReviewStatus" NOT NULL DEFAULT 'NEW',
    "last_result" BOOLEAN,
    
    -- Statistics
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "correct_reviews" INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "user_word_progress_pkey" PRIMARY KEY ("id")
);

-- ===================================================================
-- STEP 6: Create indexes
-- ===================================================================

-- Unique constraint for user + word combination
CREATE UNIQUE INDEX "user_word_unique" ON "user_word_progress"("user_id", "word_id");

-- Performance indexes for common queries
CREATE INDEX "user_next_review_idx" ON "user_word_progress"("user_id", "next_review");
CREATE INDEX "user_status_idx" ON "user_word_progress"("user_id", "status");
CREATE INDEX "word_idx" ON "user_word_progress"("word_id");

-- ===================================================================
-- STEP 7: Add foreign key constraints
-- ===================================================================

ALTER TABLE "user_word_progress" 
    ADD CONSTRAINT "user_word_progress_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

ALTER TABLE "user_word_progress" 
    ADD CONSTRAINT "user_word_progress_word_id_fkey" 
    FOREIGN KEY ("word_id") 
    REFERENCES "vocabulary_items"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- ===================================================================
-- STEP 8: Add table comments for documentation
-- ===================================================================

COMMENT ON TABLE "user_word_progress" IS 'Tracks user vocabulary learning progress using SM-2 spaced repetition algorithm';
COMMENT ON TABLE "vocabulary_items" IS 'German vocabulary items with metadata and examples';
COMMENT ON TABLE "users" IS 'User accounts with streak tracking for gamification';

COMMENT ON COLUMN "user_word_progress"."ease_factor" IS 'SM-2 ease factor (range: 1.3-2.5), determines review interval multiplier';
COMMENT ON COLUMN "user_word_progress"."interval_days" IS 'Days until next review (SM-2 algorithm)';
COMMENT ON COLUMN "user_word_progress"."repetitions" IS 'Count of consecutive correct reviews';
COMMENT ON COLUMN "user_word_progress"."status" IS 'Learning status: NEW (never reviewed), LEARNING (<3 reps), REVIEW (3+ reps, <21d interval), MASTERED (5+ reps, 21d+ interval)';
