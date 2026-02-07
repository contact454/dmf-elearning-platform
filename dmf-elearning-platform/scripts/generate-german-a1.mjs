/**
 * German A1 Core Vocabulary Generator
 * Uses Qwen 32B via Ollama to generate 50 core German A1 words with quizzes
 */

import { Ollama } from 'ollama';
import fs from 'fs/promises';
import path from 'path';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
const MODEL = 'qwen3:30b';

// System prompt for German A1 vocabulary generation
const SYSTEM_PROMPT = `You are a German language teacher creating A1 level vocabulary content.
For each word, provide:
1. The German word with gender (der/die/das for nouns)
2. Vietnamese meaning
3. Example sentence in German with Vietnamese translation
4. A multiple choice quiz question

IMPORTANT: Output ONLY valid JSON, no explanations, no markdown, no thinking process.

Example format:
{
  "word": "der Apfel",
  "gender": "masculine",
  "meaning": "quả táo",
  "example": "Ich esse einen Apfel. (Tôi ăn một quả táo.)",
  "quiz": {
    "question": "Was ist 'der Apfel' auf Vietnamesisch?",
    "options": ["quả táo", "quả cam", "quả chuối", "quả nho"],
    "correctAnswer": 0
  }
}`;

// Core A1 German words to generate (nouns, verbs, common words)
const WORD_CATEGORIES = [
  // Family (10 words)
  'der Vater', 'die Mutter', 'der Bruder', 'die Schwester', 'das Kind',
  'der Großvater', 'die Großmutter', 'die Familie', 'der Sohn', 'die Tochter',

  // Numbers (10 words)
  'eins', 'zwei', 'drei', 'vier', 'fünf',
  'sechs', 'sieben', 'acht', 'neun', 'zehn',

  // Common verbs (10 words)
  'sein', 'haben', 'machen', 'gehen', 'kommen',
  'essen', 'trinken', 'sprechen', 'lernen', 'arbeiten',

  // Daily life (10 words)
  'das Haus', 'die Schule', 'der Tisch', 'der Stuhl', 'das Bett',
  'die Tür', 'das Fenster', 'der Raum', 'die Küche', 'das Bad',

  // Food (10 words)
  'das Brot', 'die Milch', 'der Käse', 'das Wasser', 'der Kaffee',
  'der Tee', 'das Ei', 'der Fisch', 'das Fleisch', 'das Gemüse'
];

/**
 * Remove <think> tags from Qwen response
 */
function cleanThinkingTags(text) {
  // Remove <think>...</think> tags and their content
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

/**
 * Extract JSON from response, handling various formats
 */
function extractJSON(text) {
  const cleaned = cleanThinkingTags(text);

  // Try to find JSON in markdown code blocks
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }

  // Try to find raw JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return cleaned;
}

/**
 * Generate vocabulary entry for a German word
 */
async function generateVocabEntry(word, index, total) {
  console.log(`[${index + 1}/${total}] Generating: ${word}...`);

  const prompt = `Generate A1 German vocabulary data for: "${word}"

Output format (valid JSON only):
{
  "word": "der/die/das + word",
  "gender": "masculine/feminine/neuter/none",
  "meaning": "Vietnamese translation",
  "example": "German sentence. (Vietnamese translation.)",
  "quiz": {
    "question": "German question about this word",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": 0
  }
}`;

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      format: 'json', // Force JSON output
      options: {
        temperature: 0.7,
        num_predict: 500
      }
    });

    const content = response.message?.content || response.message?.thinking || '';
    const jsonStr = extractJSON(content);

    try {
      const data = JSON.parse(jsonStr);
      console.log(`  ✓ Generated: ${data.word} - ${data.meaning}`);
      return data;
    } catch (parseError) {
      console.error(`  ✗ JSON parse error for "${word}":`, parseError.message);
      console.error('  Raw response:', content.substring(0, 200));

      // Return fallback structure
      return {
        word,
        gender: 'none',
        meaning: '[Failed to generate]',
        example: '[Failed to generate]',
        quiz: {
          question: `What is "${word}" in Vietnamese?`,
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: 0
        }
      };
    }
  } catch (error) {
    console.error(`  ✗ Error generating "${word}":`, error.message);
    return null;
  }
}

/**
 * Generate all vocabulary entries with rate limiting
 */
async function generateAllVocabulary() {
  console.log('🇩🇪 German A1 Core Vocabulary Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Model: ${MODEL}`);
  console.log(`Total words: ${WORD_CATEGORIES.length}`);
  console.log('');

  const results = [];

  for (let i = 0; i < WORD_CATEGORIES.length; i++) {
    const word = WORD_CATEGORIES[i];
    const entry = await generateVocabEntry(word, i, WORD_CATEGORIES.length);

    if (entry) {
      results.push(entry);
    }

    // Rate limiting: wait 2 seconds between requests to avoid overwhelming Ollama
    if (i < WORD_CATEGORIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

/**
 * Save vocabulary to JSON file
 */
async function saveToFile(vocabulary) {
  const seedsDir = path.join(process.cwd(), 'seeds');

  // Create seeds directory if it doesn't exist
  try {
    await fs.mkdir(seedsDir, { recursive: true });
  } catch (err) {
    // Directory already exists
  }

  const outputPath = path.join(seedsDir, 'german_a1_core.json');

  const output = {
    language: 'German',
    level: 'A1',
    category: 'Core Vocabulary',
    generatedAt: new Date().toISOString(),
    totalWords: vocabulary.length,
    vocabulary
  };

  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Saved ${vocabulary.length} vocabulary entries to:`);
  console.log(`   ${outputPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check Ollama connection
    console.log('Checking Ollama connection...');
    const models = await ollama.list();
    const hasQwen = models.models.some(m => m.name.includes('qwen3:30b'));

    if (!hasQwen) {
      console.error('❌ Error: Qwen 3 30B model not found!');
      console.error('   Please run: ollama pull qwen3:30b');
      process.exit(1);
    }

    console.log('✓ Ollama connected, Qwen 3 30B available');
    console.log('');

    // Generate vocabulary
    const vocabulary = await generateAllVocabulary();

    // Save to file
    await saveToFile(vocabulary);

    console.log('');
    console.log('🎉 Generation complete!');
    console.log(`📊 Success rate: ${vocabulary.length}/${WORD_CATEGORIES.length} (${Math.round(vocabulary.length/WORD_CATEGORIES.length*100)}%)`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
