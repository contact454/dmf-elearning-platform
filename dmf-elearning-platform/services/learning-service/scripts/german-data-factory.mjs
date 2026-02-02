/**
 * German Data Factory - Background Resource Processing
 * Processes kaikki.org German dictionary with Qwen 3 30B
 * Runs as PM2 daemon for resilient processing
 */

import { Ollama } from 'ollama';
import fs from 'fs';
import fsp from 'fs/promises';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_FILE = '/Users/huynhngocphuc/Downloads/kaikki.org-dictionary-German.jsonl';
const CHECKPOINT_FILE = path.join(__dirname, '../storage/factory-state.json');
const OUTPUT_DIR = path.join(__dirname, '../storage/resource-hub');
const BATCH_SIZE = 5;
const MODEL = 'llama3.2:latest';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

// Stats
let stats = {
  startedAt: new Date().toISOString(),
  linesProcessed: 0,
  linesSkipped: 0,
  aiCalls: 0,
  errors: 0,
  checkpoint: 0
};

console.log('🏭 German Data Factory Started');
console.log('=' .repeat(60));
console.log(`Source: ${SOURCE_FILE}`);
console.log(`Model: ${MODEL}`);
console.log(`Batch Size: ${BATCH_SIZE} lines\n`);

/**
 * Load checkpoint to resume from last position
 */
async function loadCheckpoint() {
  try {
    const data = await fsp.readFile(CHECKPOINT_FILE, 'utf-8');
    const checkpoint = JSON.parse(data);
    stats.checkpoint = checkpoint.lastLine || 0;
    console.log(`✓ Checkpoint loaded: resuming from line ${stats.checkpoint}\n`);
    return stats.checkpoint;
  } catch (error) {
    console.log('✓ No checkpoint found, starting from beginning\n');
    return 0;
  }
}

/**
 * Save checkpoint
 */
async function saveCheckpoint(lineNumber) {
  const checkpoint = {
    lastLine: lineNumber,
    timestamp: new Date().toISOString(),
    stats
  };
  await fsp.writeFile(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

/**
 * Analyze word with Qwen 3 30B
 */
async function analyzeWord(wordData) {
  const word = wordData.word || 'unknown';
  const pos = wordData.pos || 'unknown';

  const prompt = `Analyze this German word and classify it.

Word: ${word}
Part of Speech: ${pos}

Return ONLY valid JSON (no thinking, no explanations):
{
  "level": "A1|A2|B1|B2|C1|C2",
  "topic": "Vietnamese topic name (e.g., 'Gia đình', 'Đồ ăn', 'Động từ cơ bản')",
  "meaning": "Vietnamese meaning (1-2 words)"
}`;

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a German language classifier. Output ONLY valid JSON. Remove ALL <think> tags.' },
        { role: 'user', content: prompt }
      ],
      options: {
        temperature: 0.3,
        num_predict: 150
      }
    });

    let content = response.message?.content || '';

    // Clean <think> tags
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      stats.aiCalls++;
      return result;
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (error) {
    stats.errors++;
    console.error(`  ⚠️  AI error for "${word}": ${error.message}`);
    return null;
  }
}

/**
 * Save word to appropriate topic file
 */
async function saveToTopicFile(level, topic, wordData, analysis) {
  const levelDir = path.join(OUTPUT_DIR, level);
  await fsp.mkdir(levelDir, { recursive: true });

  const filename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  const filepath = path.join(levelDir, filename);

  let existingData = [];
  try {
    const content = await fsp.readFile(filepath, 'utf-8');
    existingData = JSON.parse(content);
  } catch (error) {
    // File doesn't exist yet
  }

  existingData.push({
    word: wordData.word,
    pos: wordData.pos,
    meaning_vi: analysis.meaning,
    source: 'kaikki.org',
    addedAt: new Date().toISOString()
  });

  await fsp.writeFile(filepath, JSON.stringify(existingData, null, 2));
}

/**
 * Process a batch of lines
 */
async function processBatch(batch) {
  for (const line of batch) {
    try {
      const wordData = JSON.parse(line);

      // Only process German words
      if (wordData.lang_code !== 'de') {
        stats.linesSkipped++;
        continue;
      }

      // Analyze with AI
      const analysis = await analyzeWord(wordData);

      if (analysis && analysis.level && analysis.topic) {
        await saveToTopicFile(analysis.level, analysis.topic, wordData, analysis);
        stats.linesProcessed++;

        if (stats.linesProcessed % 10 === 0) {
          console.log(`  Processed: ${stats.linesProcessed} | Skipped: ${stats.linesSkipped} | AI calls: ${stats.aiCalls} | Errors: ${stats.errors}`);
        }
      } else {
        stats.linesSkipped++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      stats.errors++;
      console.error(`  ⚠️  Line parse error: ${error.message}`);
    }
  }
}

/**
 * Main processing loop
 */
async function main() {
  const startLine = await loadCheckpoint();

  const fileStream = fs.createReadStream(SOURCE_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let currentLine = 0;
  let batch = [];

  for await (const line of rl) {
    currentLine++;

    // Skip to checkpoint
    if (currentLine <= startLine) {
      continue;
    }

    batch.push(line);

    // Process batch
    if (batch.length >= BATCH_SIZE) {
      await processBatch(batch);
      batch = [];

      // Save checkpoint every 50 lines
      if (currentLine % 50 === 0) {
        await saveCheckpoint(currentLine);
      }
    }
  }

  // Process remaining batch
  if (batch.length > 0) {
    await processBatch(batch);
  }

  // Final checkpoint
  await saveCheckpoint(currentLine);

  console.log('\n' + '='.repeat(60));
  console.log('✅ German Data Factory Complete!');
  console.log(`   Lines processed: ${stats.linesProcessed}`);
  console.log(`   Lines skipped: ${stats.linesSkipped}`);
  console.log(`   AI calls: ${stats.aiCalls}`);
  console.log(`   Errors: ${stats.errors}`);
  console.log('='.repeat(60));
}

// Run
main().catch(console.error);
