/**
 * AI Graded Reader Generator
 *
 * Uses Claude API to generate reading content at specific CEFR levels.
 * Content is tailored to include vocabulary appropriate for the target level.
 */

import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { analyzeContentGeneral, analyzeText } from './content-analyzer';

const prisma = new PrismaClient();

// Initialize Anthropic client
const anthropic = new Anthropic();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface GeneratedContent {
  title: string;
  content: string;
  summary: string;
  level: string;
  topic: string;
  wordCount: number;
  vocabularyHighlights: string[]; // Key vocabulary words
}

export interface GenerationOptions {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  targetWordCount: number;
  style?: 'story' | 'article' | 'dialogue' | 'description';
  includeVocabulary?: string[]; // Specific words to include
}

// ═══════════════════════════════════════════════════════════════
// Level Guidelines
// ═══════════════════════════════════════════════════════════════

const LEVEL_GUIDELINES: Record<string, {
  description: string;
  sentenceLength: string;
  grammarFeatures: string[];
  vocabularyRange: string;
}> = {
  A1: {
    description: 'Complete beginner - very simple language',
    sentenceLength: '5-10 words per sentence',
    grammarFeatures: [
      'Present tense only',
      'Simple subject-verb-object structure',
      'Basic modal verbs (können, mögen)',
      'Nominative and accusative cases',
      'Common prepositions (in, auf, mit)',
    ],
    vocabularyRange: '500-1000 most common words',
  },
  A2: {
    description: 'Elementary - simple everyday language',
    sentenceLength: '8-15 words per sentence',
    grammarFeatures: [
      'Present and Perfekt tenses',
      'Dative case introduced',
      'Separable verbs',
      'Subordinate clauses with weil, dass',
      'Comparative adjectives',
    ],
    vocabularyRange: '1000-2000 words',
  },
  B1: {
    description: 'Intermediate - clear standard language',
    sentenceLength: '10-20 words per sentence',
    grammarFeatures: [
      'All tenses including Präteritum',
      'Passive voice',
      'Relative clauses',
      'Konjunktiv II for polite requests',
      'Genitive case',
    ],
    vocabularyRange: '2000-4000 words',
  },
  B2: {
    description: 'Upper intermediate - complex language',
    sentenceLength: '15-25 words per sentence',
    grammarFeatures: [
      'All grammar structures',
      'Extended participial phrases',
      'Konjunktiv I for reported speech',
      'Complex sentence structures',
      'Idiomatic expressions',
    ],
    vocabularyRange: '4000-6000 words',
  },
  C1: {
    description: 'Advanced - sophisticated language',
    sentenceLength: '20-30 words per sentence',
    grammarFeatures: [
      'Full range of grammatical structures',
      'Academic and professional vocabulary',
      'Nuanced modal particles',
      'Complex argumentation structures',
    ],
    vocabularyRange: '6000-10000 words',
  },
  C2: {
    description: 'Proficient - near-native level',
    sentenceLength: 'Variable, natural flow',
    grammarFeatures: [
      'Native-like expression',
      'Literary and colloquial registers',
      'Subtle nuances and connotations',
      'Regional variations understood',
    ],
    vocabularyRange: '10000+ words',
  },
};

const TOPIC_PROMPTS: Record<string, string> = {
  'daily-life': 'everyday activities, routines, and common situations',
  'travel': 'traveling, vacation, transportation, and tourism',
  'food': 'cooking, restaurants, food culture, and eating habits',
  'work': 'office life, professions, and workplace situations',
  'family': 'family relationships, home life, and social gatherings',
  'hobbies': 'leisure activities, sports, and entertainment',
  'nature': 'environment, animals, weather, and outdoor activities',
  'city': 'urban life, shopping, public spaces, and services',
  'culture': 'German traditions, festivals, and cultural practices',
  'technology': 'computers, internet, and modern devices',
  'health': 'fitness, doctor visits, and wellness',
  'education': 'school, learning, and academic life',
};

// ═══════════════════════════════════════════════════════════════
// Content Generation
// ═══════════════════════════════════════════════════════════════

/**
 * Generate graded reading content using Claude API
 */
export async function generateGradedContent(
  options: GenerationOptions
): Promise<GeneratedContent> {
  const { level, topic, targetWordCount, style = 'story', includeVocabulary = [] } = options;

  const levelGuide = LEVEL_GUIDELINES[level];
  const topicDescription = TOPIC_PROMPTS[topic] || topic;

  // Get sample vocabulary from database for this level
  const sampleVocab = await prisma.vocabulary.findMany({
    where: { level },
    take: 50,
    select: { word: true },
  });
  const vocabSuggestions = sampleVocab.map(v => v.word).join(', ');

  const systemPrompt = `You are a German language content creator specializing in graded readers for language learners.
You create engaging, educational content precisely calibrated to CEFR levels.

IMPORTANT RULES:
1. Write ONLY in German - no English translations
2. Match the exact difficulty level specified
3. Use natural, authentic German (not simplified to the point of being unnatural)
4. Include cultural elements when appropriate
5. Make content interesting and engaging`;

  const userPrompt = `Generate a ${style} in German at CEFR level ${level}.

LEVEL REQUIREMENTS FOR ${level}:
- Description: ${levelGuide.description}
- Sentence length: ${levelGuide.sentenceLength}
- Grammar features to use: ${levelGuide.grammarFeatures.join(', ')}
- Vocabulary range: ${levelGuide.vocabularyRange}

CONTENT REQUIREMENTS:
- Topic: ${topicDescription}
- Target length: approximately ${targetWordCount} words
- Style: ${style}

${includeVocabulary.length > 0 ? `MUST INCLUDE these vocabulary words naturally: ${includeVocabulary.join(', ')}` : ''}

VOCABULARY SUGGESTIONS from our database (use where appropriate):
${vocabSuggestions}

Please respond in the following JSON format:
{
  "title": "German title of the content",
  "content": "The full German text content (multiple paragraphs)",
  "summary": "Brief German summary (1-2 sentences)",
  "vocabularyHighlights": ["word1", "word2", "word3"] // 5-10 key vocabulary words
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const generated = JSON.parse(jsonMatch[0]);

    // Analyze the generated content
    const textStats = analyzeText(generated.content);

    return {
      title: generated.title,
      content: generated.content,
      summary: generated.summary,
      level,
      topic,
      wordCount: textStats.totalWords,
      vocabularyHighlights: generated.vocabularyHighlights || [],
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error(`Failed to generate content: ${error}`);
  }
}

/**
 * Generate and save content to database
 */
export async function generateAndSaveContent(
  options: GenerationOptions
): Promise<string> {
  const generated = await generateGradedContent(options);

  // Analyze content for difficulty metrics
  const analysis = await analyzeContentGeneral(generated.content);

  // Save to database
  const saved = await prisma.readingContent.create({
    data: {
      title: generated.title,
      content: generated.content,
      summary: generated.summary,
      level: generated.level,
      topic: generated.topic,
      wordCount: analysis.totalWords,
      uniqueWords: analysis.uniqueWords,
      vocabularyList: analysis.vocabularyList,
      difficultyScore: analysis.difficultyScore,
      estimatedTime: analysis.estimatedReadingTime,
      source: 'AI-generated',
      isPublished: true,
    },
  });

  return saved.id;
}

/**
 * Generate a batch of content for a level
 */
export async function generateContentBatch(
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
  topics: string[],
  countPerTopic: number = 2
): Promise<string[]> {
  const contentIds: string[] = [];
  const styles: Array<'story' | 'article' | 'dialogue' | 'description'> = [
    'story', 'article', 'dialogue', 'description'
  ];

  // Word count ranges by level
  const wordCountByLevel: Record<string, { min: number; max: number }> = {
    A1: { min: 80, max: 150 },
    A2: { min: 120, max: 200 },
    B1: { min: 200, max: 350 },
    B2: { min: 300, max: 500 },
    C1: { min: 400, max: 600 },
    C2: { min: 500, max: 800 },
  };

  const range = wordCountByLevel[level];

  for (const topic of topics) {
    for (let i = 0; i < countPerTopic; i++) {
      const style = styles[i % styles.length];
      const targetWordCount = Math.floor(
        Math.random() * (range.max - range.min) + range.min
      );

      try {
        const id = await generateAndSaveContent({
          level,
          topic,
          targetWordCount,
          style,
        });
        contentIds.push(id);
        console.log(`Generated ${level} ${topic} ${style}: ${id}`);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate ${level} ${topic}:`, error);
      }
    }
  }

  return contentIds;
}
