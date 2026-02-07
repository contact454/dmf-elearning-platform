#!/usr/bin/env node
/**
 * 🎯 QUALITY-FIRST VOCABULARY EXPANSION
 *
 * Mục tiêu: 10,000 từ chất lượng cao
 * Nguyên tắc: Chất lượng > Số lượng
 *
 * TIÊU CHUẨN CHẤT LƯỢNG:
 *
 * ✅ KEEP (Từ chất lượng cao):
 *    1. Goethe wordlist (A1-C2 official)
 *    2. Frequency rank < 10,000 (top 10k phổ biến nhất)
 *    3. Part of Speech: noun, verb, adj, adv (core vocabulary)
 *    4. Level A1-B2 ưu tiên cao nhất
 *    5. Có trong từ điển chuẩn (DWDS, Duden)
 *
 * ⚠️ REVIEW (Cần xem xét):
 *    1. C1-C2 không có trong Goethe
 *    2. Frequency rank 10,000-20,000
 *    3. Compound words (Zusammensetzung)
 *    4. Technical terms
 *
 * ❌ REMOVE (Loại bỏ ngay):
 *    1. Proper nouns (tên riêng, địa danh)
 *    2. Abbreviations (viết tắt)
 *    3. Archaic/obsolete words (từ cổ)
 *    4. Dialectal words (phương ngữ)
 *    5. Vulgar/offensive words
 *    6. Foreign loanwords chưa Đức hóa
 *    7. Frequency rank > 30,000 (quá hiếm)
 *    8. Inflected forms (conjugated verbs, plural nouns riêng)
 *    9. Từ chỉ xuất hiện trong văn học/thơ ca
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// QUALITY CRITERIA
// ============================================================================

const QUALITY_CONFIG = {
  // Target distribution by level
  targetDistribution: {
    A1: 1500,  // Basic survival German
    A2: 2500,  // Elementary communication
    B1: 3000,  // Independent user
    B2: 2000,  // Upper intermediate
    C1: 800,   // Advanced (selective)
    C2: 200,   // Mastery (very selective)
  },

  // Maximum total
  maxTotal: 10000,

  // Frequency thresholds
  frequency: {
    excellent: 5000,    // Top 5k - highest priority
    good: 10000,        // 5k-10k - high priority
    acceptable: 20000,  // 10k-20k - medium priority
    marginal: 30000,    // 20k-30k - low priority
    reject: 30001,      // > 30k - reject
  },

  // POS priorities (1 = highest)
  posPriority: {
    'noun': 1,
    'verb': 1,
    'adj': 2,
    'adv': 2,
    'prep': 3,
    'conj': 3,
    'pron': 3,
    'num': 4,
    'intj': 4,
    'part': 5,
  },

  // Blacklist patterns (regex)
  blacklistPatterns: [
    /^[A-ZÄÖÜ]{2,}$/,           // All caps (abbreviations)
    /^\d/,                       // Starts with number
    /\d$/,                       // Ends with number
    /^(Dr|Prof|Herr|Frau)\./,   // Titles
    /^(der|die|das|ein|eine)$/, // Articles alone
    /(ung|heit|keit|schaft)$/i, // Skip if only suffix
  ],

  // Topic priorities
  topicPriority: {
    // High priority (everyday life)
    'Familie': 1, 'Essen': 1, 'Arbeit': 1, 'Wohnen': 1,
    'Gesundheit': 1, 'Reisen': 1, 'Einkaufen': 1, 'Zeit': 1,
    'Zahlen': 1, 'Farben': 1, 'Körper': 1,

    // Medium priority (social/cultural)
    'Freizeit': 2, 'Medien': 2, 'Bildung': 2, 'Natur': 2,
    'Wetter': 2, 'Kleidung': 2, 'Gefühle': 2,

    // Lower priority (specialized)
    'Politik': 3, 'Wirtschaft': 3, 'Wissenschaft': 3,
    'Technik': 3, 'Kunst': 3, 'Sport': 3,
  },
};

// ============================================================================
// QUALITY SCORING FUNCTION
// ============================================================================

function calculateQualityScore(word) {
  let score = 0;
  let flags = [];

  // 1. Level score (A1-B2 preferred)
  const levelScores = { A1: 50, A2: 45, B1: 40, B2: 35, C1: 20, C2: 10 };
  score += levelScores[word.level] || 0;

  // 2. Goethe bonus
  if (word.is_goethe) {
    score += 30;
    flags.push('GOETHE');
  }

  // 3. Frequency score
  const freq = word.frequency || 50000;
  if (freq <= QUALITY_CONFIG.frequency.excellent) {
    score += 25;
    flags.push('FREQ_EXCELLENT');
  } else if (freq <= QUALITY_CONFIG.frequency.good) {
    score += 20;
    flags.push('FREQ_GOOD');
  } else if (freq <= QUALITY_CONFIG.frequency.acceptable) {
    score += 10;
    flags.push('FREQ_OK');
  } else if (freq <= QUALITY_CONFIG.frequency.marginal) {
    score += 5;
  } else {
    score -= 20;
    flags.push('FREQ_RARE');
  }

  // 4. POS score
  const posPriority = QUALITY_CONFIG.posPriority[word.pos] || 5;
  score += (6 - posPriority) * 5; // Higher priority = more points

  // 5. Has examples bonus
  if (word.example_de && word.example_vi) {
    score += 10;
  }

  // 6. Blacklist check
  for (const pattern of QUALITY_CONFIG.blacklistPatterns) {
    if (pattern.test(word.word)) {
      score -= 50;
      flags.push('BLACKLIST');
      break;
    }
  }

  // 7. Word length penalty (too short or too long)
  if (word.word.length < 3) {
    score -= 10;
  } else if (word.word.length > 20) {
    score -= 15;
    flags.push('TOO_LONG');
  }

  // 8. Translation quality check
  if (!word.meaning_vi || word.meaning_vi.length < 2) {
    score -= 30;
    flags.push('BAD_TRANSLATION');
  }

  return { score, flags };
}

// ============================================================================
// QUALITY CLASSIFICATION
// ============================================================================

function classifyWord(word) {
  const { score, flags } = calculateQualityScore(word);

  // Classification thresholds
  if (score >= 70) return { decision: 'KEEP', score, flags, tier: 'A' };
  if (score >= 50) return { decision: 'KEEP', score, flags, tier: 'B' };
  if (score >= 30) return { decision: 'REVIEW', score, flags, tier: 'C' };
  return { decision: 'REMOVE', score, flags, tier: 'D' };
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

async function processVocabulary() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🎯 QUALITY-FIRST VOCABULARY EXPANSION                    ║');
  console.log('║    Mục tiêu: 10,000 từ chất lượng cao                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Load data
  const minedPath = path.join(__dirname, '../data/new-mined-words.json');
  const curatedPath = path.join(__dirname, '../data/curation/final/curated-vocabulary.json');

  const mined = JSON.parse(fs.readFileSync(minedPath, 'utf-8'));
  const curated = JSON.parse(fs.readFileSync(curatedPath, 'utf-8'));

  console.log(`📥 Loaded ${mined.length} mined words`);
  console.log(`📥 Loaded ${curated.length} already curated words\n`);

  // Create set of already curated words
  const curatedSet = new Set(curated.map(w => w.word.toLowerCase()));

  // Process only new words
  const newWords = mined.filter(w => !curatedSet.has(w.word.toLowerCase()));
  console.log(`🆕 New words to process: ${newWords.length}\n`);

  // Classify all new words
  const results = { KEEP: [], REVIEW: [], REMOVE: [] };
  const tierCounts = { A: 0, B: 0, C: 0, D: 0 };

  for (const word of newWords) {
    const classification = classifyWord(word);
    word._quality = classification;
    results[classification.decision].push(word);
    tierCounts[classification.tier]++;
  }

  console.log('📊 Classification Results:');
  console.log(`   ✅ KEEP: ${results.KEEP.length}`);
  console.log(`   ⚠️  REVIEW: ${results.REVIEW.length}`);
  console.log(`   ❌ REMOVE: ${results.REMOVE.length}\n`);

  console.log('📈 Quality Tiers:');
  console.log(`   Tier A (Excellent): ${tierCounts.A}`);
  console.log(`   Tier B (Good): ${tierCounts.B}`);
  console.log(`   Tier C (Review): ${tierCounts.C}`);
  console.log(`   Tier D (Remove): ${tierCounts.D}\n`);

  // Sort KEEP by score (highest first)
  results.KEEP.sort((a, b) => b._quality.score - a._quality.score);

  // Calculate how many more we need
  const currentTotal = curated.length;
  const target = QUALITY_CONFIG.maxTotal;
  const needed = target - currentTotal;

  console.log(`🎯 Target: ${target} words`);
  console.log(`📦 Current: ${currentTotal} words`);
  console.log(`📉 Needed: ${needed} more words\n`);

  // Select top quality words up to target
  const selectedNew = results.KEEP.slice(0, Math.min(results.KEEP.length, needed));

  // Distribution by level
  const distribution = {};
  selectedNew.forEach(w => {
    const level = w.level || 'unknown';
    distribution[level] = (distribution[level] || 0) + 1;
  });

  console.log('📈 Selected Distribution by Level:');
  Object.entries(distribution).sort().forEach(([level, count]) => {
    const target = QUALITY_CONFIG.targetDistribution[level] || 0;
    const pct = target > 0 ? Math.round((count / target) * 100) : 0;
    console.log(`   ${level}: ${count} (${pct}% of target ${target})`);
  });

  // Save results
  const outputDir = path.join(__dirname, '../data/quality-expansion');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'selected-high-quality.json'),
    JSON.stringify(selectedNew, null, 2)
  );

  // Save all review candidates sorted by score
  results.REVIEW.sort((a, b) => b._quality.score - a._quality.score);
  fs.writeFileSync(
    path.join(outputDir, 'review-candidates.json'),
    JSON.stringify(results.REVIEW, null, 2) // All review candidates
  );

  fs.writeFileSync(
    path.join(outputDir, 'quality-stats.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      source: { mined: mined.length, curated: curated.length },
      classification: {
        keep: results.KEEP.length,
        review: results.REVIEW.length,
        remove: results.REMOVE.length,
      },
      tiers: tierCounts,
      selected: selectedNew.length,
      distribution,
      targetDistribution: QUALITY_CONFIG.targetDistribution,
    }, null, 2)
  );

  console.log(`\n💾 Saved to: ${outputDir}`);
  console.log(`   - selected-high-quality.json (${selectedNew.length} words)`);
  console.log(`   - review-candidates.json (${Math.min(2000, results.REVIEW.length)} words)`);
  console.log(`   - quality-stats.json`);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ✅ QUALITY ANALYSIS COMPLETE                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📌 Next Steps:`);
  console.log(`   1. Review selected-high-quality.json`);
  console.log(`   2. Run enrichment on selected words`);
  console.log(`   3. Seed to database`);
  console.log(`   4. If still need more: process review-candidates.json`);
}

processVocabulary().catch(console.error);
