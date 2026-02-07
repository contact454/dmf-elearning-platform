#!/usr/bin/env node
/**
 * Enrich Batch 8 Vocabulary with Examples
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
  ];
  for (const envPath of envPaths) {
    if (fsSync.existsSync(envPath)) {
      const content = fsSync.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '');
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
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const BATCH_SIZE = 20;
const INPUT = path.resolve(__dirname, '../data/quality-expansion/batch8-vocabulary.json');
const OUTPUT = path.resolve(__dirname, '../data/quality-expansion/enriched-batch8.json');
const PROGRESS = path.resolve(__dirname, '../data/quality-expansion/enrich-batch8-progress.json');

async function generateExamples(words) {
  const prompt = `Tạo câu ví dụ tiếng Đức cho mỗi từ, kèm dịch tiếng Việt.

**TỪ:**
${words.map((w, i) => `${i + 1}. ${w.word} (${w.pos}) - ${w.meaning_vi}`).join('\n')}

**OUTPUT (JSON):**
[{"word": "...", "example_de": "...", "example_vi": "..."}]`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  });

  const jsonMatch = message.content[0].text.match(/\[[\s\S]*\]/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📝 ENRICH BATCH 8 VOCABULARY (390 words)                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await initAnthropic();
  console.log('✅ Anthropic initialized\n');

  const allWords = JSON.parse(await fs.readFile(INPUT, 'utf-8'));
  console.log(`📥 Loaded ${allWords.length} words\n`);

  let enriched = [];
  let startIdx = 0;

  try {
    const progress = JSON.parse(await fs.readFile(PROGRESS, 'utf-8'));
    enriched = progress.enriched || [];
    startIdx = progress.lastIndex || 0;
    if (startIdx > 0) {
      console.log(`📂 Resuming from index ${startIdx} (${enriched.length} already done)\n`);
    }
  } catch {}

  const totalBatches = Math.ceil((allWords.length - startIdx) / BATCH_SIZE);

  for (let i = startIdx; i < allWords.length; i += BATCH_SIZE) {
    const batchNum = Math.floor((i - startIdx) / BATCH_SIZE) + 1;
    const batch = allWords.slice(i, i + BATCH_SIZE);

    console.log(`[Batch ${batchNum}/${totalBatches}] Processing ${batch.length} words...`);

    try {
      const examples = await generateExamples(batch);
      const enrichedBatch = batch.map((word, idx) => {
        const example = examples[idx] || examples.find(e =>
          e.word?.toLowerCase().includes(word.word.toLowerCase())
        );
        return {
          ...word,
          example_de: example?.example_de || '',
          example_vi: example?.example_vi || '',
        };
      });
      enriched.push(...enrichedBatch);
      console.log(`   ✅ Done (Total: ${enriched.length})`);

      await fs.writeFile(PROGRESS, JSON.stringify({
        enriched,
        lastIndex: i + BATCH_SIZE
      }, null, 2));

      if (i + BATCH_SIZE < allWords.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error) {
      console.error(`   ❌ ${error.message}`);
      enriched.push(...batch);
      await fs.writeFile(PROGRESS, JSON.stringify({
        enriched,
        lastIndex: i + BATCH_SIZE
      }, null, 2));
    }
  }

  await fs.writeFile(OUTPUT, JSON.stringify(enriched, null, 2));
  console.log(`\n💾 Saved ${enriched.length} words to: ${OUTPUT}`);

  try { await fs.unlink(PROGRESS); } catch {}
}

main().catch(console.error);
