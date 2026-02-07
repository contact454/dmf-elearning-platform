#!/usr/bin/env node
/**
 * Seed Merged & Enriched Vocabulary to Database
 * Imports enriched-merged-vocabulary.json into Vocabulary table
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT_FILE = path.join(__dirname, 'data/quality-expansion/enriched-merged-vocabulary.json');

// Direct PostgreSQL connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'dmf_elearning',
  user: 'postgres',
  password: 'postgres'
});

// Map levels to unit IDs based on topic matching
const LEVEL_UNIT_MAP = {
  'A1': '60d11cbf-8f05-46c8-ad36-39b4ff465b67', // Greetings & Basic Communication
  'A2': 'fc72bb3f-44b0-4683-a31b-5617c7b9dd4a', // Food & Drinks
  'B1': '18a145f3-6d03-4349-9266-3234215748fb', // Shopping & Money
  'B2': '130201e8-cf1a-4fd3-9011-662023046f4b', // Transport & Directions
  'C1': '269ca24c-8fcf-48ba-ab2e-dd675ad2e4a1', // Health & Body Parts
  'C2': '0bf8266c-d79d-45e0-9db4-e12a4cc43347', // Home & Surroundings
};

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🌱 SEED MERGED VOCABULARY TO DATABASE                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Load enriched vocabulary
  const content = await fs.readFile(INPUT_FILE, 'utf-8');
  const vocabulary = JSON.parse(content);
  console.log(`📥 Loaded ${vocabulary.length} enriched words\n`);

  await client.connect();
  console.log('✅ Connected to PostgreSQL\n');

  // Get existing words to avoid duplicates
  const existingResult = await client.query('SELECT word FROM "Vocabulary"');
  const existingSet = new Set(existingResult.rows.map(r => r.word.toLowerCase()));
  console.log(`📊 Existing words in DB: ${existingSet.size}\n`);

  // Insert vocabulary in batches
  const BATCH_SIZE = 50;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < vocabulary.length; i += BATCH_SIZE) {
    const batch = vocabulary.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(vocabulary.length / BATCH_SIZE);

    const toInsert = batch.filter(w => !existingSet.has(w.word.toLowerCase()));
    skipped += batch.length - toInsert.length;

    if (toInsert.length === 0) {
      console.log(`[Batch ${batchNum}/${totalBatches}] Skipped ${batch.length} duplicates`);
      continue;
    }

    // Insert each word
    for (const word of toInsert) {
      const level = word.level || 'A1';
      const unitId = LEVEL_UNIT_MAP[level] || LEVEL_UNIT_MAP['A1'];

      // Build examples JSON
      const examples = [];
      if (word.example_de && word.example_vi) {
        examples.push({
          de: word.example_de,
          vi: word.example_vi
        });
      }

      try {
        await client.query(`
          INSERT INTO "Vocabulary" (id, "unitId", word, "meaningEn", "meaningVi", gender, "wordType", category, examples, "orderIndex", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        `, [
          randomUUID(),
          unitId,
          word.word,
          '', // meaningEn - we don't have this
          word.meaning_vi || '',
          word.gender || word.artikel || null,
          word.pos || null,
          level, // Store level in category field
          JSON.stringify(examples),
          inserted
        ]);

        existingSet.add(word.word.toLowerCase());
        inserted++;
      } catch (err) {
        // Skip duplicates silently
        if (!err.message.includes('duplicate')) {
          console.error(`   ⚠️ Error inserting ${word.word}: ${err.message}`);
        }
      }
    }

    console.log(`[Batch ${batchNum}/${totalBatches}] Inserted ${toInsert.length} words (Total: ${inserted})`);
  }

  // Get final count
  const countResult = await client.query('SELECT COUNT(*) FROM "Vocabulary"');
  const totalInDb = parseInt(countResult.rows[0].count);

  // Get level breakdown
  const levelResult = await client.query(`
    SELECT category as level, COUNT(*) as count
    FROM "Vocabulary"
    WHERE category IS NOT NULL
    GROUP BY category
    ORDER BY category
  `);

  await client.end();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ✅ SEEDING COMPLETE                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Summary:`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  console.log(`   Total in DB: ${totalInDb}`);
  console.log(`\n📈 By Level:`);
  for (const row of levelResult.rows) {
    console.log(`   ${row.level}: ${row.count} words`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
