#!/usr/bin/env node
/**
 * 🔀 FINAL MERGE - All Enriched Vocabulary
 *
 * Combines:
 * 1. enriched-merged-vocabulary.json (2,794 words)
 * 2. enriched-ai-approved.json (1,170 words)
 *
 * Deduplicates and creates final vocabulary ready for seeding
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCES = {
  enrichedMerged: path.join(__dirname, '../data/quality-expansion/enriched-merged-vocabulary.json'),
  enrichedAIApproved: path.join(__dirname, '../data/quality-expansion/enriched-ai-approved.json'),
};

const OUTPUT_FILE = path.join(__dirname, '../data/quality-expansion/final-vocabulary.json');
const STATS_FILE = path.join(__dirname, '../data/quality-expansion/final-stats.json');

async function finalMerge() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🔀 FINAL MERGE - ALL ENRICHED VOCABULARY                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const sources = {};
  const merged = new Map();

  // Load each source
  for (const [name, filePath] of Object.entries(SOURCES)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const words = JSON.parse(content);
      sources[name] = words;
      console.log(`📥 Loaded ${words.length} words from ${name}`);

      // Add to merged map (prefer words with examples)
      for (const word of words) {
        const key = word.word.toLowerCase();
        const existing = merged.get(key);

        if (!existing) {
          merged.set(key, { ...word, source: name });
        } else if (!existing.example_de && word.example_de) {
          // Replace if new has examples and existing doesn't
          merged.set(key, { ...word, source: name });
        }
      }
    } catch (err) {
      console.log(`⚠️  Skipped ${name}: ${err.message}`);
      sources[name] = [];
    }
  }

  console.log('\n📊 Merge Results:');
  console.log(`   Total unique words: ${merged.size}`);

  // Convert to array and sort by level then word
  const levelOrder = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  const mergedArray = Array.from(merged.values()).sort((a, b) => {
    const levelDiff = (levelOrder[a.level] || 7) - (levelOrder[b.level] || 7);
    if (levelDiff !== 0) return levelDiff;
    return a.word.localeCompare(b.word, 'de');
  });

  // Distribution by level
  const distribution = {};
  const withExamples = { count: 0 };

  for (const word of mergedArray) {
    const level = word.level || 'unknown';
    distribution[level] = (distribution[level] || 0) + 1;

    if (word.example_de && word.example_de.length > 0) {
      withExamples.count++;
    }
  }

  console.log('\n📈 Distribution by Level:');
  const targetDistribution = { A1: 1500, A2: 2500, B1: 3000, B2: 2000, C1: 800, C2: 200 };
  Object.entries(distribution)
    .sort(([a], [b]) => (levelOrder[a] || 7) - (levelOrder[b] || 7))
    .forEach(([level, count]) => {
      const target = targetDistribution[level] || 0;
      const pct = target > 0 ? Math.round((count / target) * 100) : 0;
      console.log(`   ${level}: ${count} words (${pct}% of target ${target})`);
    });

  console.log(`\n📝 Words with examples: ${withExamples.count}/${merged.size} (${Math.round(withExamples.count / merged.size * 100)}%)`);

  // Clean up internal fields before saving
  const cleanedArray = mergedArray.map(w => {
    const { _quality, source, ...clean } = w;
    return clean;
  });

  // Save final vocabulary
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedArray, null, 2));
  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);

  // Save stats
  fs.writeFileSync(STATS_FILE, JSON.stringify({
    timestamp: new Date().toISOString(),
    sources: Object.fromEntries(
      Object.entries(sources).map(([name, words]) => [name, words.length])
    ),
    final: {
      total: merged.size,
      withExamples: withExamples.count,
      distribution,
      targetDistribution,
    },
  }, null, 2));
  console.log(`💾 Stats saved to: ${STATS_FILE}`);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ✅ FINAL MERGE COMPLETE                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📌 Total quality vocabulary: ${merged.size} words`);
  console.log(`   Gap from 10,000 target: ${10000 - merged.size} words`);
  console.log(`\n📌 Next: node scripts/seed-final-vocabulary.mjs`);
}

finalMerge().catch(console.error);
