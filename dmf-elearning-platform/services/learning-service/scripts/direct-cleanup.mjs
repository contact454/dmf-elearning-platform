#!/usr/bin/env node
/**
 * Direct database cleanup using Prisma
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Absolute path to curation data
const DATA_DIR = '/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/scripts/data/curation/final';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Direct Database Cleanup\n');
  console.log('='.repeat(60));

  // 1. Load vocabulary IDs
  const idsPath = path.join(DATA_DIR, 'vocabulary-ids.json');
  if (!fs.existsSync(idsPath)) {
    console.error('❌ Vocabulary IDs not found.');
    process.exit(1);
  }

  const { removeIds } = JSON.parse(fs.readFileSync(idsPath, 'utf-8'));
  console.log(`\n📥 Loaded ${removeIds.length} vocabulary IDs to delete`);

  // 2. Get current stats
  const beforeCount = await prisma.vocabulary.count();
  console.log(`\n📊 Current vocabulary count: ${beforeCount}`);

  // 3. Delete in batches
  console.log('\n🗑️  Deleting vocabulary...');

  const BATCH_SIZE = 500;
  let totalDeleted = 0;
  const totalBatches = Math.ceil(removeIds.length / BATCH_SIZE);

  for (let i = 0; i < removeIds.length; i += BATCH_SIZE) {
    const batch = removeIds.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    try {
      const result = await prisma.vocabulary.deleteMany({
        where: { id: { in: batch } }
      });
      totalDeleted += result.count;

      const progress = Math.round((i + batch.length) / removeIds.length * 100);
      console.log(`   Batch ${batchNum}/${totalBatches}: ${result.count} deleted (${progress}% complete)`);
    } catch (error) {
      console.log(`   Batch ${batchNum}/${totalBatches}: Error - ${error.message}`);
    }
  }

  // 4. Summary
  const afterCount = await prisma.vocabulary.count();

  console.log('\n' + '='.repeat(60));
  console.log('📋 DELETION SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Before: ${beforeCount} vocabulary`);
  console.log(`   Deleted: ${totalDeleted}`);
  console.log(`   After: ${afterCount} vocabulary`);

  // 5. Show remaining by level
  const byLevel = await prisma.vocabulary.groupBy({
    by: ['level'],
    _count: true,
    orderBy: { level: 'asc' }
  });

  console.log('\n📈 Remaining by Level:');
  for (const level of byLevel) {
    console.log(`   ${level.level}: ${level._count}`);
  }

  console.log('\n✅ Database cleanup complete!');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
