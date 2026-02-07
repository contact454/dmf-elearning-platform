-- DMF Speaking Module - Initial Migration
-- Generated: 2026-02-06
-- Prisma Migration: 20260206235214_init_speaking_module

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users Table
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "tier" VARCHAR(20) NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Speaking Prompts Table
CREATE TABLE "speaking_prompts" (
    "id" UUID NOT NULL,
    "cefr_level" VARCHAR(2) NOT NULL,
    "topic" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "preparation_time_seconds" INTEGER NOT NULL DEFAULT 30,
    "speaking_time_seconds" INTEGER NOT NULL DEFAULT 60,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "evaluation_criteria" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaking_prompts_pkey" PRIMARY KEY ("id")
);

-- Speaking Submissions Table
CREATE TABLE "speaking_submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "prompt_id" UUID NOT NULL,
    "audio_url" VARCHAR(500) NOT NULL,
    "transcript_text" TEXT,
    "duration_seconds" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overall_score" DECIMAL(5,2),
    "pronunciation_score" DECIMAL(5,2),
    "fluency_score" DECIMAL(5,2),
    "vocabulary_score" DECIMAL(5,2),
    "grammar_score" DECIMAL(5,2),
    "ai_feedback" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaking_submissions_pkey" PRIMARY KEY ("id")
);

-- Pronunciation Feedback Table
CREATE TABLE "pronunciation_feedback" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "word" VARCHAR(100) NOT NULL,
    "phoneme" VARCHAR(50),
    "expected_pronunciation" VARCHAR(100),
    "actual_pronunciation" VARCHAR(100),
    "accuracy_score" DECIMAL(5,2) NOT NULL,
    "feedback_text" TEXT,
    "timestamp_ms" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pronunciation_feedback_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Users Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");

-- Speaking Prompts Indexes
CREATE INDEX "idx_speaking_prompts_cefr" ON "speaking_prompts"("cefr_level");
CREATE INDEX "idx_speaking_prompts_topic" ON "speaking_prompts"("topic");
CREATE INDEX "idx_speaking_prompts_difficulty" ON "speaking_prompts"("difficulty_level");
CREATE INDEX "idx_speaking_prompts_cefr_topic" ON "speaking_prompts"("cefr_level", "topic");

-- Speaking Submissions Indexes
CREATE INDEX "idx_speaking_submissions_user" ON "speaking_submissions"("user_id");
CREATE INDEX "idx_speaking_submissions_prompt" ON "speaking_submissions"("prompt_id");
CREATE INDEX "idx_speaking_submissions_status" ON "speaking_submissions"("status");
CREATE INDEX "idx_speaking_submissions_submitted" ON "speaking_submissions"("submitted_at" DESC);
CREATE INDEX "idx_speaking_submissions_user_submitted" ON "speaking_submissions"("user_id", "submitted_at" DESC);

-- Pronunciation Feedback Indexes
CREATE INDEX "idx_pronunciation_feedback_submission" ON "pronunciation_feedback"("submission_id");
CREATE INDEX "idx_pronunciation_feedback_accuracy" ON "pronunciation_feedback"("accuracy_score");
CREATE INDEX "idx_pronunciation_feedback_word" ON "pronunciation_feedback"("word");

-- ============================================
-- ADD FOREIGN KEYS
-- ============================================

ALTER TABLE "speaking_submissions" 
    ADD CONSTRAINT "speaking_submissions_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "speaking_submissions" 
    ADD CONSTRAINT "speaking_submissions_prompt_id_fkey" 
    FOREIGN KEY ("prompt_id") REFERENCES "speaking_prompts"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pronunciation_feedback" 
    ADD CONSTRAINT "pronunciation_feedback_submission_id_fkey" 
    FOREIGN KEY ("submission_id") REFERENCES "speaking_submissions"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- NOTES
-- ============================================
-- Total Tables: 4
-- Total Indexes: 13 (1 unique, 12 performance)
-- Total Foreign Keys: 3 (all with CASCADE delete)
-- 
-- Performance Features:
-- - Composite index on (cefr_level, topic) for filtered queries
-- - DESC index on submitted_at for recent submissions
-- - Composite index on (user_id, submitted_at) for user timeline
-- 
-- Data Integrity:
-- - CASCADE deletes ensure referential integrity
-- - JSONB fields for flexible evaluation criteria and feedback
-- - UUID primary keys for distributed systems
