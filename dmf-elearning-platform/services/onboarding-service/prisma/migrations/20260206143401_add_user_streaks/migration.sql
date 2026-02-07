-- Migration: Add user streak tracking fields
-- Task 2.1: Daily Streaks Database Schema
-- Date: 2026-02-06

-- Add streak tracking fields to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "current_streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "longest_streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "last_activity_date" TIMESTAMP(3);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- Add comment for documentation
COMMENT ON COLUMN "Users"."current_streak" IS 'Current consecutive days of activity';
COMMENT ON COLUMN "Users"."longest_streak" IS 'Longest streak ever achieved by the user';
COMMENT ON COLUMN "Users"."last_activity_date" IS 'Last date user completed any learning activity';
COMMENT ON COLUMN "Users"."timezone" IS 'IANA timezone for accurate streak calculation (e.g., Asia/Ho_Chi_Minh)';

-- Create index for streak-related queries
CREATE INDEX IF NOT EXISTS "Users_last_activity_date_idx" ON "Users"("last_activity_date");
CREATE INDEX IF NOT EXISTS "Users_current_streak_idx" ON "Users"("current_streak");
