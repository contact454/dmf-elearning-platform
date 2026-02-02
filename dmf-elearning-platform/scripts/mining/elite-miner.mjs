#!/usr/bin/env node
/**
 * ELITE MINER - Chế độ Tinh Binh
 *
 * Chỉ đào những từ vựng chất lượng cao nhất từ Wiktionary:
 * - Thuộc danh sách Goethe/Telc A1-C2
 * - Cực kỳ phổ biến trong đời sống
 * - Có đầy đủ thông tin (meaning, examples)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KAIKKI_PATH = '/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/services/learning-service/storage/raw-data/kaikki.jsonl';
const FREQUENCY_PATH = path.join(__dirname, '../data/frequency/frequency-data.json');
const GOETHE_PATH = path.join(__dirname, '../data/frequency/goethe-wordlist.json');
const OUTPUT_PATH = path.join(__dirname, '../data/elite-candidates.json');

// Minimum frequency rank to be considered "common"
const MAX_FREQUENCY_RANK = 15000; // Top 15k words only
const BATCH_SIZE = 2000;

// Parts of speech we care about
const VALID_POS = new Set(['noun', 'verb', 'adj', 'adv', 'prep', 'conj', 'pron', 'intj', 'num']);

// Blacklist patterns (garbage, technical, rare)
const BLACKLIST_PATTERNS = [
  /^[A-Z]{2,}$/,           // All caps acronyms
  /\d/,                     // Contains numbers
  /[^\u0000-\u024F]/,       // Non-Latin extended chars
  /^.{1}$/,                 // Single char
  /^.{25,}$/,               // Too long (compounds)
  /-.*-.*-/,                // Multiple hyphens
  /ung$/i,                  // Many -ung words are rare nominalizations
];

// Whitelist: Always accept Goethe words
let goetheWords = new Set();
let frequencyRanks = new Map();

/**
 * Load frequency data
 */
function loadFrequencyData() {
  console.log('📊 Loading frequency data...');

  // Load frequency ranks (JSON format: { word: { rank, count, score } })
  if (fs.existsSync(FREQUENCY_PATH)) {
    const data = JSON.parse(fs.readFileSync(FREQUENCY_PATH, 'utf-8'));
    for (const [word, info] of Object.entries(data)) {
      frequencyRanks.set(word.toLowerCase(), info.rank);
    }
    console.log(`   ✅ Loaded ${frequencyRanks.size} frequency ranks`);
  } else {
    console.log('   ⚠️ Frequency data not found');
  }

  // Load Goethe words (JSON format: { word: { level, priority } })
  if (fs.existsSync(GOETHE_PATH)) {
    const data = JSON.parse(fs.readFileSync(GOETHE_PATH, 'utf-8'));
    for (const word of Object.keys(data)) {
      goetheWords.add(word.toLowerCase());
    }
    console.log(`   ✅ Loaded ${goetheWords.size} Goethe words (auto-accept)`);
  } else {
    console.log('   ⚠️ Goethe wordlist not found');
  }
}

/**
 * Check if word passes elite filter
 */
function isEliteWord(entry) {
  const word = entry.word?.toLowerCase();
  if (!word) return { pass: false, reason: 'no_word' };

  // Check blacklist patterns
  for (const pattern of BLACKLIST_PATTERNS) {
    if (pattern.test(word)) {
      return { pass: false, reason: 'blacklist_pattern' };
    }
  }

  // Check POS
  const pos = entry.pos?.toLowerCase();
  if (!VALID_POS.has(pos)) {
    return { pass: false, reason: 'invalid_pos' };
  }

  // Goethe words: AUTO ACCEPT
  if (goetheWords.has(word)) {
    return { pass: true, reason: 'goethe', priority: 1 };
  }

  // Check frequency rank
  const rank = frequencyRanks.get(word);
  if (!rank) {
    return { pass: false, reason: 'not_in_frequency_list' };
  }

  if (rank > MAX_FREQUENCY_RANK) {
    return { pass: false, reason: `rank_too_low_${rank}` };
  }

  // Must have at least one sense with glosses
  const hasMeaning = entry.senses?.some(s => s.glosses?.length > 0);
  if (!hasMeaning) {
    return { pass: false, reason: 'no_meaning' };
  }

  // Priority based on frequency
  const priority = rank <= 3000 ? 2 : rank <= 8000 ? 3 : 4;

  return { pass: true, reason: 'frequency', priority, rank };
}

/**
 * Extract clean data from entry
 */
function extractData(entry) {
  const word = entry.word;
  const pos = entry.pos?.toLowerCase();

  // Get first meaningful gloss
  let meaning = null;
  let example_de = null;

  for (const sense of (entry.senses || [])) {
    if (sense.glosses?.length > 0 && !meaning) {
      meaning = sense.glosses[0];
    }
    if (sense.examples?.length > 0 && !example_de) {
      const ex = sense.examples[0];
      example_de = typeof ex === 'string' ? ex : ex.text;
    }
  }

  // Extract gender/artikel for nouns
  let artikel = null;
  let gender = null;
  let plural = null;

  if (pos === 'noun') {
    // Check head_templates for gender
    const tags = entry.head_templates?.[0]?.args || {};
    for (const key in tags) {
      const val = tags[key];
      if (val === 'm' || val === 'masculine') { gender = 'm'; artikel = 'der'; }
      if (val === 'f' || val === 'feminine') { gender = 'f'; artikel = 'die'; }
      if (val === 'n' || val === 'neuter') { gender = 'n'; artikel = 'das'; }
    }

    // Extract plural
    for (const form of (entry.forms || [])) {
      if (form.tags?.includes('plural') && form.tags?.includes('nominative')) {
        plural = form.form;
        break;
      }
    }
  }

  return {
    word,
    pos,
    meaning_en: meaning,  // English meaning from Wiktionary
    example_de,
    artikel,
    gender,
    plural,
    level: null,  // Will be assigned later
  };
}

/**
 * Assign CEFR level based on frequency
 */
function assignLevel(rank, isGoethe) {
  if (isGoethe) return 'A1';  // Goethe words are typically A1-B1
  if (rank <= 1000) return 'A1';
  if (rank <= 2500) return 'A2';
  if (rank <= 5000) return 'B1';
  if (rank <= 8000) return 'B2';
  if (rank <= 12000) return 'C1';
  return 'C2';
}

/**
 * Main mining function
 */
async function mineEliteWords() {
  console.log('\n🎖️  ELITE MINER - Chế độ Tinh Binh\n');
  console.log('='.repeat(60));

  loadFrequencyData();

  if (!fs.existsSync(KAIKKI_PATH)) {
    console.error('❌ kaikki.jsonl not found');
    process.exit(1);
  }

  const candidates = [];
  const seen = new Set();
  const stats = {
    processed: 0,
    passed: 0,
    rejected: {
      blacklist_pattern: 0,
      invalid_pos: 0,
      not_in_frequency_list: 0,
      rank_too_low: 0,
      no_meaning: 0,
      duplicate: 0,
      no_word: 0,
    }
  };

  console.log('\n⛏️  Mining elite vocabulary...\n');

  const fileStream = fs.createReadStream(KAIKKI_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    stats.processed++;

    if (stats.processed % 50000 === 0) {
      console.log(`   Processed ${stats.processed}, found ${stats.passed} elite words...`);
    }

    try {
      const entry = JSON.parse(line);
      const word = entry.word?.toLowerCase();

      // Skip duplicates
      if (seen.has(word)) {
        stats.rejected.duplicate++;
        continue;
      }

      const check = isEliteWord(entry);

      if (!check.pass) {
        const key = check.reason.startsWith('rank_too_low') ? 'rank_too_low' : check.reason;
        stats.rejected[key] = (stats.rejected[key] || 0) + 1;
        continue;
      }

      // Extract data
      const data = extractData(entry);
      data.level = assignLevel(check.rank || 1000, check.reason === 'goethe');
      data.priority = check.priority;
      data.frequencyRank = check.rank || 0;

      candidates.push(data);
      seen.add(word);
      stats.passed++;

      // Stop if we have enough
      if (candidates.length >= BATCH_SIZE) {
        console.log(`\n   ✅ Reached batch size of ${BATCH_SIZE}`);
        break;
      }

    } catch (e) {
      // Skip invalid JSON
    }
  }

  // Sort by priority (Goethe first, then by frequency)
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.frequencyRank - b.frequencyRank;
  });

  // Save results
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(candidates, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('📋 MINING REPORT');
  console.log('='.repeat(60));
  console.log(`   Total processed: ${stats.processed}`);
  console.log(`   Elite words found: ${stats.passed}`);
  console.log('\n   Rejection reasons:');
  for (const [reason, count] of Object.entries(stats.rejected)) {
    if (count > 0) {
      console.log(`   - ${reason}: ${count}`);
    }
  }

  console.log('\n   By level:');
  const byLevel = {};
  for (const c of candidates) {
    byLevel[c.level] = (byLevel[c.level] || 0) + 1;
  }
  for (const [level, count] of Object.entries(byLevel).sort()) {
    console.log(`   - ${level}: ${count}`);
  }

  console.log(`\n💾 Saved to: ${OUTPUT_PATH}`);
  console.log('\n🎖️  Báo cáo: Đã hoàn thành đợt đào Tinh Binh!');

  return candidates;
}

mineEliteWords().catch(console.error);
