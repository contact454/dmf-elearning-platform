-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning_vi" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "topic" TEXT,
    "example_de" TEXT,
    "example_vi" TEXT,
    "pos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVocabularyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVocabularyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_word_key" ON "Vocabulary"("word");

-- CreateIndex
CREATE UNIQUE INDEX "UserVocabularyProgress_userId_vocabId_key" ON "UserVocabularyProgress"("userId", "vocabId");

-- AddForeignKey
ALTER TABLE "UserVocabularyProgress" ADD CONSTRAINT "UserVocabularyProgress_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "Vocabulary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
