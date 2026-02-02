/**
 * Repair Vocabulary Script
 * Finds untranslated or incorrectly translated Vietnamese meanings
 * and uses Claude API to fix them.
 *
 * Run: npx tsx scripts/repair-vocab.ts
 */

import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const prisma = new PrismaClient();

// Common English words that indicate untranslated content
const ENGLISH_INDICATORS = [
  'the ', ' the ', ' a ', ' an ', ' to ', ' of ', ' and ', ' is ', ' in ', ' for ',
  ' with ', ' on ', ' at ', ' by ', ' from ', ' or ', ' as ', ' be ', ' was ',
  ' are ', ' were ', ' been ', ' being ', ' have ', ' has ', ' had ', ' do ',
  ' does ', ' did ', ' will ', ' would ', ' could ', ' should ', ' may ', ' might ',
  ' must ', ' shall ', ' can ', ' need ', ' dare ', ' ought ', ' used ',
  ' that ', ' which ', ' who ', ' whom ', ' whose ', ' what ', ' where ',
  ' when ', ' why ', ' how ', ' this ', ' these ', ' those ', ' it ', ' its ',
  ' he ', ' she ', ' they ', ' them ', ' their ', ' we ', ' us ', ' our ',
  ' you ', ' your ', ' i ', ' me ', ' my ', ' myself ',
];

// English-only patterns (words that are purely English)
const ENGLISH_ONLY_PATTERNS = [
  /^to [a-z]+$/i,  // "to eat", "to drink"
  /^[a-z]+ \([a-z\/]+\)$/i,  // "word (noun/verb)"
  /^the [a-z]+$/i,  // "the house"
  /^a [a-z]+$/i,   // "a book"
  /^[a-z]+!$/i,    // "Hello!", "Stop!"
];

interface VocabItem {
  id: string;
  word: string;
  meaning_vi: string | null;
  level: string;
  pos: string | null;
}

interface TranslationResult {
  word: string;
  translation: string;
}

/**
 * Check if a meaning_vi value needs translation
 */
function needsTranslation(meaningVi: string | null): boolean {
  if (!meaningVi || meaningVi.trim().length === 0) {
    return true;
  }

  const lower = meaningVi.toLowerCase();

  // Check for common English indicators
  for (const indicator of ENGLISH_INDICATORS) {
    if (lower.includes(indicator)) {
      return true;
    }
  }

  // Check English-only patterns
  for (const pattern of ENGLISH_ONLY_PATTERNS) {
    if (pattern.test(meaningVi)) {
      return true;
    }
  }

  // Check if string contains no Vietnamese diacritics and looks English
  const hasVietnameseDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(meaningVi);

  // If no Vietnamese chars and only ASCII letters, likely English
  if (!hasVietnameseDiacritics && /^[a-zA-Z\s\-\/\(\),\.!?]+$/.test(meaningVi)) {
    // Exception: some words are the same in both languages (e.g., "pizza", "taxi")
    const loanWords = ['pizza', 'taxi', 'radio', 'video', 'euro', 'wifi', 'internet', 'email', 'ok', 'bus'];
    if (!loanWords.includes(lower.trim())) {
      return true;
    }
  }

  return false;
}

/**
 * Call Claude API to translate words
 */
async function translateWithClaude(
  client: Anthropic,
  words: VocabItem[]
): Promise<TranslationResult[]> {
  const wordList = words.map(w => `- "${w.word}" (${w.pos || 'unknown'}) - current: "${w.meaning_vi || 'empty'}"`).join('\n');

  const prompt = `You are a German-Vietnamese translator. Translate these German words to Vietnamese.

Words to translate:
${wordList}

IMPORTANT RULES:
1. Return ONLY the translations in this exact JSON format, no explanation:
[
  {"word": "German word", "translation": "Vietnamese translation"},
  ...
]
2. Keep translations concise but accurate
3. For nouns, don't include articles in translation
4. For verbs, use infinitive form in Vietnamese
5. Include alternative meanings separated by " / " if needed
6. DO NOT include the German word in the translation

Example output:
[
  {"word": "essen", "translation": "ăn"},
  {"word": "der Hund", "translation": "con chó"},
  {"word": "schnell", "translation": "nhanh"}
]`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse response:', content.text);
      throw new Error('No JSON found in response');
    }

    const results: TranslationResult[] = JSON.parse(jsonMatch[0]);
    return results;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Main repair function
 */
async function repairVocabulary() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔧 Vocabulary Repair Script');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const baseURL = process.env.ANTHROPIC_BASE_URL;

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    console.log('Please add to .env: ANTHROPIC_API_KEY=your-key-here');
    process.exit(1);
  }

  console.log(`🔑 Using API: ${baseURL || 'https://api.anthropic.com'}\n`);

  const client = new Anthropic({
    apiKey,
    baseURL: baseURL || undefined
  });

  // Fetch all vocabulary
  console.log('📚 Fetching vocabulary from database...');
  const allVocab = await prisma.vocabulary.findMany({
    select: {
      id: true,
      word: true,
      meaning_vi: true,
      level: true,
      pos: true,
    }
  });
  console.log(`   Found ${allVocab.length} total words\n`);

  // Filter words needing translation
  const needsRepair = allVocab.filter(v => needsTranslation(v.meaning_vi));
  console.log(`🔍 Found ${needsRepair.length} words needing translation\n`);

  if (needsRepair.length === 0) {
    console.log('✅ All words are properly translated!');
    return;
  }

  // Show sample of words to fix
  console.log('Sample words to fix:');
  needsRepair.slice(0, 10).forEach(w => {
    console.log(`   - "${w.word}" → "${w.meaning_vi || '(empty)'}"`);
  });
  if (needsRepair.length > 10) {
    console.log(`   ... and ${needsRepair.length - 10} more\n`);
  }

  // Process in batches of 20
  const BATCH_SIZE = 20;
  let fixedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < needsRepair.length; i += BATCH_SIZE) {
    const batch = needsRepair.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(needsRepair.length / BATCH_SIZE);

    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} words)...`);

    try {
      const translations = await translateWithClaude(client, batch);

      // Update database
      for (const item of batch) {
        const translation = translations.find(t => t.word === item.word);
        if (translation && translation.translation) {
          const oldMeaning = item.meaning_vi || '(empty)';

          await prisma.vocabulary.update({
            where: { id: item.id },
            data: { meaning_vi: translation.translation }
          });

          console.log(`   ✅ Fixed [${item.word}]: "${oldMeaning}" → "${translation.translation}"`);
          fixedCount++;
        } else {
          console.log(`   ⚠️  No translation found for: ${item.word}`);
          errorCount++;
        }
      }

      // Rate limiting - wait between batches
      if (i + BATCH_SIZE < needsRepair.length) {
        console.log('   ⏳ Waiting 1s before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`   ❌ Batch ${batchNum} failed:`, error);
      errorCount += batch.length;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ Repair complete!`);
  console.log(`   Fixed: ${fixedCount} words`);
  console.log(`   Errors: ${errorCount} words`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run the script
repairVocabulary()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
