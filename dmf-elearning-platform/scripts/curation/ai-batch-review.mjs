#!/usr/bin/env node
/**
 * 🤖 AI BATCH REVIEW FOR VOCABULARY
 *
 * Mục tiêu: Dùng Claude để review các từ trong nhóm REVIEW
 * Tiêu chí: Chất lượng cao, thông dụng, phù hợp cho người học
 */

import fs from 'fs';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../../.env.local'),
    path.join(__dirname, '../../../.env'),
  ];

  for (const envPath of envPaths) {
    if (fsSync.existsSync(envPath)) {
      const content = fsSync.readFileSync(envPath, 'utf-8');
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
      console.log(`📄 Loaded env from: ${path.basename(envPath)}`);
      break;
    }
  }
}

loadEnv();

let anthropic = null;

async function initAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found in environment');
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log('✅ Anthropic SDK initialized\n');
}

const BATCH_SIZE = 30;
const INPUT_FILE = path.join(__dirname, '../data/quality-expansion/review-candidates.json');
const OUTPUT_FILE = path.join(__dirname, '../data/quality-expansion/ai-approved.json');
const PROGRESS_FILE = path.join(__dirname, '../data/quality-expansion/ai-review-progress.json');

/**
 * Review vocabulary batch with Claude
 */
async function reviewBatch(words) {
  const wordList = words.map((w, i) =>
    `${i + 1}. ${w.word} (${w.pos || 'n/a'}, ${w.level || 'n/a'}) - ${w.meaning_vi || 'no translation'}`
  ).join('\n');

  const prompt = `Bạn là chuyên gia ngôn ngữ Đức. Nhiệm vụ: Đánh giá danh sách từ vựng theo tiêu chí CHẤT LƯỢNG.

**TIÊU CHÍ KEEP (Giữ lại):**
✅ Từ thông dụng, được dùng hàng ngày
✅ Từ cơ bản mà mọi người học tiếng Đức cần biết
✅ Từ xuất hiện trong sách giáo khoa, báo chí phổ thông
✅ Danh từ, động từ, tính từ, trạng từ quan trọng

**TIÊU CHÍ REMOVE (Loại bỏ):**
❌ Từ hiếm, ít dùng trong giao tiếp hàng ngày
❌ Từ chuyên ngành quá sâu (y học, luật, kỹ thuật...)
❌ Từ cổ, lỗi thời, phương ngữ
❌ Từ thô tục, xúc phạm
❌ Tên riêng, địa danh, thương hiệu
❌ Từ compound quá dài, không phổ biến
❌ Từ chỉ xuất hiện trong văn học/thơ ca

**DANH SÁCH TỪ:**
${wordList}

**OUTPUT FORMAT** (JSON array của số thứ tự từ KEEP):
{"keep": [1, 3, 5, 7], "reason": "short explanation"}

Trả về JSON chỉ chứa các từ đáp ứng tiêu chí KEEP:`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    temperature: 0.1,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { keep: [], reason: 'Invalid JSON response' };
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return { keep: [], reason: 'JSON parse error' };
  }
}

/**
 * Load progress or start fresh
 */
function loadProgress() {
  try {
    const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { processedCount: 0, approvedWords: [] };
  }
}

/**
 * Save progress
 */
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Main review process
 */
async function runAIReview() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🤖 AI BATCH REVIEW FOR VOCABULARY                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await initAnthropic();

  // Load review candidates
  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const allWords = JSON.parse(content);
  console.log(`📥 Loaded ${allWords.length} review candidates\n`);

  // Load progress
  let progress = loadProgress();
  console.log(`📊 Progress: ${progress.processedCount}/${allWords.length} already processed`);
  console.log(`   Approved so far: ${progress.approvedWords.length}\n`);

  // Skip already processed
  const wordsToProcess = allWords.slice(progress.processedCount);

  if (wordsToProcess.length === 0) {
    console.log('✅ All words already reviewed!');
    return;
  }

  console.log(`⏳ Processing ${wordsToProcess.length} remaining words...\n`);

  // Process in batches
  const totalBatches = Math.ceil(wordsToProcess.length / BATCH_SIZE);

  for (let i = 0; i < wordsToProcess.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = wordsToProcess.slice(i, i + BATCH_SIZE);

    console.log(`[Batch ${batchNum}/${totalBatches}] Reviewing ${batch.length} words...`);

    try {
      const result = await reviewBatch(batch);

      // Extract approved words
      const approvedIndices = result.keep || [];
      const approvedBatch = approvedIndices
        .filter(idx => idx >= 1 && idx <= batch.length)
        .map(idx => batch[idx - 1]);

      progress.approvedWords.push(...approvedBatch);
      progress.processedCount += batch.length;

      saveProgress(progress);

      console.log(`   ✅ Approved ${approvedBatch.length}/${batch.length} (Total approved: ${progress.approvedWords.length})`);

      // Rate limiting - 1.5 seconds between batches
      if (i + BATCH_SIZE < wordsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      saveProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Save final approved vocabulary
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(progress.approvedWords, null, 2));

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ✅ AI REVIEW COMPLETE                                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Results:`);
  console.log(`   Total reviewed: ${progress.processedCount}`);
  console.log(`   Total approved: ${progress.approvedWords.length}`);
  console.log(`   Approval rate: ${Math.round((progress.approvedWords.length / progress.processedCount) * 100)}%`);
  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
}

runAIReview().catch(console.error);
