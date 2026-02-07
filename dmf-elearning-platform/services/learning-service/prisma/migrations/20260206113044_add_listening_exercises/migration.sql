-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('dictation', 'multiple_choice', 'audio_image', 'fill_blank');

-- CreateTable
CREATE TABLE "listening_exercises" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "audio_url" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "translation" TEXT,
    "duration_seconds" INTEGER NOT NULL,
    "exercise_type" "ExerciseType" NOT NULL,
    "exercise_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listening_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_listening_exercise_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "correct_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "next_review_at" TIMESTAMP(3),
    "difficulty_rating" INTEGER NOT NULL DEFAULT 5,
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_listening_exercise_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listening_exercise_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "user_answer" JSONB NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "accuracy_score" DOUBLE PRECISION,
    "quality_rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listening_exercise_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_exercises_difficulty" ON "listening_exercises"("difficulty");

-- CreateIndex
CREATE INDEX "idx_exercises_type" ON "listening_exercises"("exercise_type");

-- CreateIndex
CREATE INDEX "idx_user_progress_user" ON "user_listening_exercise_progress"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_progress_next_review" ON "user_listening_exercise_progress"("next_review_at");

-- CreateIndex
CREATE INDEX "idx_user_progress_composite" ON "user_listening_exercise_progress"("user_id", "exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_listening_exercise_progress_user_id_exercise_id_key" ON "user_listening_exercise_progress"("user_id", "exercise_id");

-- CreateIndex
CREATE INDEX "idx_attempts_user" ON "listening_exercise_attempts"("user_id");

-- CreateIndex
CREATE INDEX "idx_attempts_exercise" ON "listening_exercise_attempts"("exercise_id");

-- CreateIndex
CREATE INDEX "idx_attempts_created" ON "listening_exercise_attempts"("created_at");

-- AddForeignKey
ALTER TABLE "user_listening_exercise_progress" ADD CONSTRAINT "user_listening_exercise_progress_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "listening_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_exercise_attempts" ADD CONSTRAINT "listening_exercise_attempts_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "listening_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
