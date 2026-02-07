-- CreateTable
CREATE TABLE "ListeningContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL,
    "topic" TEXT,
    "audioUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "transcript" TEXT NOT NULL,
    "transcriptVi" TEXT,
    "segments" JSONB,
    "source" TEXT,
    "speaker" TEXT,
    "speed" TEXT NOT NULL DEFAULT 'normal',
    "accent" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "difficultyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vocabularyList" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListeningContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictationExercise" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "exerciseType" TEXT NOT NULL DEFAULT 'full',
    "segmentIndex" INTEGER,
    "audioStart" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "audioEnd" DOUBLE PRECISION,
    "correctText" TEXT NOT NULL,
    "hints" TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DictationExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictationAttempt" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userText" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wordsCorrect" INTEGER NOT NULL DEFAULT 0,
    "wordsTotal" INTEGER NOT NULL DEFAULT 0,
    "mistakes" JSONB,
    "listenCount" INTEGER NOT NULL DEFAULT 1,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DictationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserListeningProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "totalListenTime" INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "lastPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exercisesCompleted" INTEGER NOT NULL DEFAULT 0,
    "exercisesTotal" INTEGER NOT NULL DEFAULT 0,
    "averageAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserListeningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListeningContent_level_idx" ON "ListeningContent"("level");

-- CreateIndex
CREATE INDEX "ListeningContent_topic_idx" ON "ListeningContent"("topic");

-- CreateIndex
CREATE INDEX "ListeningContent_difficultyScore_idx" ON "ListeningContent"("difficultyScore");

-- CreateIndex
CREATE INDEX "DictationExercise_contentId_idx" ON "DictationExercise"("contentId");

-- CreateIndex
CREATE INDEX "DictationAttempt_userId_exerciseId_idx" ON "DictationAttempt"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "DictationAttempt_userId_createdAt_idx" ON "DictationAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserListeningProgress_userId_status_idx" ON "UserListeningProgress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserListeningProgress_userId_contentId_key" ON "UserListeningProgress"("userId", "contentId");

-- AddForeignKey
ALTER TABLE "DictationExercise" ADD CONSTRAINT "DictationExercise_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ListeningContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DictationAttempt" ADD CONSTRAINT "DictationAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "DictationExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListeningProgress" ADD CONSTRAINT "UserListeningProgress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ListeningContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
