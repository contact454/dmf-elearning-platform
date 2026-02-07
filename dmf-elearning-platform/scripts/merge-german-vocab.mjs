/**
 * Merge harvested vocabulary with frequency wordlist to reach 500 words
 */

import fs from 'fs/promises';
import path from 'path';

// Read base vocabulary
const basePath = path.join(process.cwd(), 'storage/raw/german_a1_base.json');
const baseData = JSON.parse(await fs.readFile(basePath, 'utf-8'));

// Read frequency list
const freqPath = '/tmp/german_freq.txt';
const freqContent = await fs.readFile(freqPath, 'utf-8');
const freqWords = freqContent.split('\n')
  .filter(line => line.trim())
  .map(line => {
    const [word, count] = line.split(/\s+/);
    return { word, frequency: parseInt(count) };
  });

// Extract existing words (normalize)
const existingWords = new Set(
  baseData.vocabulary.map(v => v.word.toLowerCase().replace(/^(der|die|das)\s+/, ''))
);

// Find new words from frequency list (filter out existing)
const TARGET_TOTAL = 500;
const needed = TARGET_TOTAL - baseData.totalWords;
console.log(`Base vocabulary: ${baseData.totalWords} words`);
console.log(`Target: ${TARGET_TOTAL} words`);
console.log(`Need to add: ${needed} words\n`);

const newWords = [];
for (const { word, frequency } of freqWords) {
  if (newWords.length >= needed) break;

  const normalized = word.toLowerCase();

  // Skip if already exists or is too short or contains non-German chars
  if (existingWords.has(normalized) ||
      word.length <= 1 ||
      /[^a-zäöüßA-ZÄÖÜ]/.test(word)) {
    continue;
  }

  // Add as basic word (type will be refined later or via AI)
  newWords.push({
    word,
    meaning_en: `[to be translated]`,
    gender: 'unknown',
    type: 'word',
    category: 'frequency',
    frequency
  });

  existingWords.add(normalized);
}

console.log(`Added ${newWords.length} new words from frequency list\n`);

// Merge vocabularies
const mergedVocab = {
  ...baseData,
  sources: [
    baseData.source,
    'hermitdave/FrequencyWords (de_50k.txt)'
  ],
  totalWords: baseData.totalWords + newWords.length,
  categoryCounts: {
    ...baseData.categoryCounts,
    frequency: newWords.length
  },
  vocabulary: [...baseData.vocabulary, ...newWords]
};

// Save merged vocabulary
const outputPath = path.join(process.cwd(), 'storage/raw/german_a1_merged.json');
await fs.writeFile(outputPath, JSON.stringify(mergedVocab, null, 2), 'utf-8');

console.log(`✅ Merged vocabulary saved to: ${outputPath}`);
console.log(`📊 Total words: ${mergedVocab.totalWords}`);
console.log(`\nCategory breakdown:`);
for (const [cat, count] of Object.entries(mergedVocab.categoryCounts)) {
  console.log(`  ${cat}: ${count}`);
}
