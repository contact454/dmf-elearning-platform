#!/usr/bin/env node
/**
 * 🔀 MERGE ALL QUALITY VOCABULARY SOURCES
 *
 * Combines:
 * 1. Already curated vocabulary
 * 2. Quality-first selected (KEEP tier)
 * 3. AI-approved from REVIEW tier
 *
 * Deduplicates and prepares for enrichment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCES = {
  curated: path.join(__dirname, '../data/curation/final/curated-vocabulary.json'),
  qualitySelected: path.join(__dirname, '../data/quality-expansion/selected-high-quality.json'),
  aiApproved: path.join(__dirname, '../data/quality-expansion/ai-approved.json'),
  aiApprovedPhase2: path.join(__dirname, '../data/quality-expansion/ai-approved-phase2.json'),
};

const OUTPUT_FILE = path.join(__dirname, '../data/quality-expansion/merged-vocabulary.json');
const STATS_FILE = path.join(__dirname, '../data/quality-expansion/merge-stats.json');

async function mergeVocabulary() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🔀 MERGE ALL QUALITY VOCABULARY SOURCES                 ║');
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

      // Add to merged map (dedup by word)
      for (const word of words) {
        const key = word.word.toLowerCase();
        if (!merged.has(key)) {
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
  const sourceBreakdown = {};

  for (const word of mergedArray) {
    const level = word.level || 'unknown';
    distribution[level] = (distribution[level] || 0) + 1;

    const source = word.source || 'unknown';
    sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
  }

  console.log('\n📈 Distribution by Level:');
  Object.entries(distribution)
    .sort(([a], [b]) => (levelOrder[a] || 7) - (levelOrder[b] || 7))
    .forEach(([level, count]) => {
      console.log(`   ${level}: ${count} words`);
    });

  console.log('\n📦 Source Breakdown:');
  Object.entries(sourceBreakdown).forEach(([source, count]) => {
    console.log(`   ${source}: ${count} words`);
  });

  // Save merged vocabulary
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedArray, null, 2));
  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);

  // Save stats
  fs.writeFileSync(STATS_FILE, JSON.stringify({
    timestamp: new Date().toISOString(),
    sources: Object.fromEntries(
      Object.entries(sources).map(([name, words]) => [name, words.length])
    ),
    merged: {
      total: merged.size,
      distribution,
      sourceBreakdown,
    },
  }, null, 2));
  console.log(`💾 Stats saved to: ${STATS_FILE}`);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ✅ MERGE COMPLETE                                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📌 Next Steps:`);
  console.log(`   1. Run enrichment: node scripts/enrichment/enrich-merged-vocabulary.mjs`);
  console.log(`   2. Seed to database: node scripts/seed-merged-vocabulary.mjs`);
}

mergeVocabulary().catch(console.error);
