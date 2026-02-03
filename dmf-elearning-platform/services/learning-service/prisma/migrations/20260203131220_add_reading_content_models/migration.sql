-- CreateTable
CREATE TABLE "ReadingContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "level" TEXT NOT NULL,
    "topic" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueWords" INTEGER NOT NULL DEFAULT 0,
    "difficultyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vocabularyList" TEXT[],
    "source" TEXT,
    "author" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "estimatedTime" INTEGER NOT NULL DEFAULT 5,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReadingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "lastPosition" INTEGER NOT NULL DEFAULT 0,
    "wordsRead" INTEGER NOT NULL DEFAULT 0,
    "newWordsFound" INTEGER NOT NULL DEFAULT 0,
    "wordsLookedUp" TEXT[],
    "totalReadTime" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReadingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingContent_level_idx" ON "ReadingContent"("level");

-- CreateIndex
CREATE INDEX "ReadingContent_topic_idx" ON "ReadingContent"("topic");

-- CreateIndex
CREATE INDEX "ReadingContent_difficultyScore_idx" ON "ReadingContent"("difficultyScore");

-- CreateIndex
CREATE INDEX "UserReadingProgress_userId_status_idx" ON "UserReadingProgress"("userId", "status");

-- CreateIndex
CREATE INDEX "UserReadingProgress_userId_completedAt_idx" ON "UserReadingProgress"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserReadingProgress_userId_contentId_key" ON "UserReadingProgress"("userId", "contentId");

-- AddForeignKey
ALTER TABLE "UserReadingProgress" ADD CONSTRAINT "UserReadingProgress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ReadingContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
