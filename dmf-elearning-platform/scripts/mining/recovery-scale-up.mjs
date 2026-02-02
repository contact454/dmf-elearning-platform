#!/usr/bin/env node
/**
 * 🚀 RECOVERY & SCALE-UP COMMANDER
 *
 * Nhiệm vụ:
 * 1. RECOVER: Khôi phục 50% từ nhóm REMOVE (trừ rác rõ ràng) → REVIEW
 * 2. TARGET-DRIVEN MINING: Tự động đào tiếp từ kaikki.jsonl nếu chưa đủ 15,000 từ
 *
 * Chiến lược "Bảo toàn quân số":
 * - Không loại bỏ ồ ạt, giữ lại từ có tiềm năng
 * - Chỉ loại bỏ rác rõ ràng (lỗi chính tả, từ lạ, số điểm = 0)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually (avoid dependency on dotenv package)
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../../.env.local'),
    path.join(__dirname, '../../../.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
          }
        }
      }
      console.log(`   📄 Loaded env from: ${path.basename(envPath)}`);
      break;
    }
  }
}

loadEnv();

// Dynamic import Anthropic (only if API key exists)
let anthropic = null;
let MODEL_NAME = 'claude-sonnet-4-5';

async function initAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('   ⚠️  ANTHROPIC_API_KEY not found - Mining phase will be skipped');
    return false;
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const config = { apiKey: process.env.ANTHROPIC_API_KEY };
    if (process.env.ANTHROPIC_BASE_URL) {
      config.baseURL = process.env.ANTHROPIC_BASE_URL;
    }
    anthropic = new Anthropic(config);
    MODEL_NAME = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
    return true;
  } catch (error) {
    console.log(`   ⚠️  Failed to load Anthropic SDK: ${error.message}`);
    return false;
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Target words
  TARGET_WORDS: 15000,

  // Data paths
  CURATED_PATH: path.join(__dirname, '../data/curation/final/curated-vocabulary.json'),
  REMOVED_PATH: path.join(__dirname, '../data/curation/final/removed-vocabulary.json'),
  SUMMARY_PATH: path.join(__dirname, '../data/curation/final/curation-summary.json'),
  OUTPUT_PATH: path.join(__dirname, '../data/curation/final/recovered-vocabulary.json'),

  // Mining paths
  KAIKKI_PATH: '/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/services/learning-service/storage/raw-data/kaikki.jsonl',
  MINED_DATA_PATH: path.join(__dirname, '../../services/learning-service/storage/resource-hub/mined_data.json'),
  NEW_MINED_PATH: path.join(__dirname, '../data/new-mined-words.json'),

  // Mining config
  BATCH_SIZE: 20,
  MINING_BATCH_TARGET: 5000, // Mỗi đợt đào 5000 từ
  MAX_MINING_BATCHES: 10, // Giới hạn 10 đợt đào = 50,000 từ tối đa

  // Recovery config
  RECOVERY_RATIO: 0.5, // Khôi phục 50% từ REMOVE

  // Trash patterns - Những từ chắc chắn là rác
  TRASH_PATTERNS: [
    /^[A-Z]{3,}$/,           // Acronyms: ABC, DDR, BRD
    /^\d+$/,                  // Pure numbers
    /^.{1,2}$/,               // Too short
    /^.{30,}$/,               // Too long
    /[^\w\s\-äöüÄÖÜß]/,       // Special characters
    /^(test|dummy|example)/i, // Test data
  ],

  // Words that should definitely stay removed
  BLACKLIST_MEANING_PATTERNS: [
    /^(ne|n\/a|null|undefined|\?)$/i,
    /^(dạng không chuẩn|lỗi chính tả|từ cổ)/i,
    /^(obsolete|archaic|rare usage)/i,
  ],
};

// ============================================================================
// PHASE 1: RECOVERY - Khôi phục từ nhóm REMOVE
// ============================================================================

/**
 * Check if a word is definitely trash
 */
function isDefinitelyTrash(word) {
  // Check trash patterns
  for (const pattern of CONFIG.TRASH_PATTERNS) {
    if (pattern.test(word.word || '')) {
      return { isTrash: true, reason: 'trash_pattern' };
    }
  }

  // Check meaning patterns
  const meaning = word.meaning_vi || '';
  for (const pattern of CONFIG.BLACKLIST_MEANING_PATTERNS) {
    if (pattern.test(meaning)) {
      return { isTrash: true, reason: 'blacklist_meaning' };
    }
  }

  // Score = 0 and no Goethe = definitely trash
  if (word.scores?.total === 0 && !word.flags?.isGoethe) {
    return { isTrash: true, reason: 'zero_score' };
  }

  // POS not useful for learning
  const invalidPOS = ['article', 'particle', 'prefix', 'suffix', 'affix', 'symbol'];
  if (invalidPOS.includes(word.pos?.toLowerCase())) {
    return { isTrash: true, reason: 'invalid_pos' };
  }

  return { isTrash: false };
}

/**
 * Recovery Phase: Recover 50% of REMOVE words
 */
async function runRecoveryPhase() {
  console.log('\n🔄 PHASE 1: RECOVERY - Khôi phục từ nhóm REMOVE\n');
  console.log('━'.repeat(60));

  // Load removed words
  if (!fs.existsSync(CONFIG.REMOVED_PATH)) {
    console.log('   ⚠️  Không tìm thấy file removed-vocabulary.json');
    return { recovered: 0, stillRemoved: 0 };
  }

  const removedWords = JSON.parse(fs.readFileSync(CONFIG.REMOVED_PATH, 'utf-8'));
  console.log(`   📦 Tổng số từ trong nhóm REMOVE: ${removedWords.length}`);

  // Separate trash from recoverable
  const definiteTrash = [];
  const recoverable = [];

  for (const word of removedWords) {
    const check = isDefinitelyTrash(word);
    if (check.isTrash) {
      word._trashReason = check.reason;
      definiteTrash.push(word);
    } else {
      recoverable.push(word);
    }
  }

  console.log(`   🗑️  Rác rõ ràng: ${definiteTrash.length}`);
  console.log(`   ♻️  Có thể khôi phục: ${recoverable.length}`);

  // Recover 50% of recoverable words (prioritize by score)
  recoverable.sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0));

  const recoverCount = Math.floor(recoverable.length * CONFIG.RECOVERY_RATIO);
  const toRecover = recoverable.slice(0, recoverCount);
  const stillRemove = recoverable.slice(recoverCount);

  console.log(`\n   🎯 Khôi phục ${recoverCount} từ (${(CONFIG.RECOVERY_RATIO * 100)}% của ${recoverable.length})`);

  // Update recovered words with REVIEW recommendation
  for (const word of toRecover) {
    word.flags.recommendation = 'review';
    word._recoveryNote = 'Recovered from REMOVE group';
  }

  // Load existing curated words
  let curatedWords = [];
  if (fs.existsSync(CONFIG.CURATED_PATH)) {
    curatedWords = JSON.parse(fs.readFileSync(CONFIG.CURATED_PATH, 'utf-8'));
  }

  // Merge recovered words
  const existingNormalized = new Set(curatedWords.map(w => w.normalized));
  const newRecovered = toRecover.filter(w => !existingNormalized.has(w.normalized));

  console.log(`   ➕ Thêm mới ${newRecovered.length} từ (loại trừ ${toRecover.length - newRecovered.length} trùng lặp)`);

  const combinedCurated = [...curatedWords, ...newRecovered];

  // Save updated files
  fs.writeFileSync(CONFIG.CURATED_PATH, JSON.stringify(combinedCurated, null, 2));

  // Save new removed list (only definite trash + still removed)
  const newRemoved = [...definiteTrash, ...stillRemove];
  fs.writeFileSync(CONFIG.REMOVED_PATH, JSON.stringify(newRemoved, null, 2));

  // Save recovery report
  const recoveryReport = {
    timestamp: new Date().toISOString(),
    originalRemoved: removedWords.length,
    definiteTrash: definiteTrash.length,
    recoverable: recoverable.length,
    recovered: newRecovered.length,
    stillRemoved: newRemoved.length,
    byTrashReason: {},
  };

  for (const trash of definiteTrash) {
    const reason = trash._trashReason || 'unknown';
    recoveryReport.byTrashReason[reason] = (recoveryReport.byTrashReason[reason] || 0) + 1;
  }

  const reportPath = path.join(__dirname, '../data/curation/final/recovery-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(recoveryReport, null, 2));

  console.log('\n   ✅ Recovery Phase hoàn tất!');
  console.log(`   📊 Curated words mới: ${combinedCurated.length}`);
  console.log(`   📊 Removed words còn lại: ${newRemoved.length}`);

  return {
    recovered: newRecovered.length,
    stillRemoved: newRemoved.length,
    totalCurated: combinedCurated.length,
  };
}

// ============================================================================
// PHASE 2: TARGET-DRIVEN MINING - Đào bù nếu thiếu
// ============================================================================

/**
 * Load already mined words to avoid duplicates
 */
function loadExistingWords() {
  const existingWords = new Set();

  // From curated
  if (fs.existsSync(CONFIG.CURATED_PATH)) {
    const data = JSON.parse(fs.readFileSync(CONFIG.CURATED_PATH, 'utf-8'));
    data.forEach(w => existingWords.add(w.word?.toLowerCase()));
  }

  // From mined_data
  if (fs.existsSync(CONFIG.MINED_DATA_PATH)) {
    const data = JSON.parse(fs.readFileSync(CONFIG.MINED_DATA_PATH, 'utf-8'));
    data.forEach(w => existingWords.add(w.word?.toLowerCase()));
  }

  return existingWords;
}

/**
 * Gatekeeper filter for new words
 */
function passesGatekeeper(entry) {
  try {
    if (!entry.word || typeof entry.word !== 'string') return false;

    const allowedPOS = ['noun', 'verb', 'adj', 'adv', 'prep', 'conj', 'pron', 'intj', 'num'];
    if (!allowedPOS.includes(entry.pos?.toLowerCase())) return false;

    if (entry.word.includes(' ')) return false;
    if (entry.word.length > 25 || entry.word.length < 2) return false;

    const validPattern = /^[a-zA-ZäöüÄÖÜß\-]+$/;
    if (!validPattern.test(entry.word)) return false;

    if (!entry.senses?.[0]?.glosses?.[0]) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Process batch with Claude for Vietnamese translation
 */
async function processBatchWithClaude(batch) {
  const prompt = `You are a professional German-Vietnamese dictionary generator.

**INPUT**: Array of German words with English definitions.

${JSON.stringify(batch, null, 2)}

**TASK**:
1. Translate 'english_def' to Vietnamese → 'meaning_vi'
2. Assign CEFR Level (A1, A2, B1, B2, C1, C2) based on word difficulty
3. Suggest a Vietnamese topic name (e.g., "Gia đình", "Thức ăn", "Động từ cơ bản")

**OUTPUT**: Return ONLY a JSON Array in this exact format:

[
  {
    "word": "Haus",
    "meaning_vi": "ngôi nhà",
    "level": "A1",
    "topic": "Nhà ở",
    "pos": "noun"
  }
]

Return JSON for all ${batch.length} words:`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: 4000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`   ❌ Claude error: ${error.message}`);
    return [];
  }
}

/**
 * Mining Phase: Mine new words from kaikki.jsonl
 */
async function runMiningPhase(targetDeficit) {
  console.log('\n\n⛏️  PHASE 2: TARGET-DRIVEN MINING\n');
  console.log('━'.repeat(60));
  console.log(`   🎯 Cần đào thêm: ${targetDeficit} từ`);

  if (!fs.existsSync(CONFIG.KAIKKI_PATH)) {
    console.log('   ❌ Không tìm thấy file kaikki.jsonl');
    return { mined: 0 };
  }

  const existingWords = loadExistingWords();
  console.log(`   📦 Đã có ${existingWords.size} từ (sẽ bỏ qua)\n`);

  const newWords = [];
  let buffer = [];
  let processedLines = 0;
  let passedFilter = 0;
  let batchCount = 0;

  const fileStream = fs.createReadStream(CONFIG.KAIKKI_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    processedLines++;

    if (!line.trim()) continue;

    try {
      const entry = JSON.parse(line);

      // Skip already existing words
      if (existingWords.has(entry.word?.toLowerCase())) continue;

      // Apply gatekeeper filter
      if (!passesGatekeeper(entry)) continue;

      passedFilter++;
      buffer.push({
        word: entry.word,
        english_def: entry.senses[0].glosses[0],
        pos: entry.pos,
      });

      // Process batch
      if (buffer.length >= CONFIG.BATCH_SIZE) {
        batchCount++;
        console.log(`   [Batch ${batchCount}] Processing ${buffer.length} words...`);

        const results = await processBatchWithClaude(buffer);
        if (results.length > 0) {
          newWords.push(...results);
          results.forEach(w => existingWords.add(w.word?.toLowerCase()));
          console.log(`   ✅ Saved ${results.length} words (Total: ${newWords.length}/${targetDeficit})`);
        }

        buffer = [];

        // Check if we have enough
        if (newWords.length >= targetDeficit) {
          console.log(`\n   🎯 Đạt mục tiêu ${targetDeficit} từ!`);
          break;
        }

        // Check max batches
        if (batchCount >= CONFIG.MAX_MINING_BATCHES * (CONFIG.MINING_BATCH_TARGET / CONFIG.BATCH_SIZE)) {
          console.log(`\n   🛡️ Đạt giới hạn đào!`);
          break;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch {
      continue;
    }
  }

  // Process remaining buffer
  if (buffer.length > 0 && newWords.length < targetDeficit) {
    batchCount++;
    console.log(`   [Batch ${batchCount}] Processing final ${buffer.length} words...`);

    const results = await processBatchWithClaude(buffer);
    if (results.length > 0) {
      newWords.push(...results);
      console.log(`   ✅ Saved ${results.length} words (Total: ${newWords.length})`);
    }
  }

  // Save new mined words
  if (newWords.length > 0) {
    fs.writeFileSync(CONFIG.NEW_MINED_PATH, JSON.stringify(newWords, null, 2));
    console.log(`\n   💾 Saved to: ${CONFIG.NEW_MINED_PATH}`);
  }

  console.log('\n   ✅ Mining Phase hoàn tất!');
  console.log(`   📊 Đã đào: ${newWords.length} từ mới`);
  console.log(`   📊 Tổng lines đọc: ${processedLines}`);
  console.log(`   📊 Passed filter: ${passedFilter}`);

  return { mined: newWords.length };
}

// ============================================================================
// MAIN COMMANDER
// ============================================================================

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🚀 RECOVERY & SCALE-UP COMMANDER                        ║');
  console.log('║    Chiến dịch: Bảo toàn quân số 15,000 từ chất lượng       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const startTime = Date.now();

  // Initialize Anthropic SDK for mining phase
  const canMine = await initAnthropic();

  // ==============================
  // PHASE 1: RECOVERY
  // ==============================
  const recoveryResult = await runRecoveryPhase();

  // ==============================
  // CHECK TARGET
  // ==============================
  console.log('\n\n📊 KIỂM TRA QUÂN SỐ\n');
  console.log('━'.repeat(60));

  const currentCount = recoveryResult.totalCurated || 0;
  const targetDeficit = CONFIG.TARGET_WORDS - currentCount;

  console.log(`   🎯 Mục tiêu: ${CONFIG.TARGET_WORDS} từ`);
  console.log(`   📦 Hiện có: ${currentCount} từ`);
  console.log(`   📉 Thiếu: ${targetDeficit > 0 ? targetDeficit : 0} từ`);

  // ==============================
  // PHASE 2: MINING (if needed)
  // ==============================
  let miningResult = { mined: 0 };

  if (targetDeficit > 0 && canMine) {
    console.log(`\n   ⚠️ Chưa đủ quân số! Bắt đầu chiến dịch đào bù...`);
    miningResult = await runMiningPhase(targetDeficit);
  } else if (targetDeficit > 0 && !canMine) {
    console.log(`\n   ⚠️ Chưa đủ quân số nhưng không có API key để đào thêm.`);
    console.log(`   💡 Thiết lập ANTHROPIC_API_KEY trong file .env để đào bù.`);
  } else {
    console.log(`\n   ✅ Đã đủ quân số! Không cần đào thêm.`);
  }

  // ==============================
  // FINAL REPORT
  // ==============================
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📋 BÁO CÁO TỔNG KẾT                                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`
   🔄 Recovery Phase:
      - Đã khôi phục: ${recoveryResult.recovered} từ
      - Còn removed: ${recoveryResult.stillRemoved} từ

   ⛏️  Mining Phase:
      - Đã đào mới: ${miningResult.mined} từ

   📊 Kết quả:
      - Tổng từ hiện có: ${currentCount + miningResult.mined}
      - Mục tiêu: ${CONFIG.TARGET_WORDS}
      - Trạng thái: ${currentCount + miningResult.mined >= CONFIG.TARGET_WORDS ? '✅ ĐẠT' : '⚠️ CHƯA ĐẠT'}

   ⏱️  Thời gian: ${elapsed}s
  `);

  console.log('═'.repeat(62));
  console.log('🎖️  ĐÃ KẾT NỐI LẠI LIÊN LẠC!');
  console.log('   Script đã được cập nhật để bảo toàn quân số và sẵn sàng đào tiếp.');
  console.log('═'.repeat(62));
  console.log('\n');

  return {
    recovered: recoveryResult.recovered,
    mined: miningResult.mined,
    total: currentCount + miningResult.mined,
  };
}

// ============================================================================
// RUN
// ============================================================================

main().catch(error => {
  console.error('💥 FATAL ERROR:', error);
  process.exit(1);
});
