-- German A1 Curriculum Schema
-- Add language learning models to support curriculum structure

-- Languages table
CREATE TABLE "Languages" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "code" TEXT UNIQUE NOT NULL, -- 'de', 'en', 'vi'
  "name" TEXT NOT NULL, -- 'German', 'English', 'Vietnamese'
  "level" TEXT, -- 'A1', 'A2', 'B1', etc.
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Units table (20 units for German A1)
CREATE TABLE "Units" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "languageId" TEXT NOT NULL REFERENCES "Languages"("id") ON DELETE CASCADE,
  "unitNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "grammarTopic" TEXT,
  "grammarExplanation" TEXT,
  "grammarExamples" JSONB, -- Array of {de, en, vi} examples
  "orderIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("languageId", "unitNumber")
);

-- Vocabulary table
CREATE TABLE "Vocabulary" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "unitId" TEXT NOT NULL REFERENCES "Units"("id") ON DELETE CASCADE,
  "word" TEXT NOT NULL,
  "meaningEn" TEXT NOT NULL,
  "meaningVi" TEXT NOT NULL,
  "gender" TEXT, -- 'masculine', 'feminine', 'neuter', 'none'
  "wordType" TEXT, -- 'noun', 'verb', 'adjective', 'adverb', 'phrase'
  "category" TEXT, -- 'verbs', 'food', 'numbers', etc.
  "examples" JSONB, -- Array of {de, en, vi} example sentences
  "orderIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX "idx_units_language" ON "Units"("languageId");
CREATE INDEX "idx_vocabulary_unit" ON "Vocabulary"("unitId");
CREATE INDEX "idx_vocabulary_word" ON "Vocabulary"("word");

-- Insert German A1 language
INSERT INTO "Languages" ("id", "code", "name", "level", "createdAt", "updatedAt")
VALUES ('de-a1', 'de', 'German', 'A1', NOW(), NOW());
