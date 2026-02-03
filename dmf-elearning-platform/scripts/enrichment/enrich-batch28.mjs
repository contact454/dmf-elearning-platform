#!/usr/bin/env node
/**
 * Enrich Batch 28 Vocabulary with Examples - Final Push
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

const INPUT = path.resolve(__dirname, '../data/quality-expansion/batch28-vocabulary.json');
const OUTPUT = path.resolve(__dirname, '../data/quality-expansion/enriched-batch28.json');

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
  console.log('║    📝 ENRICH BATCH 28 - FINAL PUSH TO 10K                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await initAnthropic();
  console.log('✅ Anthropic initialized\n');

  const allWords = JSON.parse(await fs.readFile(INPUT, 'utf-8'));
  console.log(`📥 Loaded ${allWords.length} words\n`);

  console.log(`Processing all ${allWords.length} words in single batch...`);

  try {
    const examples = await generateExamples(allWords);
    const enriched = allWords.map((word, idx) => {
      const example = examples[idx] || examples.find(e =>
        e.word?.toLowerCase().includes(word.word.toLowerCase())
      );
      return {
        ...word,
        example_de: example?.example_de || '',
        example_vi: example?.example_vi || '',
      };
    });

    await fs.writeFile(OUTPUT, JSON.stringify(enriched, null, 2));
    console.log(`\n💾 Saved ${enriched.length} words to: ${OUTPUT}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    await fs.writeFile(OUTPUT, JSON.stringify(allWords, null, 2));
  }
}

main().catch(console.error);
