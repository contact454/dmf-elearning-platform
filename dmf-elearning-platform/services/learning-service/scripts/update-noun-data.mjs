#!/usr/bin/env node
/**
 * Update Database with Artikel and Plural data
 *
 * Matches nouns in database with extracted Wiktionary data
 * and updates artikel, plural, gender fields
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOUN_DATA_PATH = '/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/scripts/data/noun-enrichment.json';

const prisma = new PrismaClient();

/**
 * Load noun enrichment data
 */
function loadNounData() {
  if (!fs.existsSync(NOUN_DATA_PATH)) {
    console.error('❌ Noun data not found. Run extract-noun-data.mjs first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(NOUN_DATA_PATH, 'utf-8'));
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Updating Database with Artikel & Plural\n');
  console.log('='.repeat(60));

  // 1. Load noun data
  console.log('\n📥 Loading noun enrichment data...');
  const nounData = loadNounData();
  console.log(`   ✅ Loaded ${Object.keys(nounData).length} nouns`);

  // 2. Get all nouns from database
  console.log('\n📖 Fetching nouns from database...');
  const dbNouns = await prisma.vocabulary.findMany({
    where: { pos: 'noun' },
    select: { id: true, word: true, artikel: true, plural: true, gender: true }
  });
  console.log(`   ✅ Found ${dbNouns.length} nouns in database`);

  // 3. Match and update
  console.log('\n🔄 Matching and updating...');

  let matched = 0;
  let updated = 0;
  let withArtikel = 0;
  let withPlural = 0;
  let notFound = [];

  const BATCH_SIZE = 100;

  for (let i = 0; i < dbNouns.length; i += BATCH_SIZE) {
    const batch = dbNouns.slice(i, i + BATCH_SIZE);
    const updates = [];

    for (const noun of batch) {
      const word = noun.word;

      // Try to find in noun data
      let enrichment = nounData[word];

      // If not found, try without article prefix
      if (!enrichment) {
        // Remove common article prefixes
        const cleanWord = word
          .replace(/^der\s+/i, '')
          .replace(/^die\s+/i, '')
          .replace(/^das\s+/i, '');
        enrichment = nounData[cleanWord];
      }

      if (enrichment) {
        matched++;

        // Only update if we have new data
        if (enrichment.artikel || enrichment.plural || enrichment.gender) {
          updates.push({
            id: noun.id,
            artikel: enrichment.artikel || null,
            plural: enrichment.plural || null,
            gender: enrichment.gender || null
          });

          if (enrichment.artikel) withArtikel++;
          if (enrichment.plural) withPlural++;
        }
      } else {
        notFound.push(word);
      }
    }

    // Batch update
    for (const update of updates) {
      try {
        await prisma.vocabulary.update({
          where: { id: update.id },
          data: {
            artikel: update.artikel,
            plural: update.plural,
            gender: update.gender
          }
        });
        updated++;
      } catch (error) {
        console.log(`   ❌ Error updating ${update.id}`);
      }
    }

    // Progress
    const progress = Math.round((i + batch.length) / dbNouns.length * 100);
    process.stdout.write(`   Progress: ${progress}% (${matched} matched, ${updated} updated)\r`);
  }

  console.log('\n');

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 UPDATE SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Total nouns: ${dbNouns.length}`);
  console.log(`   Matched: ${matched}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   With Artikel: ${withArtikel}`);
  console.log(`   With Plural: ${withPlural}`);
  console.log(`   Not found: ${notFound.length}`);

  // Show nouns not found (for AI enrichment later)
  if (notFound.length > 0) {
    const notFoundPath = path.join(__dirname, '../data/nouns-need-ai.json');
    fs.writeFileSync(notFoundPath, JSON.stringify(notFound, null, 2));
    console.log(`\n💾 Nouns needing AI enrichment saved to: ${notFoundPath}`);

    console.log('\n📝 Sample nouns not found:');
    const samples = notFound.slice(0, 10);
    for (const s of samples) {
      console.log(`   - ${s}`);
    }
  }

  // 5. Verify
  console.log('\n📊 Verifying database...');
  const withArtikelCount = await prisma.vocabulary.count({
    where: { pos: 'noun', artikel: { not: null } }
  });
  const withPluralCount = await prisma.vocabulary.count({
    where: { pos: 'noun', plural: { not: null } }
  });
  console.log(`   Nouns with artikel: ${withArtikelCount}`);
  console.log(`   Nouns with plural: ${withPluralCount}`);

  console.log('\n✅ Database update complete!');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
