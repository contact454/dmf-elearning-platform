#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 29 - Final 15 Unique Words to Cross 10K
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch29-vocabulary.json');

const vocabulary = [
  // Very specific unique words to cross 10K
  { word: 'der Zahnarzt', level: 'A1', topic: 'medical', pos: 'noun', meaning_vi: 'nha sĩ' },
  { word: 'die Zahnärztin', level: 'A1', topic: 'medical', pos: 'noun', meaning_vi: 'nha sĩ (nữ)' },
  { word: 'der Tierarzt', level: 'A1', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ thú y' },
  { word: 'die Tierärztin', level: 'A1', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ thú y (nữ)' },
  { word: 'der Augenarzt', level: 'A2', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ nhãn khoa' },
  { word: 'der Hautarzt', level: 'A2', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ da liễu' },
  { word: 'der Kinderarzt', level: 'A2', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ nhi khoa' },
  { word: 'der Frauenarzt', level: 'A2', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ phụ khoa' },
  { word: 'der Orthopäde', level: 'B1', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ chỉnh hình' },
  { word: 'der Kardiologe', level: 'B1', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ tim mạch' },
  { word: 'der Neurologe', level: 'B1', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ thần kinh' },
  { word: 'der Psychiater', level: 'B1', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ tâm thần' },
  { word: 'der Radiologe', level: 'B2', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ X-quang' },
  { word: 'der Onkologe', level: 'B2', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ ung thư' },
  { word: 'der Anästhesist', level: 'B2', topic: 'medical', pos: 'noun', meaning_vi: 'bác sĩ gây mê' },
];

const outputDir = path.dirname(OUTPUT);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    ⛏️  BATCH 29 - FINAL WORDS TO CROSS 10K                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`📦 Total words: ${vocabulary.length}`);
console.log(`📁 Saved to: ${OUTPUT}`);

const dist = {};
vocabulary.forEach(w => {
  dist[w.level] = (dist[w.level] || 0) + 1;
});
console.log('\n📊 Distribution:');
Object.entries(dist).sort().forEach(([level, count]) => {
  console.log(`   ${level}: ${count} words`);
});
