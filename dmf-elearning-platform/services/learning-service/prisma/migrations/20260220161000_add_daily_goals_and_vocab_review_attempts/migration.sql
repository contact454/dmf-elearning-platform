-- Alter users table with persistent daily goal defaults
ALTER TABLE "users"
  ADD COLUMN "daily_goal_vocabulary" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN "daily_goal_reading" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "daily_goal_listening" INTEGER NOT NULL DEFAULT 1;

-- Store vocabulary review attempts for accurate daily review counting
CREATE TABLE "vocabulary_review_attempts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "word_id" TEXT NOT NULL,
  "quality" INTEGER NOT NULL,
  "source" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "vocabulary_review_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_vocab_review_attempts_user_created"
  ON "vocabulary_review_attempts"("user_id", "created_at");

CREATE INDEX "idx_vocab_review_attempts_user_word"
  ON "vocabulary_review_attempts"("user_id", "word_id");

CREATE INDEX "idx_vocab_review_attempts_word"
  ON "vocabulary_review_attempts"("word_id");

ALTER TABLE "vocabulary_review_attempts"
  ADD CONSTRAINT "vocabulary_review_attempts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vocabulary_review_attempts"
  ADD CONSTRAINT "vocabulary_review_attempts_word_id_fkey"
  FOREIGN KEY ("word_id") REFERENCES "vocabulary_items"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vocabulary_review_attempts"
  ADD CONSTRAINT "check_vocab_review_quality"
  CHECK ("quality" BETWEEN 0 AND 5);
