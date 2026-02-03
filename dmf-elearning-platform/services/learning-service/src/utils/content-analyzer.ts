/**
 * i+1 Content Analyzer
 *
 * Based on Krashen's Comprehensible Input hypothesis:
 * Optimal learning occurs when content contains ~85% known material + ~15% new material
 *
 * This analyzer evaluates reading content against a user's known vocabulary
 * to determine suitability and difficulty score.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface ContentAnalysis {
  totalWords: number;
  uniqueWords: number;
  vocabularyList: string[];
  knownWords: string[];
  unknownWords: string[];
  knownPercentage: number;
  unknownPercentage: number;
  difficultyScore: number; // 0-100
  suitability: 'too_easy' | 'optimal' | 'too_hard';
  estimatedReadingTime: number; // in minutes
  levelDistribution: Record<string, number>; // Words by CEFR level
}

export interface TextStats {
  totalWords: number;
  uniqueWords: number;
  vocabularyList: string[];
  wordFrequency: Map<string, number>;
}

// ═══════════════════════════════════════════════════════════════
// German Text Processing Utilities
// ═══════════════════════════════════════════════════════════════

// Common German stop words to exclude from analysis
const GERMAN_STOP_WORDS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des',
  'ein', 'eine', 'einer', 'einem', 'einen', 'eines',
  'und', 'oder', 'aber', 'denn', 'weil', 'dass', 'wenn', 'als', 'ob',
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr',
  'mich', 'dich', 'sich', 'uns', 'euch',
  'mir', 'dir', 'ihm', 'ihr', 'uns', 'euch', 'ihnen',
  'mein', 'dein', 'sein', 'ihr', 'unser', 'euer',
  'ist', 'sind', 'war', 'waren', 'bin', 'bist', 'seid',
  'hat', 'haben', 'hatte', 'hatten', 'habe', 'hast',
  'wird', 'werden', 'wurde', 'wurden', 'werde', 'wirst',
  'kann', 'können', 'konnte', 'konnten',
  'muss', 'müssen', 'musste', 'mussten',
  'will', 'wollen', 'wollte', 'wollten',
  'soll', 'sollen', 'sollte', 'sollten',
  'darf', 'dürfen', 'durfte', 'durften',
  'nicht', 'kein', 'keine', 'keiner', 'keinem', 'keinen',
  'ja', 'nein', 'auch', 'nur', 'noch', 'schon', 'sehr', 'so',
  'hier', 'dort', 'da', 'wo', 'was', 'wer', 'wie', 'warum', 'wann',
  'zu', 'von', 'mit', 'bei', 'nach', 'aus', 'für', 'über', 'unter',
  'in', 'an', 'auf', 'um', 'durch', 'gegen', 'ohne', 'bis',
  'diese', 'dieser', 'dieses', 'diesem', 'diesen',
  'jede', 'jeder', 'jedes', 'jedem', 'jeden',
  'alle', 'aller', 'allem', 'allen',
  'man', 'etwas', 'nichts', 'viel', 'wenig',
]);

/**
 * Extract words from German text
 */
export function extractWords(text: string): string[] {
  // Remove punctuation except German umlauts and ß
  const cleanText = text
    .toLowerCase()
    .replace(/[^\wäöüßÄÖÜ\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into words and filter
  return cleanText
    .split(' ')
    .filter(word => word.length > 1) // Remove single characters
    .filter(word => !/^\d+$/.test(word)); // Remove numbers
}

/**
 * Get text statistics without stop words
 */
export function analyzeText(text: string, includeStopWords = false): TextStats {
  const allWords = extractWords(text);

  const filteredWords = includeStopWords
    ? allWords
    : allWords.filter(word => !GERMAN_STOP_WORDS.has(word));

  const wordFrequency = new Map<string, number>();
  for (const word of filteredWords) {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
  }

  const vocabularyList = Array.from(wordFrequency.keys()).sort();

  return {
    totalWords: filteredWords.length,
    uniqueWords: vocabularyList.length,
    vocabularyList,
    wordFrequency,
  };
}

// ═══════════════════════════════════════════════════════════════
// i+1 Analysis Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze content for a specific user to determine i+1 suitability
 */
export async function analyzeContentForUser(
  text: string,
  userId: string
): Promise<ContentAnalysis> {
  const textStats = analyzeText(text);

  // Get user's known words (status = 'learning', 'review', or 'mastered')
  const userProgress = await prisma.userVocabularyProgress.findMany({
    where: {
      userId,
      status: { in: ['learning', 'review', 'mastered'] },
    },
    include: {
      vocabulary: {
        select: { word: true, level: true },
      },
    },
  });

  const knownWordsSet = new Set(
    userProgress.map(p => p.vocabulary.word.toLowerCase())
  );

  // Categorize content words
  const knownWords: string[] = [];
  const unknownWords: string[] = [];

  for (const word of textStats.vocabularyList) {
    if (knownWordsSet.has(word)) {
      knownWords.push(word);
    } else {
      unknownWords.push(word);
    }
  }

  // Calculate percentages
  const knownPercentage = textStats.uniqueWords > 0
    ? Math.round((knownWords.length / textStats.uniqueWords) * 100)
    : 0;
  const unknownPercentage = 100 - knownPercentage;

  // Determine suitability based on i+1 principle
  let suitability: 'too_easy' | 'optimal' | 'too_hard';
  if (knownPercentage >= 95) {
    suitability = 'too_easy';
  } else if (knownPercentage >= 75) {
    suitability = 'optimal'; // 75-95% known is the sweet spot
  } else {
    suitability = 'too_hard';
  }

  // Calculate difficulty score (0 = very easy, 100 = very hard)
  const difficultyScore = Math.round(unknownPercentage * 1.2); // Scale up slightly

  // Estimate reading time (average 150 words per minute for foreign language)
  const estimatedReadingTime = Math.ceil(textStats.totalWords / 150);

  // Get level distribution for unknown words
  const levelDistribution = await getLevelDistribution(unknownWords);

  return {
    totalWords: textStats.totalWords,
    uniqueWords: textStats.uniqueWords,
    vocabularyList: textStats.vocabularyList,
    knownWords,
    unknownWords,
    knownPercentage,
    unknownPercentage,
    difficultyScore: Math.min(100, difficultyScore),
    suitability,
    estimatedReadingTime,
    levelDistribution,
  };
}

/**
 * Analyze content without user context (general difficulty)
 */
export async function analyzeContentGeneral(text: string): Promise<{
  totalWords: number;
  uniqueWords: number;
  vocabularyList: string[];
  difficultyScore: number;
  estimatedReadingTime: number;
  levelDistribution: Record<string, number>;
}> {
  const textStats = analyzeText(text);

  // Get level distribution from vocabulary database
  const levelDistribution = await getLevelDistribution(textStats.vocabularyList);

  // Calculate difficulty based on word levels
  // A1/A2 = easy, B1/B2 = medium, C1/C2 = hard
  const levelWeights: Record<string, number> = {
    A1: 10,
    A2: 20,
    B1: 40,
    B2: 60,
    C1: 80,
    C2: 100,
  };

  let totalWeight = 0;
  let wordCount = 0;

  for (const [level, count] of Object.entries(levelDistribution)) {
    totalWeight += (levelWeights[level] || 50) * count;
    wordCount += count;
  }

  const difficultyScore = wordCount > 0
    ? Math.round(totalWeight / wordCount)
    : 50; // Default to medium difficulty

  return {
    totalWords: textStats.totalWords,
    uniqueWords: textStats.uniqueWords,
    vocabularyList: textStats.vocabularyList,
    difficultyScore,
    estimatedReadingTime: Math.ceil(textStats.totalWords / 150),
    levelDistribution,
  };
}

/**
 * Get CEFR level distribution for a list of words
 */
async function getLevelDistribution(
  words: string[]
): Promise<Record<string, number>> {
  if (words.length === 0) return {};

  const vocabItems = await prisma.vocabulary.findMany({
    where: {
      word: { in: words },
    },
    select: {
      level: true,
    },
  });

  const distribution: Record<string, number> = {};
  for (const item of vocabItems) {
    distribution[item.level] = (distribution[item.level] || 0) + 1;
  }

  return distribution;
}

/**
 * Get recommended content for a user based on i+1 principle
 */
export async function getRecommendedContentIds(
  userId: string,
  limit: number = 10
): Promise<string[]> {
  // Get all published reading content
  const allContent = await prisma.readingContent.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      content: true,
      difficultyScore: true,
    },
  });

  // Get user's completed content to exclude
  const completedProgress = await prisma.userReadingProgress.findMany({
    where: {
      userId,
      status: 'completed',
    },
    select: { contentId: true },
  });

  const completedIds = new Set(completedProgress.map(p => p.contentId));

  // Analyze each content for the user
  const contentWithScores: Array<{ id: string; score: number }> = [];

  for (const content of allContent) {
    if (completedIds.has(content.id)) continue;

    const analysis = await analyzeContentForUser(content.content, userId);

    // Score based on i+1 suitability
    // Optimal content gets highest score
    let score = 0;
    if (analysis.suitability === 'optimal') {
      score = 100 - Math.abs(analysis.knownPercentage - 85); // Closer to 85% is better
    } else if (analysis.suitability === 'too_easy') {
      score = 50 - (analysis.knownPercentage - 95);
    } else {
      score = 25 - (75 - analysis.knownPercentage);
    }

    contentWithScores.push({ id: content.id, score });
  }

  // Sort by score and return top matches
  return contentWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(c => c.id);
}

/**
 * Calculate content difficulty and update database
 */
export async function updateContentAnalysis(contentId: string): Promise<void> {
  const content = await prisma.readingContent.findUnique({
    where: { id: contentId },
    select: { content: true },
  });

  if (!content) return;

  const analysis = await analyzeContentGeneral(content.content);

  await prisma.readingContent.update({
    where: { id: contentId },
    data: {
      wordCount: analysis.totalWords,
      uniqueWords: analysis.uniqueWords,
      vocabularyList: analysis.vocabularyList,
      difficultyScore: analysis.difficultyScore,
      estimatedTime: analysis.estimatedReadingTime,
    },
  });
}
