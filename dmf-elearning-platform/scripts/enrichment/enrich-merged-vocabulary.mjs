#!/usr/bin/env node
/**
 * Enrich Merged Vocabulary with Example Sentences
 * Adds contextual German-Vietnamese example sentences using Claude
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

// Dynamic import Anthropic
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
const INPUT_FILE = path.resolve(__dirname, '../data/quality-expansion/merged-vocabulary.json');
const OUTPUT_FILE = path.resolve(__dirname, '../data/quality-expansion/enriched-merged-vocabulary.json');
const PROGRESS_FILE = path.resolve(__dirname, '../data/quality-expansion/enrichment-progress.json');

/**
 * Generate example sentences for a batch of words
 */
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

**OUTPUT FORMAT** (JSON array, giữ nguyên thứ tự):
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

/**
 * Load progress or start fresh
 */
async function loadProgress() {
  try {
    const content = await fs.readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { processedCount: 0, enrichedWords: [] };
  }
}

/**
 * Save progress
 */
async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

/**
 * Main enrichment process
 */
async function enrichVocabulary() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📝 ENRICH MERGED VOCABULARY WITH EXAMPLES               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Initialize Anthropic
  await initAnthropic();

  // Load merged vocabulary
  const content = await fs.readFile(INPUT_FILE, 'utf-8');
  const allWords = JSON.parse(content);
  console.log(`📥 Loaded ${allWords.length} merged words\n`);

  // Load progress
  let progress = await loadProgress();
  console.log(`📊 Progress: ${progress.processedCount}/${allWords.length} already processed\n`);

  // Skip already processed
  const wordsToProcess = allWords.slice(progress.processedCount);

  if (wordsToProcess.length === 0) {
    console.log('✅ All words already enriched!');
    return;
  }

  console.log(`⏳ Processing ${wordsToProcess.length} remaining words...\n`);

  // Process in batches
  const totalBatches = Math.ceil(wordsToProcess.length / BATCH_SIZE);

  for (let i = 0; i < wordsToProcess.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = wordsToProcess.slice(i, i + BATCH_SIZE);

    console.log(`[Batch ${batchNum}/${totalBatches}] Processing ${batch.length} words...`);

    try {
      const examples = await generateExamples(batch);

      // Merge examples into words
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

      // Save progress after each batch
      await saveProgress(progress);

      const withExamples = enrichedBatch.filter(w => w.example_de).length;
      console.log(`   ✅ Added ${withExamples}/${batch.length} examples (Total: ${progress.processedCount}/${allWords.length})`);

      // Rate limiting - 1 second between batches
      if (i + BATCH_SIZE < wordsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      // Save progress and continue
      await saveProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Save final enriched vocabulary
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(progress.enrichedWords, null, 2), 'utf-8');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ✅ ENRICHMENT COMPLETE                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Total enriched: ${progress.enrichedWords.length} words`);
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
}

enrichVocabulary().catch(console.error);
