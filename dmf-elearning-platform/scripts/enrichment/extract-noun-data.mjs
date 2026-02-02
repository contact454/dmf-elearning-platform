#!/usr/bin/env node
/**
 * Extract Artikel and Plural from Wiktionary kaikki.jsonl
 *
 * This script reads the German Wiktionary data and extracts:
 * - Artikel (der, die, das)
 * - Plural forms
 * - Gender (m, f, n)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to kaikki.jsonl (Wiktionary German data)
const KAIKKI_PATH = '/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/services/learning-service/storage/raw-data/kaikki.jsonl';
const OUTPUT_PATH = path.join(__dirname, '../data/noun-enrichment.json');

// Ensure data directory exists
const dataDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Extract gender from tags
 */
function extractGender(entry) {
  const tags = entry.head_templates?.[0]?.args || {};
  const allTags = [];

  // Collect all tags
  if (entry.senses) {
    for (const sense of entry.senses) {
      if (sense.tags) allTags.push(...sense.tags);
    }
  }

  // Check head_templates for gender
  for (const key in tags) {
    const val = tags[key];
    if (val === 'm' || val === 'masculine') return { gender: 'm', artikel: 'der' };
    if (val === 'f' || val === 'feminine') return { gender: 'f', artikel: 'die' };
    if (val === 'n' || val === 'neuter') return { gender: 'n', artikel: 'das' };
  }

  // Check in tags array
  if (allTags.includes('masculine')) return { gender: 'm', artikel: 'der' };
  if (allTags.includes('feminine')) return { gender: 'f', artikel: 'die' };
  if (allTags.includes('neuter')) return { gender: 'n', artikel: 'das' };

  return { gender: null, artikel: null };
}

/**
 * Extract plural form from forms array
 */
function extractPlural(entry) {
  if (!entry.forms) return null;

  for (const form of entry.forms) {
    if (form.tags && form.tags.includes('plural') && form.tags.includes('nominative')) {
      return form.form;
    }
  }

  // Fallback: any plural form
  for (const form of entry.forms) {
    if (form.tags && form.tags.includes('plural')) {
      return form.form;
    }
  }

  return null;
}

/**
 * Process kaikki.jsonl and extract noun data
 */
async function processKaikki() {
  console.log('🚀 Extracting Artikel and Plural from Wiktionary data\n');
  console.log('='.repeat(60));

  if (!fs.existsSync(KAIKKI_PATH)) {
    console.error('❌ kaikki.jsonl not found at:', KAIKKI_PATH);
    process.exit(1);
  }

  const nounData = {};
  let totalProcessed = 0;
  let nounsFound = 0;
  let withGender = 0;
  let withPlural = 0;

  const fileStream = fs.createReadStream(KAIKKI_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('\n📖 Reading Wiktionary data...');

  for await (const line of rl) {
    totalProcessed++;

    if (totalProcessed % 50000 === 0) {
      console.log(`   Processed ${totalProcessed} entries, found ${nounsFound} nouns...`);
    }

    try {
      const entry = JSON.parse(line);

      // Only process nouns
      if (entry.pos !== 'noun') continue;
      if (!entry.word) continue;

      nounsFound++;

      const { gender, artikel } = extractGender(entry);
      const plural = extractPlural(entry);

      // Store data
      const word = entry.word;
      if (!nounData[word]) {
        nounData[word] = {
          word: word,
          artikel: artikel,
          gender: gender,
          plural: plural
        };

        if (gender) withGender++;
        if (plural) withPlural++;
      }

    } catch (error) {
      // Skip invalid JSON lines
    }
  }

  console.log('\n📊 Extraction complete!');
  console.log(`   Total entries processed: ${totalProcessed}`);
  console.log(`   Nouns found: ${nounsFound}`);
  console.log(`   With gender: ${withGender}`);
  console.log(`   With plural: ${withPlural}`);

  // Save to file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(nounData, null, 2));
  console.log(`\n💾 Saved to: ${OUTPUT_PATH}`);

  // Show sample
  console.log('\n📝 Sample data:');
  const samples = Object.values(nounData).slice(0, 10);
  for (const s of samples) {
    console.log(`   ${s.artikel || '?'} ${s.word} (${s.gender || '?'}) → pl: ${s.plural || '?'}`);
  }

  return nounData;
}

processKaikki().catch(console.error);
