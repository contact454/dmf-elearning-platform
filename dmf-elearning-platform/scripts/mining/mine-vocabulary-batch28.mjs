#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 28 - Final 20 Words to Cross 10K
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch28-vocabulary.json');

const vocabulary = [
  // Final unique words to cross 10K threshold
  { word: 'die Apotheke', level: 'A1', topic: 'shop', pos: 'noun', meaning_vi: 'nhà thuốc' },
  { word: 'der Apotheker', level: 'A1', topic: 'profession', pos: 'noun', meaning_vi: 'dược sĩ' },
  { word: 'das Rezept', level: 'A1', topic: 'medical', pos: 'noun', meaning_vi: 'đơn thuốc' },
  { word: 'die Tablette', level: 'A1', topic: 'medical', pos: 'noun', meaning_vi: 'viên thuốc' },
  { word: 'die Salbe', level: 'A1', topic: 'medical', pos: 'noun', meaning_vi: 'thuốc mỡ' },
  { word: 'der Verband', level: 'A2', topic: 'medical', pos: 'noun', meaning_vi: 'băng gạc' },
  { word: 'das Pflaster', level: 'A2', topic: 'medical', pos: 'noun', meaning_vi: 'băng cá nhân' },
  { word: 'die Spritze', level: 'A2', topic: 'medical', pos: 'noun', meaning_vi: 'ống tiêm' },
  { word: 'das Thermometer', level: 'A2', topic: 'medical', pos: 'noun', meaning_vi: 'nhiệt kế' },
  { word: 'der Blutdruck', level: 'B1', topic: 'medical', pos: 'noun', meaning_vi: 'huyết áp' },
  { word: 'die Diagnose', level: 'B1', topic: 'medical', pos: 'noun', meaning_vi: 'chẩn đoán' },
  { word: 'die Behandlung', level: 'B1', topic: 'medical', pos: 'noun', meaning_vi: 'điều trị' },
  { word: 'die Nebenwirkung', level: 'B2', topic: 'medical', pos: 'noun', meaning_vi: 'tác dụng phụ' },
  { word: 'die Dosierung', level: 'B2', topic: 'medical', pos: 'noun', meaning_vi: 'liều lượng' },
  { word: 'der Wirkstoff', level: 'B2', topic: 'medical', pos: 'noun', meaning_vi: 'hoạt chất' },
  { word: 'die Indikation', level: 'C1', topic: 'medical', pos: 'noun', meaning_vi: 'chỉ định' },
  { word: 'die Kontraindikation', level: 'C1', topic: 'medical', pos: 'noun', meaning_vi: 'chống chỉ định' },
  { word: 'die Wechselwirkung', level: 'C1', topic: 'medical', pos: 'noun', meaning_vi: 'tương tác thuốc' },
  { word: 'die Arzneimittelzulassung', level: 'C2', topic: 'medical', pos: 'noun', meaning_vi: 'cấp phép thuốc' },
  { word: 'das Generikum', level: 'C2', topic: 'medical', pos: 'noun', meaning_vi: 'thuốc gốc' },
];

const outputDir = path.dirname(OUTPUT);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    ⛏️  BATCH 28 VOCABULARY GENERATED - FINAL PUSH          ║');
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
