/**
 * German A1 Quiz Factory
 * Generates 1500 quiz questions (3 types per word) with AI explanations
 */

import { Ollama } from 'ollama';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
const MODEL = 'llama3.2:latest'; // Fast and reliable

// Read curriculum
const curriculumPath = path.join(__dirname, '../storage/curriculum/german_a1_curriculum.json');
const curriculum = JSON.parse(await fs.readFile(curriculumPath, 'utf-8'));

console.log('🏭 German A1 Quiz Factory');
console.log('=' .repeat(60));
console.log(`Target: 1500 quizzes (500 words × 3 types)`);
console.log(`Model: ${MODEL}\n`);

/**
 * Generate AI explanation for a quiz question
 */
async function generateExplanation(word, quizType, correctAnswer, wordData) {
  const prompts = {
    meaning: `Explain in Vietnamese (1 sentence) why "${word}" means "${correctAnswer}" in German.`,
    gender: `Explain in Vietnamese (1 sentence) why "${word}" uses the article "${correctAnswer}" (${wordData.gender}).`,
    wordOrder: `Explain in Vietnamese (1 sentence) the word order in this German sentence: "${correctAnswer}"`
  };

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a German teacher. Give brief, helpful explanations in Vietnamese (1 sentence only).' },
        { role: 'user', content: prompts[quizType] }
      ],
      options: {
        temperature: 0.7,
        num_predict: 100
      }
    });

    let explanation = response.message?.content || 'Không có giải thích.';

    // Clean up
    explanation = explanation.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    explanation = explanation.split('\n')[0]; // First line only

    return explanation;
  } catch (error) {
    console.error(`  ⚠️ Explanation error: ${error.message}`);
    return 'Học từ này qua ví dụ và luyện tập.';
  }
}

/**
 * Create Quiz Type 1: Meaning Quiz
 */
function createMeaningQuiz(vocabItem, unitVocab) {
  const correctAnswer = vocabItem.meaning_vi || vocabItem.meaning_en;

  // Get 3 random wrong answers from same unit
  const wrongOptions = unitVocab
    .filter(v => v.word !== vocabItem.word)
    .map(v => v.meaning_vi || v.meaning_en)
    .filter(m => m !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

  return {
    type: 'meaning',
    question: `"${vocabItem.word}" nghĩa là gì?`,
    questionDe: vocabItem.word,
    options,
    correctAnswer: options.indexOf(correctAnswer),
    explanation: '' // Will be filled by AI
  };
}

/**
 * Create Quiz Type 2: Gender/Article Quiz
 */
function createGenderQuiz(vocabItem) {
  // Only for nouns with articles
  if (!vocabItem.gender || vocabItem.gender === 'none' || vocabItem.wordType !== 'noun') {
    return null;
  }

  const word = vocabItem.word.replace(/^(der|die|das)\s+/, ''); // Remove article
  const genderMap = {
    'masculine': 'der',
    'feminine': 'die',
    'neuter': 'das'
  };

  const correctArticle = genderMap[vocabItem.gender];
  const options = ['der', 'die', 'das'].sort(() => Math.random() - 0.5);

  return {
    type: 'gender',
    question: `Chọn mạo từ đúng: ___ ${word}`,
    questionDe: `___ ${word}`,
    options,
    correctAnswer: options.indexOf(correctArticle),
    gender: vocabItem.gender,
    explanation: '' // Will be filled by AI
  };
}

/**
 * Create Quiz Type 3: Word Order Quiz (from examples)
 */
function createWordOrderQuiz(vocabItem) {
  if (!vocabItem.examples || vocabItem.examples.length === 0) {
    return null;
  }

  const example = vocabItem.examples[0]; // Use first example
  const sentence = example.de;
  const words = sentence.split(' ');

  // Shuffle words
  const shuffledWords = [...words].sort(() => Math.random() - 0.5);

  return {
    type: 'wordOrder',
    question: `Sắp xếp từ thành câu đúng: "${example.vi}"`,
    questionVi: example.vi,
    words: shuffledWords,
    correctOrder: words,
    correctSentence: sentence,
    explanation: '' // Will be filled by AI
  };
}

/**
 * Generate quizzes for one vocabulary word
 */
async function generateQuizzesForWord(vocabItem, unitVocab, wordIndex, totalWords) {
  console.log(`  [${wordIndex + 1}/${totalWords}] ${vocabItem.word}...`);

  const quizzes = [];

  // Quiz 1: Meaning
  const meaningQuiz = createMeaningQuiz(vocabItem, unitVocab);
  meaningQuiz.explanation = await generateExplanation(
    vocabItem.word,
    'meaning',
    vocabItem.meaning_vi || vocabItem.meaning_en,
    vocabItem
  );
  quizzes.push(meaningQuiz);

  // Quiz 2: Gender (if applicable)
  const genderQuiz = createGenderQuiz(vocabItem);
  if (genderQuiz) {
    genderQuiz.explanation = await generateExplanation(
      vocabItem.word,
      'gender',
      genderQuiz.options[genderQuiz.correctAnswer],
      vocabItem
    );
    quizzes.push(genderQuiz);
  }

  // Quiz 3: Word Order
  const wordOrderQuiz = createWordOrderQuiz(vocabItem);
  if (wordOrderQuiz) {
    wordOrderQuiz.explanation = await generateExplanation(
      vocabItem.word,
      'wordOrder',
      wordOrderQuiz.correctSentence,
      vocabItem
    );
    quizzes.push(wordOrderQuiz);
  }

  // Rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second between words

  return quizzes;
}

/**
 * Process one unit
 */
async function processUnit(unit, unitIndex) {
  console.log(`\n📚 Unit ${unit.unitId}: ${unit.title}`);
  console.log(`   Vocabulary: ${unit.vocabularyCount} words\n`);

  const unitQuizzes = [];

  for (let i = 0; i < unit.vocabulary.length; i++) {
    const vocabItem = unit.vocabulary[i];
    const quizzes = await generateQuizzesForWord(vocabItem, unit.vocabulary, i, unit.vocabularyCount);

    unitQuizzes.push(...quizzes.map(q => ({
      ...q,
      word: vocabItem.word,
      wordData: {
        meaning_en: vocabItem.meaning_en,
        meaning_vi: vocabItem.meaning_vi,
        gender: vocabItem.gender,
        type: vocabItem.type,
        examples: vocabItem.examples
      }
    })));
  }

  console.log(`   ✅ Generated ${unitQuizzes.length} quizzes\n`);

  return {
    unitId: unit.unitId,
    unitTitle: unit.title,
    quizCount: unitQuizzes.length,
    quizzes: unitQuizzes
  };
}

/**
 * Main execution
 */
async function main() {
  const finalData = {
    language: 'German',
    level: 'A1',
    generatedAt: new Date().toISOString(),
    totalUnits: curriculum.totalUnits,
    totalWords: curriculum.totalWords,
    totalQuizzes: 0,
    units: []
  };

  // Process each unit
  for (let i = 0; i < curriculum.units.length; i++) {
    const unitData = await processUnit(curriculum.units[i], i);
    finalData.units.push(unitData);
    finalData.totalQuizzes += unitData.quizCount;

    // Save progress after each unit
    const outputPath = path.join(__dirname, '../storage/curriculum/german_a1_final_data.json');
    await fs.writeFile(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');
    console.log(`   💾 Progress saved (${finalData.totalQuizzes} quizzes total)\n`);
  }

  console.log('='.repeat(60));
  console.log(`✅ Quiz Factory Complete!`);
  console.log(`   Total Quizzes: ${finalData.totalQuizzes}`);
  console.log(`   Saved to: storage/curriculum/german_a1_final_data.json`);
  console.log('='.repeat(60));
}

main().catch(console.error);
