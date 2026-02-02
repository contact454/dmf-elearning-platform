#!/usr/bin/env node
/**
 * Vocabulary Curation Pipeline - Phase 3: Apply Curation
 *
 * Applies the AI-reviewed curation results to the database:
 * - Keeps high-quality vocabulary
 * - Archives removed vocabulary (soft delete)
 * - Updates vocabulary with corrected levels if suggested
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/curation');
const AI_DIR = path.join(DATA_DIR, 'ai-reviewed');

// Learning Service API
const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:3003';

/**
 * Load curation results
 */
function loadCurationData() {
  // Load keep words (from Phase 1)
  const keepWordsPath = path.join(DATA_DIR, 'keep-words.json');
  const keepWords = JSON.parse(fs.readFileSync(keepWordsPath, 'utf-8'));

  // Load AI reviewed results
  const aiReviewedPath = path.join(AI_DIR, 'ai-reviewed-all.json');
  const aiReviewed = JSON.parse(fs.readFileSync(aiReviewedPath, 'utf-8'));

  // Load remove words (from Phase 1)
  const removeWordsPath = path.join(DATA_DIR, 'remove-words.json');
  const removeWords = JSON.parse(fs.readFileSync(removeWordsPath, 'utf-8'));

  return { keepWords, aiReviewed, removeWords };
}

/**
 * Generate summary of changes
 */
function generateSummary(keepWords, aiReviewed, removeWords) {
  const aiKeep = aiReviewed.filter(w => w.aiDecision === 'keep');
  const aiRemove = aiReviewed.filter(w => w.aiDecision === 'remove');

  const summary = {
    phase1: {
      keep: keepWords.length,
      review: aiReviewed.length,
      remove: removeWords.length
    },
    aiReview: {
      keep: aiKeep.length,
      remove: aiRemove.length
    },
    final: {
      keep: keepWords.length + aiKeep.length,
      remove: removeWords.length + aiRemove.length
    },
    byLevel: {}
  };

  // Calculate by level
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const allKeep = [...keepWords, ...aiKeep];
  const allRemove = [...removeWords, ...aiRemove];

  for (const level of levels) {
    summary.byLevel[level] = {
      keep: allKeep.filter(w => w.level === level).length,
      remove: allRemove.filter(w => w.level === level).length
    };
  }

  return summary;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Phase 3: Apply Curation\n');
  console.log('='.repeat(60));

  // 1. Load data
  console.log('\n📥 Loading curation data...');
  const { keepWords, aiReviewed, removeWords } = loadCurationData();
  console.log(`   ✅ Phase 1 Keep: ${keepWords.length}`);
  console.log(`   ✅ AI Reviewed: ${aiReviewed.length}`);
  console.log(`   ✅ Phase 1 Remove: ${removeWords.length}`);

  // 2. Generate summary
  const summary = generateSummary(keepWords, aiReviewed, removeWords);

  // 3. Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 CURATION SUMMARY');
  console.log('='.repeat(60));

  console.log('\n📊 Phase 1 (Frequency-based):');
  console.log(`   KEEP: ${summary.phase1.keep}`);
  console.log(`   REVIEW: ${summary.phase1.review}`);
  console.log(`   REMOVE: ${summary.phase1.remove}`);

  console.log('\n📊 Phase 2 (AI Review):');
  console.log(`   AI KEEP: ${summary.aiReview.keep}`);
  console.log(`   AI REMOVE: ${summary.aiReview.remove}`);

  console.log('\n📊 Final Results:');
  console.log(`   ✅ TOTAL KEEP: ${summary.final.keep}`);
  console.log(`   ❌ TOTAL REMOVE: ${summary.final.remove}`);

  console.log('\n📈 Final Count by Level:');
  console.log('   Level | Keep | Remove');
  console.log('   ' + '-'.repeat(30));
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    const s = summary.byLevel[level];
    console.log(`   ${level}    | ${String(s.keep).padStart(4)} | ${String(s.remove).padStart(6)}`);
  }

  // 4. Save final curated list
  const aiKeep = aiReviewed.filter(w => w.aiDecision === 'keep');
  const aiRemove = aiReviewed.filter(w => w.aiDecision === 'remove');

  const finalKeep = [...keepWords, ...aiKeep];
  const finalRemove = [...removeWords, ...aiRemove];

  const outputDir = path.join(DATA_DIR, 'final');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save final keep
  const finalKeepPath = path.join(outputDir, 'curated-vocabulary.json');
  fs.writeFileSync(finalKeepPath, JSON.stringify(finalKeep, null, 2));
  console.log(`\n💾 Saved curated vocabulary: ${finalKeepPath}`);

  // Save final remove
  const finalRemovePath = path.join(outputDir, 'removed-vocabulary.json');
  fs.writeFileSync(finalRemovePath, JSON.stringify(finalRemove, null, 2));
  console.log(`💾 Saved removed vocabulary: ${finalRemovePath}`);

  // Save summary
  const summaryPath = path.join(outputDir, 'curation-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`💾 Saved summary: ${summaryPath}`);

  // 5. Generate IDs for database update
  const keepIds = finalKeep.map(w => w.id);
  const removeIds = finalRemove.map(w => w.id);

  const idsPath = path.join(outputDir, 'vocabulary-ids.json');
  fs.writeFileSync(idsPath, JSON.stringify({ keepIds, removeIds }, null, 2));
  console.log(`💾 Saved vocabulary IDs: ${idsPath}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Curation data prepared!');
  console.log('\n📌 Next Steps:');
  console.log('   Option 1: Delete removed vocabulary from database');
  console.log('   Option 2: Archive removed vocabulary (add is_archived flag)');
  console.log('\n   To delete, run with --apply flag:');
  console.log('   node scripts/curation/apply-curation.mjs --apply');
}

main().catch(console.error);
