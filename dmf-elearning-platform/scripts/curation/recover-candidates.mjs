#!/usr/bin/env node
/**
 * 🔄 RE-EVALUATE REMOVE CANDIDATES
 *
 * Xem lại các từ bị REMOVE với tiêu chí mềm hơn
 * Mục tiêu: Recover thêm từ có chất lượng chấp nhận được
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load mined words and existing vocabulary
const minedPath = path.join(__dirname, '../data/new-mined-words.json');
const finalPath = path.join(__dirname, '../data/quality-expansion/final-vocabulary.json');

const mined = JSON.parse(fs.readFileSync(minedPath, 'utf-8'));
const final = JSON.parse(fs.readFileSync(finalPath, 'utf-8'));

// Create set of already included words
const includedSet = new Set(final.map(w => w.word.toLowerCase()));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    🔄 RE-EVALUATE REMOVE CANDIDATES                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`📥 Total mined: ${mined.length}`);
console.log(`📦 Already included: ${includedSet.size}`);

// Find words not yet included
const notIncluded = mined.filter(w => !includedSet.has(w.word.toLowerCase()));
console.log(`🆕 Not yet included: ${notIncluded.length}\n`);

// More lenient quality criteria for second pass
function evaluateForRecovery(word) {
  let score = 0;
  let reasons = [];

  // 1. Level bonus (A1-B2 preferred)
  const levelScores = { A1: 40, A2: 35, B1: 30, B2: 25, C1: 15, C2: 10 };
  score += levelScores[word.level] || 5;

  // 2. POS bonus (nouns, verbs, adjectives are most useful)
  const posScores = { noun: 25, verb: 25, adj: 20, adv: 15, prep: 10, conj: 10, num: 10 };
  score += posScores[word.pos] || 5;

  // 3. Has translation
  if (word.meaning_vi && word.meaning_vi.length > 2) {
    score += 15;
  } else {
    reasons.push('NO_TRANSLATION');
  }

  // 4. Word length check
  if (word.word.length < 2) {
    score -= 30;
    reasons.push('TOO_SHORT');
  } else if (word.word.length > 25) {
    score -= 20;
    reasons.push('TOO_LONG');
  }

  // 5. Blacklist patterns
  const blacklist = [
    /^[A-ZÄÖÜ]{3,}$/,  // All caps abbreviations
    /^\d/,             // Starts with number
    /\d$/,             // Ends with number
    /^(Dr|Prof|Herr|Frau)\./,  // Titles
  ];

  for (const pattern of blacklist) {
    if (pattern.test(word.word)) {
      score -= 40;
      reasons.push('BLACKLIST');
      break;
    }
  }

  // 6. Topic bonus (everyday topics)
  const goodTopics = [
    'Familie', 'Essen', 'Arbeit', 'Wohnen', 'Gesundheit', 'Reisen',
    'Einkaufen', 'Zeit', 'Körper', 'Freizeit', 'Natur', 'Wetter',
    'Kleidung', 'Gefühle', 'Kommunikation', 'Bildung'
  ];
  if (word.topic && goodTopics.some(t => word.topic.includes(t))) {
    score += 10;
  }

  return { score, reasons, decision: score >= 45 ? 'RECOVER' : 'SKIP' };
}

// Evaluate all not-included words
const recovered = [];
const stillSkipped = [];

for (const word of notIncluded) {
  const evaluation = evaluateForRecovery(word);
  if (evaluation.decision === 'RECOVER') {
    recovered.push({ ...word, _recovery: evaluation });
  } else {
    stillSkipped.push({ ...word, _recovery: evaluation });
  }
}

// Sort recovered by score
recovered.sort((a, b) => b._recovery.score - a._recovery.score);

console.log('📊 Recovery Results:');
console.log(`   ✅ Recovered: ${recovered.length}`);
console.log(`   ❌ Still skipped: ${stillSkipped.length}`);

// Distribution of recovered by level
const distribution = {};
recovered.forEach(w => {
  const level = w.level || 'unknown';
  distribution[level] = (distribution[level] || 0) + 1;
});

console.log('\n📈 Recovered by Level:');
Object.entries(distribution).sort().forEach(([level, count]) => {
  console.log(`   ${level}: ${count} words`);
});

// Save recovered words
const outputPath = path.join(__dirname, '../data/quality-expansion/recovered-words.json');
fs.writeFileSync(outputPath, JSON.stringify(recovered, null, 2));
console.log(`\n💾 Saved ${recovered.length} recovered words to: ${outputPath}`);

// Save stats
const statsPath = path.join(__dirname, '../data/quality-expansion/recovery-stats.json');
fs.writeFileSync(statsPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalMined: mined.length,
  alreadyIncluded: includedSet.size,
  notIncluded: notIncluded.length,
  recovered: recovered.length,
  stillSkipped: stillSkipped.length,
  distribution
}, null, 2));

console.log('\n📌 Next: Run AI review on recovered words');
