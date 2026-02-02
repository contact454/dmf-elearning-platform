#!/usr/bin/env tsx
/**
 * 💾 Vocabulary Database Seeder
 * Imports JSON data from resource-hub into PostgreSQL via Prisma
 * Updated to match new simplified schema
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// ============================================================================
// CONFIGURATION
// ============================================================================

const RESOURCE_PATHS = {
  A1_DIR: path.resolve(__dirname, '../storage/resource-hub/A1'),
  MINED_DATA: path.resolve(__dirname, '../storage/resource-hub/mined_data.json'),
};

// ============================================================================
// TYPES
// ============================================================================

interface VocabEntry {
  word: string;
  meaning_vi: string;
  pos?: string;
  level?: string;
  topic?: string;
  example_de?: string;
  example_vi?: string;
}

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Load all JSON files from A1 directory
 */
async function loadA1Data(): Promise<VocabEntry[]> {
  const allWords: VocabEntry[] = [];

  try {
    const files = await fs.readdir(RESOURCE_PATHS.A1_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    console.log(`📁 Found ${jsonFiles.length} files in A1 directory`);

    for (const file of jsonFiles) {
      const filepath = path.join(RESOURCE_PATHS.A1_DIR, file);
      const content = await fs.readFile(filepath, 'utf-8');
      const words: VocabEntry[] = JSON.parse(content);

      allWords.push(...words);
      console.log(`   ✅ Loaded ${file}: ${words.length} words`);
    }

    console.log(`📊 Total A1 words: ${allWords.length}\n`);
  } catch (error: any) {
    console.log(`⚠️  A1 directory not found or empty. Skipping...\n`);
  }

  return allWords;
}

/**
 * Load mined data
 */
async function loadMinedData(): Promise<VocabEntry[]> {
  try {
    const content = await fs.readFile(RESOURCE_PATHS.MINED_DATA, 'utf-8');
    const words: VocabEntry[] = JSON.parse(content);

    console.log(`📁 Loaded mined_data.json: ${words.length} words\n`);
    return words;
  } catch (error: any) {
    console.log(`⚠️  mined_data.json not found. Skipping...\n`);
    return [];
  }
}

// ============================================================================
// DATABASE SEEDING
// ============================================================================

/**
 * Normalize vocabulary entry for database
 * Maps JSON fields to Prisma schema fields
 */
function normalizeEntry(entry: VocabEntry) {
  return {
    word: entry.word.trim(),
    meaning_vi: entry.meaning_vi,
    level: entry.level || 'A1',
    topic: entry.topic || null,
    example_de: entry.example_de || null,
    example_vi: entry.example_vi || null,
    pos: entry.pos || 'noun',
  };
}

/**
 * Seed vocabulary into database
 */
async function seedVocabulary(words: VocabEntry[]) {
  console.log('💾 Starting database seeding...\n');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < words.length; i++) {
    const entry = words[i];

    try {
      const normalized = normalizeEntry(entry);

      // Skip if word is empty
      if (!normalized.word) {
        skipped++;
        continue;
      }

      await prisma.vocabulary.upsert({
        where: { word: normalized.word },
        create: normalized,
        update: {
          meaning_vi: normalized.meaning_vi,
          level: normalized.level,
          topic: normalized.topic,
          example_de: normalized.example_de,
          example_vi: normalized.example_vi,
          pos: normalized.pos,
        },
      });

      created++;

      // Log progress every 50 words
      if ((i + 1) % 50 === 0) {
        console.log(`   ⏳ Progress: ${i + 1}/${words.length} words processed...`);
      }
    } catch (error: any) {
      errors++;
      if (errors <= 5) {
        console.error(`   ❌ Error seeding "${entry.word}": ${error.message}`);
      }
    }
  }

  return { created, updated, skipped, errors };
}

// ============================================================================
// MAIN SEEDER
// ============================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     💾 VOCABULARY DATABASE SEEDER                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // Load all data sources
    console.log('📖 Loading data sources...\n');

    const a1Words = await loadA1Data();
    const minedWords = await loadMinedData();

    // Combine all words
    const allWords = [...a1Words, ...minedWords];

    if (allWords.length === 0) {
      console.log('❌ No words found to seed. Exiting...\n');
      return;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total words to seed: ${allWords.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Statistics before seeding
    const beforeCount = await prisma.vocabulary.count();
    console.log(`📊 Current vocabulary count: ${beforeCount}\n`);

    // Seed database
    const startTime = Date.now();
    const stats = await seedVocabulary(allWords);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Print results
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ SEEDING COMPLETED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Created:  ${stats.created} new words`);
    console.log(`🔄 Updated:  ${stats.updated} existing words`);
    console.log(`⏭️  Skipped:  ${stats.skipped} words`);
    console.log(`❌ Errors:   ${stats.errors} failed`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Statistics after seeding
    const afterCount = await prisma.vocabulary.count();
    console.log(`📊 Final vocabulary count: ${afterCount} (+ ${afterCount - beforeCount})\n`);

    // Level breakdown
    const levelStats = await prisma.vocabulary.groupBy({
      by: ['level'],
      _count: true,
    });

    console.log('📊 Vocabulary by level:');
    levelStats.sort((a, b) => a.level.localeCompare(b.level)).forEach(stat => {
      console.log(`   ${stat.level}: ${stat._count} words`);
    });

    console.log('\n✅ Seeding successful!\n');
  } catch (error: any) {
    console.error('\n💥 FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// RUN
// ============================================================================

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
