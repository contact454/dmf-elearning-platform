-- CreateTable
CREATE TABLE "reading_passages" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "cefr_level" VARCHAR(2) NOT NULL,
    "topic" VARCHAR(100),
    "word_count" INTEGER NOT NULL,
    "estimated_reading_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "difficulty_score" DECIMAL(3,2) DEFAULT 0,
    "source" VARCHAR(200),
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_passages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_exercises" (
    "id" UUID NOT NULL,
    "passage_id" UUID NOT NULL,
    "exercise_type" VARCHAR(50) NOT NULL,
    "question" TEXT NOT NULL,
    "exercise_data" JSONB NOT NULL,
    "explanation" TEXT,
    "difficulty_level" INTEGER NOT NULL DEFAULT 5,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_passage_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "passage_id" UUID NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "total_exercises" INTEGER NOT NULL DEFAULT 0,
    "correct_exercises" INTEGER NOT NULL DEFAULT 0,
    "accuracy_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "next_review_at" TIMESTAMPTZ(6),
    "ease_factor" DECIMAL(3,2) NOT NULL DEFAULT 2.5,
    "interval_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_passage_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "passage_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "user_answer" JSONB NOT NULL,
    "correct_answer" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "accuracy_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "quality_rating" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_reading_passages_cefr" ON "reading_passages"("cefr_level");

-- CreateIndex
CREATE INDEX "idx_reading_passages_topic" ON "reading_passages"("topic");

-- CreateIndex
CREATE INDEX "idx_reading_passages_premium" ON "reading_passages"("is_premium");

-- CreateIndex
CREATE INDEX "idx_reading_passages_difficulty" ON "reading_passages"("difficulty_score");

-- CreateIndex
CREATE INDEX "idx_reading_exercises_passage_id" ON "reading_exercises"("passage_id");

-- CreateIndex
CREATE INDEX "idx_reading_exercises_type" ON "reading_exercises"("exercise_type");

-- CreateIndex
CREATE INDEX "idx_reading_exercises_display_order" ON "reading_exercises"("passage_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "user_passage_unique" ON "user_passage_progress"("user_id", "passage_id");

-- CreateIndex
CREATE INDEX "idx_user_passage_progress_user_id" ON "user_passage_progress"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_passage_progress_next_review" ON "user_passage_progress"("next_review_at");

-- CreateIndex
CREATE INDEX "idx_user_passage_progress_completed" ON "user_passage_progress"("completed_at");

-- CreateIndex
CREATE INDEX "idx_user_passage_progress_composite" ON "user_passage_progress"("user_id", "passage_id");

-- CreateIndex
CREATE INDEX "idx_user_passage_progress_accuracy" ON "user_passage_progress"("user_id", "accuracy_percentage");

-- CreateIndex
CREATE INDEX "idx_reading_attempts_user_id" ON "reading_attempts"("user_id");

-- CreateIndex
CREATE INDEX "idx_reading_attempts_exercise_id" ON "reading_attempts"("exercise_id");

-- CreateIndex
CREATE INDEX "idx_reading_attempts_passage_id" ON "reading_attempts"("passage_id");

-- CreateIndex
CREATE INDEX "idx_reading_attempts_created_at" ON "reading_attempts"("created_at");

-- CreateIndex
CREATE INDEX "idx_reading_attempts_user_created" ON "reading_attempts"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "reading_exercises" ADD CONSTRAINT "reading_exercises_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "reading_passages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_passage_progress" ADD CONSTRAINT "user_passage_progress_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "reading_passages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "reading_passages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "reading_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraints
ALTER TABLE "reading_passages" ADD CONSTRAINT "check_cefr_level" CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));
ALTER TABLE "reading_passages" ADD CONSTRAINT "check_difficulty_score" CHECK (difficulty_score BETWEEN 1.0 AND 10.0);
ALTER TABLE "reading_passages" ADD CONSTRAINT "check_word_count" CHECK (word_count > 0);

ALTER TABLE "reading_exercises" ADD CONSTRAINT "check_exercise_type" CHECK (exercise_type IN ('multiple_choice', 'true_false', 'fill_blank', 'sequencing'));
ALTER TABLE "reading_exercises" ADD CONSTRAINT "check_difficulty_level" CHECK (difficulty_level BETWEEN 1 AND 10);

ALTER TABLE "user_passage_progress" ADD CONSTRAINT "check_accuracy_percentage" CHECK (accuracy_percentage BETWEEN 0 AND 100);

ALTER TABLE "reading_attempts" ADD CONSTRAINT "check_quality_rating" CHECK (quality_rating IS NULL OR (quality_rating BETWEEN 0 AND 5));
ALTER TABLE "reading_attempts" ADD CONSTRAINT "check_attempt_accuracy_score" CHECK (accuracy_score BETWEEN 0 AND 100);
