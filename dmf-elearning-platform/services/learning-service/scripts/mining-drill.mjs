#!/usr/bin/env node
/**
 * 🔥 MINING DRILL v2.0 - Gatekeeper Strategy + Target-Driven Mining
 * Extract high-quality German-Vietnamese vocabulary from kaikki.jsonl
 *
 * Strategy:
 * 1. LOCAL FILTER (Gatekeeper) - Filter hard locally
 * 2. CLOUD PROCESSING - Batch to Claude for translation + classification
 * 3. TARGET-DRIVEN - Continue mining until reaching target word count
 * 4. SAVE - Append results to mined_data.json
 *
 * Usage:
 *   node mining-drill.mjs                    # Normal mining
 *   node mining-drill.mjs --target 15000     # Mine until 15000 words
 *   node mining-drill.mjs --resume           # Resume from last position
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

// ============================================================================
// CONFIGURATION
// ============================================================================

const args = process.argv.slice(2);
const TARGET_MODE = args.includes('--target');
const RESUME_MODE = args.includes('--resume');
const TARGET_WORDS = TARGET_MODE ? parseInt(args[args.indexOf('--target') + 1]) || 15000 : 0;

const CONFIG = {
  INPUT_FILE: 'storage/raw-data/kaikki.jsonl',
  OUTPUT_FILE: 'storage/resource-hub/mined_data.json',
  PROGRESS_FILE: 'storage/resource-hub/.mining-progress.json',
  BATCH_SIZE: 20,
  SAFETY_LIMIT: TARGET_MODE ? 1500 : 750, // Tăng limit khi target mode
  ALLOWED_POS: ['noun', 'verb', 'adj', 'adv', 'prep', 'conj', 'pron', 'intj', 'num'],
  MAX_WORD_LENGTH: 25,
  TARGET_WORDS: TARGET_WORDS,
  RESUME: RESUME_MODE,
};

// API Setup
const config = { apiKey: process.env.ANTHROPIC_API_KEY };
if (process.env.ANTHROPIC_BASE_URL) {
  config.baseURL = process.env.ANTHROPIC_BASE_URL;
}
const anthropic = new Anthropic(config);
const MODEL_NAME = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

// ============================================================================
// STATISTICS
// ============================================================================

const stats = {
  totalLines: 0,
  passedFilter: 0,
  processedBatches: 0,
  savedWords: 0,
  errors: 0,
  startLine: 0, // For resume mode
};

/**
 * Load existing mined words to skip duplicates
 */
function loadExistingWords() {
  const existingWords = new Set();
  if (fs.existsSync(CONFIG.OUTPUT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG.OUTPUT_FILE, 'utf-8'));
      data.forEach(w => existingWords.add(w.word?.toLowerCase()));
      stats.savedWords = data.length;
    } catch {
      // File might be empty
    }
  }
  return existingWords;
}

/**
 * Load/Save progress for resume mode
 */
function loadProgress() {
  if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
    try {
      const progress = JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf-8'));
      return progress.lastLine || 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

function saveProgress(lineNumber) {
  fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify({
    lastLine: lineNumber,
    timestamp: new Date().toISOString(),
  }));
}

// ============================================================================
// GATEKEEPER - LOCAL FILTER
// ============================================================================

/**
 * Filter logic: Only pass high-quality single words
 */
function passesGatekeeper(entry) {
  try {
    // Must have valid word
    if (!entry.word || typeof entry.word !== 'string') return false;

    // Must have valid POS
    if (!CONFIG.ALLOWED_POS.includes(entry.pos)) return false;

    // Must be single word (no spaces)
    if (entry.word.includes(' ')) return false;

    // Length check
    if (entry.word.length > CONFIG.MAX_WORD_LENGTH) return false;

    // Must contain only valid German characters
    const validPattern = /^[a-zA-ZäöüÄÖÜß\-]+$/;
    if (!validPattern.test(entry.word)) return false;

    // Must have English definition
    if (!entry.senses || !entry.senses[0] || !entry.senses[0].glosses || !entry.senses[0].glosses[0]) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract clean data from entry
 */
function extractData(entry) {
  return {
    word: entry.word,
    english_def: entry.senses[0].glosses[0],
    pos: entry.pos,
  };
}

// ============================================================================
// CLOUD PROCESSING - CLAUDE BATCH
// ============================================================================

/**
 * Send batch to Claude for translation + classification
 */
async function processBatch(batch) {
  const prompt = `You are a professional German-Vietnamese dictionary generator.

**INPUT**: Array of German words with English definitions.

${JSON.stringify(batch, null, 2)}

**TASK**:
1. Translate 'english_def' to Vietnamese → 'meaning_vi'
2. Assign CEFR Level (A1, A2, B1, B2, C1, C2) based on word difficulty
3. Suggest a Vietnamese topic name (e.g., "Gia đình", "Thức ăn", "Động từ cơ bản")

**OUTPUT**: Return ONLY a JSON Array in this exact format:

[
  {
    "word": "Haus",
    "meaning_vi": "ngôi nhà",
    "level": "A1",
    "topic": "Nhà ở",
    "pos": "noun"
  }
]

Return JSON for all ${batch.length} words:`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: 4000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`   ❌ Error processing batch: ${error.message}`);
    stats.errors++;
    return [];
  }
}

// ============================================================================
// SAVE RESULTS
// ============================================================================

/**
 * Append results to output file
 */
async function saveResults(results) {
  try {
    let existingData = [];

    // Read existing data if file exists
    if (fs.existsSync(CONFIG.OUTPUT_FILE)) {
      const content = await fs.promises.readFile(CONFIG.OUTPUT_FILE, 'utf-8');
      if (content.trim()) {
        existingData = JSON.parse(content);
      }
    }

    // Append new results
    const combinedData = [...existingData, ...results];

    // Write back
    await fs.promises.writeFile(
      CONFIG.OUTPUT_FILE,
      JSON.stringify(combinedData, null, 2),
      'utf-8'
    );

    stats.savedWords += results.length;
  } catch (error) {
    console.error(`   ❌ Error saving results: ${error.message}`);
    stats.errors++;
  }
}

// ============================================================================
// MAIN MINING PROCESS
// ============================================================================

async function miningDrill() {
  console.log('🔥 MINING DRILL v2.0 - STARTING...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 Input:  ${CONFIG.INPUT_FILE}`);
  console.log(`💾 Output: ${CONFIG.OUTPUT_FILE}`);
  console.log(`📦 Batch:  ${CONFIG.BATCH_SIZE} words/batch`);
  console.log(`🛡️  Limit:  ${CONFIG.SAFETY_LIMIT} batches`);
  if (CONFIG.TARGET_WORDS) {
    console.log(`🎯 Target: ${CONFIG.TARGET_WORDS} words (Target-Driven Mode)`);
  }
  if (CONFIG.RESUME) {
    console.log(`▶️  Resume: Enabled`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check input file exists
  if (!fs.existsSync(CONFIG.INPUT_FILE)) {
    console.error(`❌ File not found: ${CONFIG.INPUT_FILE}`);
    process.exit(1);
  }

  // Initialize output file
  if (!fs.existsSync(CONFIG.OUTPUT_FILE)) {
    await fs.promises.writeFile(CONFIG.OUTPUT_FILE, '[]', 'utf-8');
    console.log('✅ Created output file\n');
  }

  // Load existing words to skip duplicates
  const existingWords = loadExistingWords();
  console.log(`📊 Existing words: ${existingWords.size}`);

  // Resume from last position if enabled
  if (CONFIG.RESUME) {
    stats.startLine = loadProgress();
    console.log(`📍 Resuming from line: ${stats.startLine}\n`);
  }

  // Target check
  if (CONFIG.TARGET_WORDS && stats.savedWords >= CONFIG.TARGET_WORDS) {
    console.log(`\n🎯 Already reached target of ${CONFIG.TARGET_WORDS} words!`);
    console.log(`   Current: ${stats.savedWords} words`);
    process.exit(0);
  }

  // Create readline interface
  const fileStream = fs.createReadStream(CONFIG.INPUT_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let buffer = [];

  // Process each line
  for await (const line of rl) {
    stats.totalLines++;

    // Skip lines if resuming
    if (stats.totalLines <= stats.startLine) continue;

    // Skip empty lines
    if (!line.trim()) continue;

    try {
      const entry = JSON.parse(line);

      // Skip already existing words
      if (existingWords.has(entry.word?.toLowerCase())) continue;

      // GATEKEEPER: Local filter
      if (passesGatekeeper(entry)) {
        const cleanData = extractData(entry);
        buffer.push(cleanData);
        stats.passedFilter++;

        // Process batch when buffer is full
        if (buffer.length >= CONFIG.BATCH_SIZE) {
          stats.processedBatches++;

          console.log(`[Batch ${stats.processedBatches}/${CONFIG.SAFETY_LIMIT}] Processing ${buffer.length} words...`);

          // Send to Claude
          const results = await processBatch(buffer);

          if (results.length > 0) {
            // Save results
            await saveResults(results);
            // Add to existing set
            results.forEach(w => existingWords.add(w.word?.toLowerCase()));
            console.log(`   ✅ Saved ${results.length} words (Total: ${stats.savedWords})\n`);
          }

          // Clear buffer
          buffer = [];

          // Save progress
          saveProgress(stats.totalLines);

          // Check target
          if (CONFIG.TARGET_WORDS && stats.savedWords >= CONFIG.TARGET_WORDS) {
            console.log(`\n🎯 TARGET REACHED! ${stats.savedWords}/${CONFIG.TARGET_WORDS} words`);
            break;
          }

          // Check safety limit
          if (stats.processedBatches >= CONFIG.SAFETY_LIMIT) {
            console.log('🛡️  SAFETY LIMIT REACHED. Stopping...\n');
            break;
          }

          // Rate limiting: 1 second between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      // Skip invalid JSON lines
      continue;
    }
  }

  // Process remaining buffer
  if (buffer.length > 0 && stats.processedBatches < CONFIG.SAFETY_LIMIT) {
    if (!CONFIG.TARGET_WORDS || stats.savedWords < CONFIG.TARGET_WORDS) {
      stats.processedBatches++;
      console.log(`[Batch ${stats.processedBatches}/${CONFIG.SAFETY_LIMIT}] Processing final ${buffer.length} words...`);

      const results = await processBatch(buffer);
      if (results.length > 0) {
        await saveResults(results);
        console.log(`   ✅ Saved ${results.length} words (Total: ${stats.savedWords})\n`);
      }
    }
  }

  // Save final progress
  saveProgress(stats.totalLines);

  // Print final statistics
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 MINING DRILL v2.0 - COMPLETED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📄 Total lines read:    ${stats.totalLines}`);
  console.log(`✅ Passed gatekeeper:   ${stats.passedFilter}`);
  console.log(`📦 Batches processed:   ${stats.processedBatches}`);
  console.log(`💾 Words saved:         ${stats.savedWords}`);
  console.log(`❌ Errors:              ${stats.errors}`);
  if (CONFIG.TARGET_WORDS) {
    const progress = ((stats.savedWords / CONFIG.TARGET_WORDS) * 100).toFixed(1);
    console.log(`🎯 Target progress:     ${stats.savedWords}/${CONFIG.TARGET_WORDS} (${progress}%)`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📁 Results saved to: ${CONFIG.OUTPUT_FILE}`);
  console.log('🎯 Ready for inspection!\n');

  process.exit(0);
}

// ============================================================================
// RUN
// ============================================================================

miningDrill().catch(error => {
  console.error('💥 FATAL ERROR:', error);
  process.exit(1);
});
