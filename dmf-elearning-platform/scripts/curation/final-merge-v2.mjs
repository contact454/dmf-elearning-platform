#!/usr/bin/env node
/**
 * 🔀 FINAL MERGE V2 - All Vocabulary Sources
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCES = {
  final: path.join(__dirname, '../data/quality-expansion/final-vocabulary.json'),
  enrichedRecovered: path.join(__dirname, '../data/quality-expansion/enriched-recovered.json'),
  enrichedAdditional: path.join(__dirname, '../data/quality-expansion/enriched-additional.json'),
  enrichedMore: path.join(__dirname, '../data/quality-expansion/enriched-more.json'),
  enrichedBatch2: path.join(__dirname, '../data/quality-expansion/enriched-batch2.json'),
  enrichedBatch3: path.join(__dirname, '../data/quality-expansion/enriched-batch3.json'),
  enrichedBatch4: path.join(__dirname, '../data/quality-expansion/enriched-batch4.json'),
  enrichedBatch5: path.join(__dirname, '../data/quality-expansion/enriched-batch5.json'),
  enrichedBatch6: path.join(__dirname, '../data/quality-expansion/enriched-batch6.json'),
  enrichedBatch7: path.join(__dirname, '../data/quality-expansion/enriched-batch7.json'),
  enrichedBatch8: path.join(__dirname, '../data/quality-expansion/enriched-batch8.json'),
  enrichedBatch9: path.join(__dirname, '../data/quality-expansion/enriched-batch9.json'),
  enrichedBatch10: path.join(__dirname, '../data/quality-expansion/enriched-batch10.json'),
  enrichedBatch11: path.join(__dirname, '../data/quality-expansion/enriched-batch11.json'),
  enrichedBatch12: path.join(__dirname, '../data/quality-expansion/enriched-batch12.json'),
  enrichedBatch13: path.join(__dirname, '../data/quality-expansion/enriched-batch13.json'),
  enrichedBatch14: path.join(__dirname, '../data/quality-expansion/enriched-batch14.json'),
  enrichedBatch15: path.join(__dirname, '../data/quality-expansion/enriched-batch15.json'),
  enrichedBatch16: path.join(__dirname, '../data/quality-expansion/enriched-batch16.json'),
  enrichedBatch17: path.join(__dirname, '../data/quality-expansion/enriched-batch17.json'),
  enrichedBatch18: path.join(__dirname, '../data/quality-expansion/enriched-batch18.json'),
  enrichedBatch19: path.join(__dirname, '../data/quality-expansion/enriched-batch19.json'),
  enrichedBatch20: path.join(__dirname, '../data/quality-expansion/enriched-batch20.json'),
  enrichedBatch21: path.join(__dirname, '../data/quality-expansion/enriched-batch21.json'),
  enrichedBatch22: path.join(__dirname, '../data/quality-expansion/enriched-batch22.json'),
  enrichedBatch23: path.join(__dirname, '../data/quality-expansion/enriched-batch23.json'),
  enrichedBatch24: path.join(__dirname, '../data/quality-expansion/enriched-batch24.json'),
  enrichedBatch25: path.join(__dirname, '../data/quality-expansion/enriched-batch25.json'),
  enrichedBatch26: path.join(__dirname, '../data/quality-expansion/enriched-batch26.json'),
  enrichedBatch27: path.join(__dirname, '../data/quality-expansion/enriched-batch27.json'),
  enrichedBatch28: path.join(__dirname, '../data/quality-expansion/enriched-batch28.json'),
  enrichedBatch29: path.join(__dirname, '../data/quality-expansion/enriched-batch29.json'),
};

const OUTPUT_FILE = path.join(__dirname, '../data/quality-expansion/final-vocabulary-v2.json');

async function finalMergeV2() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🔀 FINAL MERGE V2 - EXPAND TO 10K                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const merged = new Map();

  for (const [name, filePath] of Object.entries(SOURCES)) {
    try {
      const words = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`📥 Loaded ${words.length} words from ${name}`);

      for (const word of words) {
        const key = word.word.toLowerCase();
        const existing = merged.get(key);

        if (!existing) {
          merged.set(key, { ...word, source: name });
        } else if (!existing.example_de && word.example_de) {
          merged.set(key, { ...word, source: name });
        }
      }
    } catch (err) {
      console.log(`⚠️  Skipped ${name}: ${err.message}`);
    }
  }

  console.log(`\n📊 Total unique words: ${merged.size}`);

  // Sort by level then word
  const levelOrder = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  const mergedArray = Array.from(merged.values()).sort((a, b) => {
    const levelDiff = (levelOrder[a.level] || 7) - (levelOrder[b.level] || 7);
    if (levelDiff !== 0) return levelDiff;
    return a.word.localeCompare(b.word, 'de');
  });

  // Distribution
  const distribution = {};
  let withExamples = 0;

  for (const word of mergedArray) {
    distribution[word.level || 'unknown'] = (distribution[word.level] || 0) + 1;
    if (word.example_de) withExamples++;
  }

  console.log('\n📈 Distribution by Level:');
  Object.entries(distribution).sort().forEach(([level, count]) => {
    console.log(`   ${level}: ${count} words`);
  });

  console.log(`\n📝 With examples: ${withExamples}/${merged.size}`);

  // Clean and save
  const cleanedArray = mergedArray.map(w => {
    const { _quality, _recovery, source, ...clean } = w;
    return clean;
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedArray, null, 2));
  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
  console.log(`📌 Total: ${cleanedArray.length} quality words`);
}

finalMergeV2().catch(console.error);
