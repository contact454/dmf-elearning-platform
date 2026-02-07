/**
 * Generate examples for German A1 curriculum vocabulary
 * Uses Qwen 32B to create authentic example sentences
 */

import { Ollama } from 'ollama';
import fs from 'fs/promises';
import path from 'path';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
const MODEL = 'llama3.2:latest'; // Using Llama 3.2 instead of Qwen (more reliable for JSON)

// Read curriculum
const curriculumPath = path.join(process.cwd(), 'storage/curriculum/german_a1_curriculum.json');
const curriculum = JSON.parse(await fs.readFile(curriculumPath, 'utf-8'));

console.log(`📝 Generating examples for ${curriculum.totalWords} words across ${curriculum.totalUnits} units\n`);

/**
 * Generate 2 example sentences for a German word using Qwen 32B
 */
async function generateExamples(word, meaning_en, gender, type, unitTitle) {
  const prompt = `Create 2 simple example sentences in German (A1 level) using the word "${word}" (${meaning_en}).

Requirements:
- Sentences must be A1 level (very simple, beginner-friendly)
- Include English and Vietnamese translations
- Use practical, everyday contexts
${gender && gender !== 'none' && gender !== 'unknown' ? `- Remember that "${word}" is ${gender}` : ''}
${type === 'verb' ? '- Use present tense conjugation' : ''}

Output ONLY a JSON array with exactly 2 examples:
[
  {
    "de": "German sentence here.",
    "en": "English translation.",
    "vi": "Bản dịch tiếng Việt."
  },
  {
    "de": "Another German sentence.",
    "en": "English translation.",
    "vi": "Bản dịch tiếng Việt."
  }
]`;

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a German language teacher creating A1 level example sentences. Always output valid JSON arrays. NO thinking, NO explanations, ONLY JSON.' },
        { role: 'user', content: prompt }
      ],
      options: {
        temperature: 0.7,
        num_predict: 400
      }
    });

    let content = response.message?.content || '';

    // Remove <think> tags if present
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Extract JSON array from markdown code blocks if present
    const codeBlockMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    if (codeBlockMatch) {
      content = codeBlockMatch[1];
    }

    // Try to find JSON array
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    if (!content || content.trim() === '') {
      throw new Error('Empty response from model');
    }

    const examples = JSON.parse(content);

    if (Array.isArray(examples) && examples.length >= 2) {
      return examples.slice(0, 2);
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error(`  ✗ Error generating examples for "${word}":`, error.message);
    return [
      { de: `Beispiel mit "${word}".`, en: `Example with "${word}".`, vi: `Ví dụ với "${word}".` },
      { de: `Noch ein Beispiel: ${word}`, en: `Another example: ${word}`, vi: `Ví dụ khác: ${word}` }
    ];
  }
}

/**
 * Process one unit at a time (to show progress)
 */
async function processUnit(unit, unitIndex) {
  console.log(`\n📚 Unit ${unit.unitId}: ${unit.title}`);
  console.log(`   Vocabulary: ${unit.vocabularyCount} words\n`);

  let processedCount = 0;

  for (let i = 0; i < unit.vocabulary.length; i++) {
    const vocabItem = unit.vocabulary[i];

    // Skip if examples already exist
    if (vocabItem.examples && vocabItem.examples.length === 2) {
      console.log(`  ⏭  [${i + 1}/${unit.vocabularyCount}] ${vocabItem.word} - already has examples`);
      processedCount++;
      continue;
    }

    console.log(`  🔄 [${i + 1}/${unit.vocabularyCount}] Generating for: ${vocabItem.word}...`);

    const examples = await generateExamples(
      vocabItem.word,
      vocabItem.meaning_en,
      vocabItem.gender,
      vocabItem.type,
      unit.title
    );

    vocabItem.examples = examples;
    processedCount++;

    console.log(`     ✓ "${examples[0].de}"`);
    console.log(`     ✓ "${examples[1].de}"`);

    // Rate limiting: 2 seconds between requests
    if (i < unit.vocabulary.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`  ✅ Unit ${unit.unitId} complete (${processedCount}/${unit.vocabularyCount} words)`);
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check Ollama connection
    console.log('Checking Ollama connection...');
    const models = await ollama.list();
    const hasModel = models.models.some(m => m.name.includes('llama3.2'));

    if (!hasModel) {
      console.error('❌ Error: Llama 3.2 model not found!');
      console.error('   Please run: ollama pull llama3.2');
      process.exit(1);
    }

    console.log('✓ Ollama connected, Llama 3.2 available\n');

    // Ask user which units to process
    const args = process.argv.slice(2);
    let startUnit = 1;
    let endUnit = curriculum.totalUnits;

    if (args.length >= 1) {
      startUnit = parseInt(args[0]);
    }
    if (args.length >= 2) {
      endUnit = parseInt(args[1]);
    }

    console.log(`📋 Processing Units ${startUnit}-${endUnit}\n`);

    // Process each unit
    for (let i = startUnit - 1; i < endUnit; i++) {
      await processUnit(curriculum.units[i], i);

      // Save progress after each unit
      await fs.writeFile(curriculumPath, JSON.stringify(curriculum, null, 2), 'utf-8');
      console.log(`  💾 Progress saved\n`);
    }

    console.log('\n🎉 Generation complete!');
    console.log(`📄 Curriculum saved to: ${curriculumPath}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Usage info
if (process.argv.includes('--help')) {
  console.log(`
Usage: node generate-curriculum-examples.mjs [startUnit] [endUnit]

Examples:
  node generate-curriculum-examples.mjs           # Process all 20 units
  node generate-curriculum-examples.mjs 1 5       # Process units 1-5 only
  node generate-curriculum-examples.mjs 10 10     # Process unit 10 only

Note: Each word takes ~2 seconds. Expect ~50 seconds per unit (25 words).
      Full curriculum: ~20 minutes for all 500 words.
  `);
  process.exit(0);
}

main();
