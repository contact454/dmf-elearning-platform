#!/usr/bin/env node
/**
 * Enrich Recovered Words with Example Sentences
 */

import fs from 'fs/promises';
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

const BATCH_SIZE = 15;
const INPUT_FILE = path.resolve(__dirname, '../data/quality-expansion/recovered-approved.json');
const OUTPUT_FILE = path.resolve(__dirname, '../data/quality-expansion/enriched-recovered.json');
const PROGRESS_FILE = path.resolve(__dirname, '../data/quality-expansion/recovered-enrichment-progress.json');

async function generateExamples(words) {
  const prompt = `Tạo câu ví dụ tiếng Đức đơn giản cho mỗi từ, kèm dịch tiếng Việt.

**TỪ:**
${words.map((w, i) => `${i + 1}. ${w.word} (${w.pos || 'n/a'}) - ${w.meaning_vi}`).join('\n')}

**OUTPUT (JSON array):**
[{"word": "...", "example_de": "...", "example_vi": "..."}]`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid JSON');

  return JSON.parse(jsonMatch[0]);
}

async function loadProgress() {
  try {
    return JSON.parse(await fs.readFile(PROGRESS_FILE, 'utf-8'));
  } catch {
    return { processedCount: 0, enrichedWords: [] };
  }
}

async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

async function enrichRecovered() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📝 ENRICH RECOVERED WORDS                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await initAnthropic();
  console.log('✅ Anthropic initialized\n');

  const allWords = JSON.parse(await fs.readFile(INPUT_FILE, 'utf-8'));
  console.log(`📥 Loaded ${allWords.length} recovered words\n`);

  let progress = await loadProgress();
  console.log(`📊 Progress: ${progress.processedCount}/${allWords.length}\n`);

  const wordsToProcess = allWords.slice(progress.processedCount);
  if (wordsToProcess.length === 0) {
    console.log('✅ All words enriched!');
    return;
  }

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
      console.log(`   ✅ ${withExamples}/${batch.length} (Total: ${progress.processedCount})`);

      if (i + BATCH_SIZE < wordsToProcess.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error) {
      console.error(`   ❌ ${error.message}`);
      await saveProgress(progress);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(progress.enrichedWords, null, 2), 'utf-8');

  console.log('\n✅ Enrichment complete!');
  console.log(`📊 Total: ${progress.enrichedWords.length} words`);
}

enrichRecovered().catch(console.error);
