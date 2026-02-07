-- CreateTable
CREATE TABLE "SpeakingPrompt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL,
    "topic" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "promptText" TEXT NOT NULL,
    "promptTextVi" TEXT,
    "sampleResponse" TEXT,
    "sampleAudioUrl" TEXT,
    "targetWords" TEXT[],
    "phonetics" TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "estimatedTime" INTEGER NOT NULL DEFAULT 30,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingAttempt" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioUrl" TEXT,
    "audioDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transcript" TEXT,
    "pronunciationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fluencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accuracyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wordScores" JSONB,
    "feedback" TEXT,
    "corrections" JSONB,
    "recordingTime" INTEGER NOT NULL DEFAULT 0,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSpeakingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPronunciation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgFluency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "firstAttemptAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSpeakingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingPrompt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL,
    "topic" TEXT,
    "category" TEXT NOT NULL DEFAULT 'free_writing',
    "promptText" TEXT NOT NULL,
    "promptTextVi" TEXT,
    "instructions" TEXT,
    "instructionsVi" TEXT,
    "templateText" TEXT,
    "correctAnswers" JSONB,
    "hints" TEXT[],
    "keywords" TEXT[],
    "wordLimit" INTEGER,
    "minWords" INTEGER NOT NULL DEFAULT 0,
    "sampleResponse" TEXT,
    "sampleResponseVi" TEXT,
    "grammarPoints" TEXT[],
    "vocabularyFocus" TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "estimatedTime" INTEGER NOT NULL DEFAULT 300,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingSubmission" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "answers" JSONB,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grammarScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vocabularyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coherenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "feedbackVi" TEXT,
    "corrections" JSONB,
    "suggestions" JSONB,
    "grammarErrors" JSONB,
    "keywordsUsed" TEXT[],
    "keywordsMissing" TEXT[],
    "requirementsMet" JSONB,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "submissionNum" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWritingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgGrammarScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgVocabularyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCoherenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgTaskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalWordsWritten" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "draftContent" TEXT,
    "draftUpdatedAt" TIMESTAMP(3),
    "firstSubmissionAt" TIMESTAMP(3),
    "lastSubmissionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWritingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpeakingPrompt_level_idx" ON "SpeakingPrompt"("level");

-- CreateIndex
CREATE INDEX "SpeakingPrompt_category_idx" ON "SpeakingPrompt"("category");

-- CreateIndex
CREATE INDEX "SpeakingPrompt_topic_idx" ON "SpeakingPrompt"("topic");

-- CreateIndex
CREATE INDEX "SpeakingAttempt_userId_promptId_idx" ON "SpeakingAttempt"("userId", "promptId");

-- CreateIndex
CREATE INDEX "SpeakingAttempt_userId_createdAt_idx" ON "SpeakingAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserSpeakingProgress_userId_status_idx" ON "UserSpeakingProgress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserSpeakingProgress_userId_promptId_key" ON "UserSpeakingProgress"("userId", "promptId");

-- CreateIndex
CREATE INDEX "WritingPrompt_level_idx" ON "WritingPrompt"("level");

-- CreateIndex
CREATE INDEX "WritingPrompt_category_idx" ON "WritingPrompt"("category");

-- CreateIndex
CREATE INDEX "WritingPrompt_topic_idx" ON "WritingPrompt"("topic");

-- CreateIndex
CREATE INDEX "WritingSubmission_userId_promptId_idx" ON "WritingSubmission"("userId", "promptId");

-- CreateIndex
CREATE INDEX "WritingSubmission_userId_createdAt_idx" ON "WritingSubmission"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WritingSubmission_status_idx" ON "WritingSubmission"("status");

-- CreateIndex
CREATE INDEX "UserWritingProgress_userId_status_idx" ON "UserWritingProgress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserWritingProgress_userId_promptId_key" ON "UserWritingProgress"("userId", "promptId");

-- AddForeignKey
ALTER TABLE "SpeakingAttempt" ADD CONSTRAINT "SpeakingAttempt_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "SpeakingPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSpeakingProgress" ADD CONSTRAINT "UserSpeakingProgress_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "SpeakingPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSubmission" ADD CONSTRAINT "WritingSubmission_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "WritingPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWritingProgress" ADD CONSTRAINT "UserWritingProgress_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "WritingPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
