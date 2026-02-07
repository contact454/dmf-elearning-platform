#!/usr/bin/env node
/**
 * 🤖 AI REVIEW FOR RECOVERED CANDIDATES
 * Process recovered words with AI quality review
 */

import fs from 'fs';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      break;
    }
  }
}

loadEnv();

let anthropic = null;

async function initAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found');
  }
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const BATCH_SIZE = 40;
const INPUT_FILE = path.join(__dirname, '../data/quality-expansion/recovered-words.json');
const OUTPUT_FILE = path.join(__dirname, '../data/quality-expansion/recovered-approved.json');
const PROGRESS_FILE = path.join(__dirname, '../data/quality-expansion/recovered-review-progress.json');

async function reviewBatch(words) {
  const wordList = words.map((w, i) =>
    `${i + 1}. ${w.word} (${w.pos || 'n/a'}, ${w.level || 'n/a'}) - ${w.meaning_vi || 'no translation'}`
  ).join('\n');

  const prompt = `Bạn là chuyên gia ngôn ngữ Đức. Đánh giá danh sách từ vựng.

**TIÊU CHÍ KEEP:**
✅ Từ thông dụng trong giao tiếp hàng ngày
✅ Từ cơ bản cho người học tiếng Đức
✅ Danh từ, động từ, tính từ quan trọng
✅ Từ xuất hiện trong sách giáo khoa

**TIÊU CHÍ REMOVE:**
❌ Từ quá chuyên ngành (y học, luật, kỹ thuật sâu)
❌ Từ cổ, lỗi thời, phương ngữ
❌ Tên riêng, địa danh, thương hiệu
❌ Từ compound quá dài, không phổ biến
❌ Từ thô tục

**DANH SÁCH:**
${wordList}

**OUTPUT:** JSON với số thứ tự các từ KEEP
{"keep": [1, 3, 5, 7]}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    temperature: 0.1,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { keep: [] };

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { keep: [] };
  }
}

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  } catch {
    return { processedCount: 0, approvedWords: [] };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function runReview() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🤖 AI REVIEW FOR RECOVERED CANDIDATES                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await initAnthropic();
  console.log('✅ Anthropic SDK initialized\n');

  const allWords = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

  // Take all remaining words (need more to reach 10k)
  const wordsToReview = allWords;
  console.log(`📥 Reviewing top ${wordsToReview.length} recovered candidates\n`);

  let progress = loadProgress();
  console.log(`📊 Progress: ${progress.processedCount}/${wordsToReview.length}\n`);

  const wordsToProcess = wordsToReview.slice(progress.processedCount);
  if (wordsToProcess.length === 0) {
    console.log('✅ All words already reviewed!');
    return;
  }

  console.log(`⏳ Processing ${wordsToProcess.length} remaining...\n`);

  const totalBatches = Math.ceil(wordsToProcess.length / BATCH_SIZE);

  for (let i = 0; i < wordsToProcess.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = wordsToProcess.slice(i, i + BATCH_SIZE);

    console.log(`[Batch ${batchNum}/${totalBatches}] Reviewing ${batch.length} words...`);

    try {
      const result = await reviewBatch(batch);
      const approvedIndices = result.keep || [];
      const approvedBatch = approvedIndices
        .filter(idx => idx >= 1 && idx <= batch.length)
        .map(idx => batch[idx - 1]);

      progress.approvedWords.push(...approvedBatch);
      progress.processedCount += batch.length;
      saveProgress(progress);

      console.log(`   ✅ Approved ${approvedBatch.length}/${batch.length} (Total: ${progress.approvedWords.length})`);

      if (i + BATCH_SIZE < wordsToProcess.length) {
        await new Promise(r => setTimeout(r, 1200));
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      saveProgress(progress);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(progress.approvedWords, null, 2));

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ✅ RECOVERED REVIEW COMPLETE                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Total approved: ${progress.approvedWords.length}`);
  console.log(`   Approval rate: ${Math.round(progress.approvedWords.length / progress.processedCount * 100)}%`);
}

runReview().catch(console.error);
