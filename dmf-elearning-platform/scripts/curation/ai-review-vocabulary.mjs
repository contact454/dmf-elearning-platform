#!/usr/bin/env node
/**
 * Vocabulary Curation Pipeline - Phase 2: AI Quality Check
 *
 * Uses Claude API to evaluate words marked for review:
 * - Is the word commonly used?
 * - Is it appropriate for the assigned level?
 * - Is it outdated/archaic?
 * - Is it too specialized/technical?
 *
 * Processes in batches to optimize API usage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/curation');
const OUTPUT_DIR = path.join(__dirname, '../data/curation/ai-reviewed');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Claude API configuration
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
});

// Batch size for API calls
const BATCH_SIZE = 50;

// Progress tracking
let progressFile = path.join(OUTPUT_DIR, 'progress.json');

/**
 * Load review words
 */
function loadReviewWords() {
  const filePath = path.join(DATA_DIR, 'review-words.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Review words not found. Run score-vocabulary.mjs first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Load or initialize progress
 */
function loadProgress() {
  if (fs.existsSync(progressFile)) {
    return JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
  }
  return {
    processedBatches: 0,
    totalBatches: 0,
    results: [],
    startTime: new Date().toISOString()
  };
}

/**
 * Save progress
 */
function saveProgress(progress) {
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

/**
 * Create prompt for Claude to evaluate words
 */
function createEvaluationPrompt(words) {
  const wordList = words.map(w =>
    `- "${w.word}" (${w.level}, ${w.pos || 'unknown'}): "${w.meaning_vi}"`
  ).join('\n');

  return `You are a German language expert evaluating vocabulary for a language learning app targeting Vietnamese learners.

For each word below, evaluate if it should be KEPT or REMOVED from the vocabulary list.

KEEP a word if:
- It's commonly used in everyday German
- It's appropriate for the CEFR level indicated
- Vietnamese learners would benefit from learning it
- It's a standard, non-dialectal form

REMOVE a word if:
- It's archaic, outdated, or rarely used
- It's too specialized/technical for general learners
- It's a dialectal or non-standard form
- It's a grammatical form that shouldn't be a separate entry (like plural-only entries)
- The meaning seems incorrect or incomplete
- It's abbreviations or informal slang inappropriate for the level

WORDS TO EVALUATE:
${wordList}

Respond in JSON format only:
{
  "evaluations": [
    {
      "word": "the word",
      "decision": "keep" or "remove",
      "reason": "brief reason in Vietnamese",
      "suggestedLevel": "A1/A2/B1/B2/C1/C2 or null if current is correct"
    }
  ]
}

Be strict but fair. If unsure, lean towards KEEP for common-looking words.`;
}

/**
 * Call Claude API to evaluate a batch of words
 */
async function evaluateBatch(words, batchNum, totalBatches) {
  const prompt = createEvaluationPrompt(words);

  try {
    console.log(`   🤖 Calling Claude API for batch ${batchNum}/${totalBatches}...`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`   ❌ Could not parse JSON from response`);
      return words.map(w => ({
        word: w.word,
        decision: 'keep',
        reason: 'Không thể đánh giá - giữ mặc định',
        suggestedLevel: null
      }));
    }

    const result = JSON.parse(jsonMatch[0]);
    return result.evaluations;

  } catch (error) {
    console.error(`   ❌ API error: ${error.message}`);
    // Return default "keep" for failed batches
    return words.map(w => ({
      word: w.word,
      decision: 'keep',
      reason: 'Lỗi API - giữ mặc định',
      suggestedLevel: null
    }));
  }
}

/**
 * Process all review words
 */
async function processReviewWords(reviewWords) {
  // Create batches
  const batches = [];
  for (let i = 0; i < reviewWords.length; i += BATCH_SIZE) {
    batches.push(reviewWords.slice(i, i + BATCH_SIZE));
  }

  console.log(`\n📦 Created ${batches.length} batches of ${BATCH_SIZE} words each`);

  // Load progress
  let progress = loadProgress();
  progress.totalBatches = batches.length;

  // Process batches
  const allResults = progress.results || [];
  const startBatch = progress.processedBatches;

  for (let i = startBatch; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n📝 Processing batch ${i + 1}/${batches.length} (${batch.length} words)...`);

    const evaluations = await evaluateBatch(batch, i + 1, batches.length);

    // Merge evaluations with original word data
    for (let j = 0; j < batch.length; j++) {
      const original = batch[j];
      const evaluation = evaluations[j] || {
        decision: 'keep',
        reason: 'Không có đánh giá',
        suggestedLevel: null
      };

      allResults.push({
        ...original,
        aiDecision: evaluation.decision,
        aiReason: evaluation.reason,
        suggestedLevel: evaluation.suggestedLevel
      });
    }

    // Update progress
    progress.processedBatches = i + 1;
    progress.results = allResults;
    saveProgress(progress);

    // Show progress
    const keepCount = allResults.filter(r => r.aiDecision === 'keep').length;
    const removeCount = allResults.filter(r => r.aiDecision === 'remove').length;
    console.log(`   ✅ Progress: ${keepCount} keep, ${removeCount} remove`);

    // Rate limiting - wait between batches
    if (i < batches.length - 1) {
      console.log(`   ⏳ Waiting 1s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return allResults;
}

/**
 * Generate final curation results
 */
function generateFinalResults(aiReviewed, keepWords) {
  // Words AI says to keep from review list
  const aiKeep = aiReviewed.filter(w => w.aiDecision === 'keep');
  const aiRemove = aiReviewed.filter(w => w.aiDecision === 'remove');

  // Combine with original keep words
  const finalKeep = [...keepWords, ...aiKeep];

  // Stats by level
  const stats = {
    original: {
      keep: keepWords.length,
      review: aiReviewed.length
    },
    afterAI: {
      keep: finalKeep.length,
      remove: aiRemove.length
    },
    byLevel: {}
  };

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  for (const level of levels) {
    stats.byLevel[level] = {
      finalKeep: finalKeep.filter(w => w.level === level).length,
      aiRemoved: aiRemove.filter(w => w.level === level).length
    };
  }

  return { finalKeep, aiRemove, stats };
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Phase 2: AI Quality Check\n');
  console.log('='.repeat(60));

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable not set');
    console.log('   Set it with: export ANTHROPIC_API_KEY=your-key');
    process.exit(1);
  }

  // 1. Load review words
  console.log('\n📥 Loading review words...');
  const reviewWords = loadReviewWords();
  console.log(`   ✅ Loaded ${reviewWords.length} words to review`);

  // 2. Load original keep words
  const keepWordsPath = path.join(DATA_DIR, 'keep-words.json');
  const keepWords = JSON.parse(fs.readFileSync(keepWordsPath, 'utf-8'));
  console.log(`   ✅ Original keep words: ${keepWords.length}`);

  // 3. Check for existing progress
  const progress = loadProgress();
  if (progress.processedBatches > 0) {
    console.log(`\n📊 Resuming from batch ${progress.processedBatches}/${progress.totalBatches}`);
  }

  // 4. Process with AI
  console.log('\n🤖 Starting AI evaluation...');
  console.log('   Model: claude-sonnet-4-5');
  console.log(`   Batch size: ${BATCH_SIZE} words`);

  const aiReviewed = await processReviewWords(reviewWords);

  // 5. Generate final results
  console.log('\n📊 Generating final results...');
  const { finalKeep, aiRemove, stats } = generateFinalResults(aiReviewed, keepWords);

  // 6. Save results
  console.log('\n💾 Saving results...');

  const finalKeepPath = path.join(OUTPUT_DIR, 'final-keep-words.json');
  fs.writeFileSync(finalKeepPath, JSON.stringify(finalKeep, null, 2));
  console.log(`   📁 Final keep words: ${finalKeepPath}`);

  const aiRemovePath = path.join(OUTPUT_DIR, 'ai-remove-words.json');
  fs.writeFileSync(aiRemovePath, JSON.stringify(aiRemove, null, 2));
  console.log(`   📁 AI remove words: ${aiRemovePath}`);

  const aiReviewedPath = path.join(OUTPUT_DIR, 'ai-reviewed-all.json');
  fs.writeFileSync(aiReviewedPath, JSON.stringify(aiReviewed, null, 2));
  console.log(`   📁 All AI reviewed: ${aiReviewedPath}`);

  const statsPath = path.join(OUTPUT_DIR, 'ai-review-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`   📁 Stats: ${statsPath}`);

  // 7. Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 AI REVIEW SUMMARY');
  console.log('='.repeat(60));

  console.log('\n📊 Before AI Review:');
  console.log(`   KEEP (auto): ${stats.original.keep} words`);
  console.log(`   REVIEW: ${stats.original.review} words`);

  console.log('\n📊 After AI Review:');
  console.log(`   ✅ FINAL KEEP: ${stats.afterAI.keep} words`);
  console.log(`   ❌ REMOVED: ${stats.afterAI.remove} words`);

  console.log('\n📈 Final Count by Level:');
  console.log('   Level | Final Keep | AI Removed');
  console.log('   ' + '-'.repeat(35));
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    const s = stats.byLevel[level];
    console.log(`   ${level}    | ${String(s.finalKeep).padStart(10)} | ${String(s.aiRemoved).padStart(10)}`);
  }

  // Show sample AI decisions
  console.log('\n📝 Sample AI REMOVE decisions:');
  const removeSample = aiRemove.slice(0, 10);
  for (const word of removeSample) {
    console.log(`   ❌ ${word.word} (${word.level}): ${word.aiReason}`);
  }

  console.log('\n📝 Sample AI KEEP decisions:');
  const keepSample = aiReviewed.filter(w => w.aiDecision === 'keep').slice(0, 10);
  for (const word of keepSample) {
    console.log(`   ✅ ${word.word} (${word.level}): ${word.aiReason}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Phase 2 AI review complete!');
  console.log('👉 Next: Run apply-curation.mjs to update database');
}

main().catch(console.error);
