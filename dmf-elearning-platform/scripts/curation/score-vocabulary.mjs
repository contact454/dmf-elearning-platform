#!/usr/bin/env node
/**
 * Vocabulary Curation Pipeline - Phase 1: Score Vocabulary
 *
 * Scores all vocabulary in the database based on:
 * 1. Goethe Institut word lists (PROTECTED - always keep)
 * 2. Frequency data from corpus
 *
 * Output: Curated vocabulary with scores and recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/frequency');
const OUTPUT_DIR = path.join(__dirname, '../data/curation');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Learning Service API
const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:3003';

/**
 * Load Goethe word list
 */
function loadGoetheList() {
  const filePath = path.join(DATA_DIR, 'goethe-wordlist.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Goethe word list not found. Run fetch-frequency-data.mjs first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Load frequency data
 */
function loadFrequencyData() {
  const filePath = path.join(DATA_DIR, 'frequency-data.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Frequency data not found. Run fetch-frequency-data.mjs first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Fetch all vocabulary from database
 */
async function fetchAllVocabulary() {
  console.log('📥 Fetching vocabulary from database...');

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const allWords = [];

  for (const level of levels) {
    try {
      const response = await fetch(`${LEARNING_SERVICE_URL}/api/vocabulary?level=${level}&limit=5000`);
      if (response.ok) {
        const json = await response.json();
        // API returns { success: true, data: [...], pagination: {...} }
        const items = json.data || json.items || [];
        allWords.push(...items);
        console.log(`   ${level}: ${items.length} words`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to fetch ${level}:`, error.message);
    }
  }

  return allWords;
}

/**
 * Normalize word for matching
 * - Lowercase
 * - Remove articles (der, die, das)
 * - Handle umlauts
 */
function normalizeWord(word) {
  let normalized = word.toLowerCase().trim();

  // Remove common prefixes
  const prefixes = ['der ', 'die ', 'das ', 'ein ', 'eine '];
  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length);
      break;
    }
  }

  return normalized;
}

/**
 * Score a single word
 */
function scoreWord(word, goetheList, frequencyData) {
  const normalized = normalizeWord(word.word);
  const result = {
    id: word.id,
    word: word.word,
    normalized: normalized,
    level: word.level,
    pos: word.pos,
    meaning_vi: word.meaning_vi,
    scores: {
      goethe: 0,
      frequency: 0,
      total: 0
    },
    flags: {
      isGoethe: false,
      goetheLevel: null,
      frequencyRank: null,
      recommendation: 'review' // keep, review, remove
    }
  };

  // Check Goethe list
  if (goetheList[normalized]) {
    result.scores.goethe = goetheList[normalized].priority;
    result.flags.isGoethe = true;
    result.flags.goetheLevel = goetheList[normalized].level;
    result.flags.recommendation = 'keep'; // PROTECTED
  }

  // Check frequency
  if (frequencyData[normalized]) {
    result.scores.frequency = frequencyData[normalized].score;
    result.flags.frequencyRank = frequencyData[normalized].rank;
  }

  // Calculate total score
  // Goethe words get bonus
  if (result.flags.isGoethe) {
    result.scores.total = 100; // Maximum score for Goethe words
  } else {
    result.scores.total = result.scores.frequency;
  }

  // Determine recommendation
  if (!result.flags.isGoethe) {
    if (result.scores.frequency >= 60) {
      result.flags.recommendation = 'keep';
    } else if (result.scores.frequency >= 30) {
      result.flags.recommendation = 'review';
    } else if (result.scores.frequency > 0) {
      result.flags.recommendation = 'review';
    } else {
      // Not in frequency list at all
      result.flags.recommendation = 'review';
    }
  }

  return result;
}

/**
 * Apply curation rules based on level
 */
function applyCurationRules(scoredWords) {
  const curated = {
    keep: [],
    review: [],
    remove: []
  };

  for (const word of scoredWords) {
    // Rule 1: Goethe words are ALWAYS kept
    if (word.flags.isGoethe) {
      word.flags.recommendation = 'keep';
      curated.keep.push(word);
      continue;
    }

    // Rule 2: Apply level-specific thresholds
    const level = word.level;
    const freqScore = word.scores.frequency;

    switch (level) {
      case 'A1':
        // A1 needs high frequency OR Goethe
        if (freqScore >= 50) {
          word.flags.recommendation = 'keep';
          curated.keep.push(word);
        } else if (freqScore >= 20) {
          word.flags.recommendation = 'review';
          curated.review.push(word);
        } else {
          word.flags.recommendation = 'remove';
          curated.remove.push(word);
        }
        break;

      case 'A2':
        if (freqScore >= 40) {
          word.flags.recommendation = 'keep';
          curated.keep.push(word);
        } else if (freqScore >= 15) {
          word.flags.recommendation = 'review';
          curated.review.push(word);
        } else {
          word.flags.recommendation = 'remove';
          curated.remove.push(word);
        }
        break;

      case 'B1':
        if (freqScore >= 30) {
          word.flags.recommendation = 'keep';
          curated.keep.push(word);
        } else if (freqScore >= 10) {
          word.flags.recommendation = 'review';
          curated.review.push(word);
        } else {
          word.flags.recommendation = 'remove';
          curated.remove.push(word);
        }
        break;

      case 'B2':
        if (freqScore >= 20) {
          word.flags.recommendation = 'keep';
          curated.keep.push(word);
        } else if (freqScore >= 5) {
          word.flags.recommendation = 'review';
          curated.review.push(word);
        } else {
          word.flags.recommendation = 'remove';
          curated.remove.push(word);
        }
        break;

      case 'C1':
      case 'C2':
        // C1/C2 can include less common words
        if (freqScore >= 10) {
          word.flags.recommendation = 'keep';
          curated.keep.push(word);
        } else if (freqScore > 0) {
          word.flags.recommendation = 'review';
          curated.review.push(word);
        } else {
          // For C level, even unknown words might be valid (technical/literary)
          word.flags.recommendation = 'review';
          curated.review.push(word);
        }
        break;

      default:
        word.flags.recommendation = 'review';
        curated.review.push(word);
    }
  }

  return curated;
}

/**
 * Generate statistics report
 */
function generateReport(scoredWords, curated) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: scoredWords.length,
      goetheWords: scoredWords.filter(w => w.flags.isGoethe).length,
      withFrequency: scoredWords.filter(w => w.scores.frequency > 0).length,
      noFrequency: scoredWords.filter(w => w.scores.frequency === 0).length
    },
    recommendations: {
      keep: curated.keep.length,
      review: curated.review.length,
      remove: curated.remove.length
    },
    byLevel: {}
  };

  // Stats by level
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  for (const level of levels) {
    const levelWords = scoredWords.filter(w => w.level === level);
    report.byLevel[level] = {
      total: levelWords.length,
      goethe: levelWords.filter(w => w.flags.isGoethe).length,
      keep: curated.keep.filter(w => w.level === level).length,
      review: curated.review.filter(w => w.level === level).length,
      remove: curated.remove.filter(w => w.level === level).length,
      avgFrequency: Math.round(
        levelWords.reduce((sum, w) => sum + w.scores.frequency, 0) / levelWords.length || 0
      )
    };
  }

  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Vocabulary Scoring\n');
  console.log('='.repeat(60));

  // 1. Load reference data
  console.log('\n📚 Loading reference data...');
  const goetheList = loadGoetheList();
  const frequencyData = loadFrequencyData();
  console.log(`   ✅ Goethe words: ${Object.keys(goetheList).length}`);
  console.log(`   ✅ Frequency entries: ${Object.keys(frequencyData).length}`);

  // 2. Fetch vocabulary from database
  console.log('\n📥 Fetching vocabulary from database...');
  const vocabulary = await fetchAllVocabulary();
  console.log(`   ✅ Total words: ${vocabulary.length}`);

  // 3. Score each word
  console.log('\n📊 Scoring vocabulary...');
  const scoredWords = vocabulary.map(word => scoreWord(word, goetheList, frequencyData));

  // 4. Apply curation rules
  console.log('\n🔍 Applying curation rules...');
  const curated = applyCurationRules(scoredWords);

  // 5. Generate report
  const report = generateReport(scoredWords, curated);

  // 6. Save results
  console.log('\n💾 Saving results...');

  // Full scored data
  const scoredPath = path.join(OUTPUT_DIR, 'scored-vocabulary.json');
  fs.writeFileSync(scoredPath, JSON.stringify(scoredWords, null, 2));
  console.log(`   📁 Scored vocabulary: ${scoredPath}`);

  // Curated lists
  const keepPath = path.join(OUTPUT_DIR, 'keep-words.json');
  fs.writeFileSync(keepPath, JSON.stringify(curated.keep, null, 2));
  console.log(`   📁 Keep words: ${keepPath}`);

  const reviewPath = path.join(OUTPUT_DIR, 'review-words.json');
  fs.writeFileSync(reviewPath, JSON.stringify(curated.review, null, 2));
  console.log(`   📁 Review words: ${reviewPath}`);

  const removePath = path.join(OUTPUT_DIR, 'remove-words.json');
  fs.writeFileSync(removePath, JSON.stringify(curated.remove, null, 2));
  console.log(`   📁 Remove words: ${removePath}`);

  // Report
  const reportPath = path.join(OUTPUT_DIR, 'curation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`   📁 Report: ${reportPath}`);

  // 7. Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 CURATION REPORT');
  console.log('='.repeat(60));

  console.log('\n📊 Overall:');
  console.log(`   Total words: ${report.summary.total}`);
  console.log(`   Goethe protected: ${report.summary.goetheWords} ⭐`);
  console.log(`   With frequency data: ${report.summary.withFrequency}`);
  console.log(`   No frequency data: ${report.summary.noFrequency}`);

  console.log('\n📝 Recommendations:');
  console.log(`   ✅ KEEP: ${report.recommendations.keep} words`);
  console.log(`   🔍 REVIEW: ${report.recommendations.review} words`);
  console.log(`   ❌ REMOVE: ${report.recommendations.remove} words`);

  console.log('\n📈 By Level:');
  console.log('   Level | Total | Goethe | Keep | Review | Remove | Avg Freq');
  console.log('   ' + '-'.repeat(60));
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    const s = report.byLevel[level];
    console.log(`   ${level}    | ${String(s.total).padStart(5)} | ${String(s.goethe).padStart(6)} | ${String(s.keep).padStart(4)} | ${String(s.review).padStart(6)} | ${String(s.remove).padStart(6)} | ${String(s.avgFrequency).padStart(8)}`);
  }

  // Show sample of words to review
  console.log('\n📝 Sample words marked for REVIEW (need AI check):');
  const reviewSample = curated.review.slice(0, 10);
  for (const word of reviewSample) {
    console.log(`   - ${word.word} (${word.level}): freq=${word.scores.frequency}, "${word.meaning_vi}"`);
  }

  // Show sample of words to remove
  console.log('\n❌ Sample words marked for REMOVE:');
  const removeSample = curated.remove.slice(0, 10);
  for (const word of removeSample) {
    console.log(`   - ${word.word} (${word.level}): freq=${word.scores.frequency}, "${word.meaning_vi}"`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Phase 1 scoring complete!');
  console.log('👉 Next steps:');
  console.log('   1. Review "review-words.json" manually or with AI (Phase 2)');
  console.log('   2. Run apply-curation.mjs to update database');
}

main().catch(console.error);
