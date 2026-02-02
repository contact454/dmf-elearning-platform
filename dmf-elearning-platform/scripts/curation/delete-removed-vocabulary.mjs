#!/usr/bin/env node
/**
 * Vocabulary Curation Pipeline - Delete Removed Vocabulary
 *
 * Deletes vocabulary marked for removal from the database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/curation/final');

// Learning Service API
const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:3003';

// Batch size for deletion
const BATCH_SIZE = 100;

/**
 * Delete vocabulary batch using API
 */
async function deleteBatch(ids) {
  try {
    const response = await fetch(`${LEARNING_SERVICE_URL}/api/vocabulary/delete-many`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.deleted || 0;
    }
    return 0;
  } catch (error) {
    console.error('Delete error:', error.message);
    return 0;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Database Cleanup\n');
  console.log('='.repeat(60));

  // 1. Load vocabulary IDs
  const idsPath = path.join(DATA_DIR, 'vocabulary-ids.json');
  if (!fs.existsSync(idsPath)) {
    console.error('❌ Vocabulary IDs not found. Run apply-curation.mjs first.');
    process.exit(1);
  }

  const { removeIds } = JSON.parse(fs.readFileSync(idsPath, 'utf-8'));
  console.log(`\n📥 Loaded ${removeIds.length} vocabulary IDs to delete`);

  // 2. Get current stats
  console.log('\n📊 Current database status:');
  try {
    const response = await fetch(`${LEARNING_SERVICE_URL}/api/vocabulary/stats`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   Total vocabulary: ${data.data.total}`);
    }
  } catch (error) {
    console.log('   Could not fetch stats');
  }

  // 3. Delete in batches
  console.log('\n🗑️  Deleting vocabulary in batches...');

  let totalDeleted = 0;
  const totalBatches = Math.ceil(removeIds.length / BATCH_SIZE);

  for (let i = 0; i < removeIds.length; i += BATCH_SIZE) {
    const batch = removeIds.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    const deleted = await deleteBatch(batch);
    totalDeleted += deleted;

    // Progress
    const progress = Math.round((i + batch.length) / removeIds.length * 100);
    console.log(`   Batch ${batchNum}/${totalBatches}: ${deleted} deleted (${progress}% complete)`);
  }

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 DELETION SUMMARY');
  console.log('='.repeat(60));
  console.log(`   ✅ Total deleted: ${totalDeleted}`);
  console.log(`   📊 Expected: ${removeIds.length}`);

  // 5. Verify remaining count
  console.log('\n📊 Verifying database after cleanup:');
  try {
    const response = await fetch(`${LEARNING_SERVICE_URL}/api/vocabulary/stats`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   Remaining vocabulary: ${data.data.total}`);
      console.log('\n   By Level:');
      for (const level of data.data.byLevel) {
        console.log(`   ${level.level}: ${level.count}`);
      }
    }
  } catch (error) {
    console.log('   Could not verify database count');
  }

  console.log('\n✅ Database cleanup complete!');
}

main().catch(console.error);
