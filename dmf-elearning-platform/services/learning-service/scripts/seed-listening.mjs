#!/usr/bin/env node

/**
 * Seed Script for Listening Module Phase 1
 * 
 * Populates the database with 70 listening exercises
 * across difficulty levels A1-C2 and all exercise types.
 * 
 * Usage: node scripts/seed-listening.mjs
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Listening Module seed...\n');

  // Load seed data
  const seedDataPath = path.join(__dirname, '../data/listening-seed.json');
  const seedData = JSON.parse(await fs.readFile(seedDataPath, 'utf-8'));

  console.log(`📊 Found ${seedData.exercises.length} exercises to seed\n`);

  // Statistics
  const stats = {
    total: seedData.exercises.length,
    byDifficulty: {},
    byType: {},
    created: 0,
    skipped: 0,
    errors: 0
  };

  // Seed exercises
  for (const [index, exercise] of seedData.exercises.entries()) {
    try {
      const existingExercise = await prisma.listeningExercise.findFirst({
        where: {
          title: exercise.title,
          transcript: exercise.transcript
        }
      });

      if (existingExercise) {
        console.log(`⏭️  [${index + 1}/${stats.total}] Skipping: "${exercise.title}" (already exists)`);
        stats.skipped++;
        continue;
      }

      await prisma.listeningExercise.create({
        data: {
          title: exercise.title,
          difficulty: exercise.difficulty,
          audioUrl: exercise.audio_url,
          transcript: exercise.transcript,
          translation: exercise.translation,
          durationSeconds: exercise.duration_seconds,
          exerciseType: exercise.exercise_type,
          exerciseData: exercise.exercise_data
        }
      });

      console.log(`✅ [${index + 1}/${stats.total}] Created: "${exercise.title}" (${exercise.exercise_type}, difficulty ${exercise.difficulty})`);
      stats.created++;

      // Track statistics
      stats.byDifficulty[exercise.difficulty] = (stats.byDifficulty[exercise.difficulty] || 0) + 1;
      stats.byType[exercise.exercise_type] = (stats.byType[exercise.exercise_type] || 0) + 1;

    } catch (error) {
      console.error(`❌ [${index + 1}/${stats.total}] Error creating "${exercise.title}":`, error.message);
      stats.errors++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEED SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total exercises in seed file: ${stats.total}`);
  console.log(`✅ Successfully created: ${stats.created}`);
  console.log(`⏭️  Skipped (duplicates): ${stats.skipped}`);
  console.log(`❌ Errors: ${stats.errors}`);
  
  console.log('\n📈 Breakdown by Difficulty:');
  Object.entries(stats.byDifficulty)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([difficulty, count]) => {
      const level = getDifficultyLabel(parseInt(difficulty));
      console.log(`  ${level} (difficulty ${difficulty}): ${count} exercises`);
    });
  
  console.log('\n🎯 Breakdown by Exercise Type:');
  Object.entries(stats.byType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} exercises`);
    });
  
  console.log('\n' + '='.repeat(60));
  
  if (stats.errors === 0 && stats.created > 0) {
    console.log('🎉 Seed completed successfully!\n');
  } else if (stats.errors > 0) {
    console.log('⚠️  Seed completed with errors. Please check the logs above.\n');
    process.exit(1);
  } else {
    console.log('ℹ️  No new exercises were created (all already exist).\n');
  }
}

function getDifficultyLabel(difficulty) {
  if (difficulty <= 2) return 'A1';
  if (difficulty <= 4) return 'A2';
  if (difficulty <= 6) return 'B1';
  if (difficulty <= 8) return 'B2';
  if (difficulty === 9) return 'C1';
  if (difficulty === 10) return 'C2';
  return 'Unknown';
}

main()
  .catch((error) => {
    console.error('💥 Fatal error during seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
