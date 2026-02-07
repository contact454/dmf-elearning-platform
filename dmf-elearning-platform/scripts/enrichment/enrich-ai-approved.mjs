#!/usr/bin/env node
/**
 * Enrich ONLY AI-Approved Words (that don't have examples yet)
 */

import fs from 'fs/promises';
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

const BATCH_SIZE = 15;
const AI_APPROVED_1 = path.resolve(__dirname, '../data/quality-expansion/ai-approved.json');
const AI_APPROVED_2 = path.resolve(__dirname, '../data/quality-expansion/ai-approved-phase2.json');
const OUTPUT_FILE = path.resolve(__dirname, '../data/quality-expansion/enriched-ai-approved.json');
const PROGRESS_FILE = path.resolve(__dirname, '../data/quality-expansion/ai-enrichment-progress.json');

async function generateExamples(words) {
  const prompt = `Bạn là giáo viên tiếng Đức chuyên nghiệp.

**NHIỆM VỤ**: Tạo câu ví dụ tiếng Đức đơn giản cho mỗi từ sau, kèm dịch tiếng Việt.

**DANH SÁCH TỪ**:
${words.map((w, i) => `${i + 1}. ${w.word} (${w.pos || 'n/a'}) - ${w.meaning_vi}`).join('\n')}

**YÊU CẦU**:
1. Mỗi từ có 1 câu ví dụ phù hợp level (A1-C2)
2. Câu phải thực tế, hữu ích cho người học
3. Dịch chính xác sang tiếng Việt
4. Với danh từ, dùng đúng artikel (der/die/das)

**OUTPUT FORMAT** (JSON array):
[
  {
    "word": "das Haus",
    "example_de": "Das Haus ist sehr groß.",
    "example_vi": "Ngôi nhà rất lớn."
  }
]

Trả về JSON cho ${words.length} từ:`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response');
  }

  return JSON.parse(jsonMatch[0]);
}

async function loadProgress() {
  try {
    const content = await fs.readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { processedCount: 0, enrichedWords: [] };
  }
}

async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

async function enrichAIApproved() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📝 ENRICH AI-APPROVED WORDS                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await initAnthropic();

  // Load AI-approved words from both phases
  const phase1 = JSON.parse(await fs.readFile(AI_APPROVED_1, 'utf-8'));
  const phase2 = JSON.parse(await fs.readFile(AI_APPROVED_2, 'utf-8'));

  // Combine and deduplicate
  const wordMap = new Map();
  for (const word of [...phase1, ...phase2]) {
    if (!wordMap.has(word.word.toLowerCase())) {
      wordMap.set(word.word.toLowerCase(), word);
    }
  }
  const allWords = Array.from(wordMap.values());

  console.log(`📥 Loaded ${phase1.length} phase 1 + ${phase2.length} phase 2 words`);
  console.log(`📥 Combined: ${allWords.length} unique AI-approved words\n`);

  // Load progress
  let progress = await loadProgress();
  console.log(`📊 Progress: ${progress.processedCount}/${allWords.length} already processed\n`);

  const wordsToProcess = allWords.slice(progress.processedCount);

  if (wordsToProcess.length === 0) {
    console.log('✅ All AI-approved words already enriched!');
    return;
  }

  console.log(`⏳ Processing ${wordsToProcess.length} remaining words...\n`);

  const totalBatches = Math.ceil(wordsToProcess.length / BATCH_SIZE);

  for (let i = 0; i < wordsToProcess.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = wordsToProcess.slice(i, i + BATCH_SIZE);

    console.log(`[Batch ${batchNum}/${totalBatches}] Processing ${batch.length} words...`);

    try {
      const examples = await generateExamples(batch);

      const enrichedBatch = batch.map((word, idx) => {
        const example = examples[idx] || examples.find(e =>
          e.word.toLowerCase().includes(word.word.toLowerCase()) ||
          word.word.toLowerCase().includes(e.word.toLowerCase())
        );

        return {
          ...word,
          example_de: example?.example_de || '',
          example_vi: example?.example_vi || '',
        };
      });

      progress.enrichedWords.push(...enrichedBatch);
      progress.processedCount += batch.length;

      await saveProgress(progress);

      const withExamples = enrichedBatch.filter(w => w.example_de).length;
      console.log(`   ✅ Added ${withExamples}/${batch.length} examples (Total: ${progress.processedCount}/${allWords.length})`);

      if (i + BATCH_SIZE < wordsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      await saveProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(progress.enrichedWords, null, 2), 'utf-8');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ✅ AI-APPROVED ENRICHMENT COMPLETE                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Total enriched: ${progress.enrichedWords.length} words`);
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
}

enrichAIApproved().catch(console.error);
