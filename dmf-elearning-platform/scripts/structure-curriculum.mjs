/**
 * German A1 Curriculum Structuring
 * Organizes 500 words into 20 logical units (25 words each)
 */

import fs from 'fs/promises';
import path from 'path';

// Read base vocabulary
const basePath = path.join(process.cwd(), 'storage/raw/german_a1_base.json');
const baseData = JSON.parse(await fs.readFile(basePath, 'utf-8'));

console.log(`📚 Structuring ${baseData.totalWords} words into 20 Units...\n`);

// Define 20 Units with grammar points (easy -> hard)
const unitBlueprints = [
  {
    id: 1,
    title: 'Greetings & Basic Communication',
    description: 'Learn how to greet people and basic polite phrases',
    grammarPoint: {
      topic: 'Basic Greetings',
      explanation: 'In German, greetings vary by time of day. "Guten Morgen" (Good morning), "Guten Tag" (Good day), "Guten Abend" (Good evening). Informal: "Hallo" (Hi), "Tschüss" (Bye).',
      examples: [
        { de: 'Guten Tag! Wie geht es Ihnen?', en: 'Good day! How are you?', vi: 'Xin chào! Bạn khỏe không?' },
        { de: 'Danke, gut. Und dir?', en: 'Thanks, good. And you?', vi: 'Cảm ơn, tôi khỏe. Còn bạn?' }
      ]
    },
    targetCategories: ['communication', 'sentences']
  },
  {
    id: 2,
    title: 'Numbers & Colors',
    description: 'Master basic numbers and colors for everyday use',
    grammarPoint: {
      topic: 'Cardinal Numbers',
      explanation: 'German numbers 0-20 are: null, eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn, elf, zwölf... Numbers are essential for prices, time, and quantities.',
      examples: [
        { de: 'Ich habe drei Äpfel.', en: 'I have three apples.', vi: 'Tôi có ba quả táo.' },
        { de: 'Das Auto ist rot.', en: 'The car is red.', vi: 'Chiếc xe màu đỏ.' }
      ]
    },
    targetCategories: ['numbers', 'colors']
  },
  {
    id: 3,
    title: 'Family & Personal Information',
    description: 'Introduce yourself and talk about family',
    grammarPoint: {
      topic: 'Personal Pronouns & Possessives',
      explanation: 'Personal pronouns: ich (I), du (you), er/sie/es (he/she/it), wir (we), ihr (you-pl), sie/Sie (they/You-formal). Possessives: mein (my), dein (your), sein (his), ihr (her).',
      examples: [
        { de: 'Mein Vater heißt Hans.', en: 'My father is called Hans.', vi: 'Bố tôi tên Hans.' },
        { de: 'Das ist meine Schwester.', en: 'This is my sister.', vi: 'Đây là em gái tôi.' }
      ]
    },
    targetCategories: ['personal']
  },
  {
    id: 4,
    title: 'Verb "sein" (to be)',
    description: 'Learn the most important German verb - sein',
    grammarPoint: {
      topic: 'Conjugation of "sein"',
      explanation: 'sein (to be): ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind. This irregular verb is essential for descriptions and states.',
      examples: [
        { de: 'Ich bin Student.', en: 'I am a student.', vi: 'Tôi là sinh viên.' },
        { de: 'Sie ist sehr schön.', en: 'She is very beautiful.', vi: 'Cô ấy rất đẹp.' }
      ]
    },
    targetCategories: ['verbs', 'adjectives']
  },
  {
    id: 5,
    title: 'Food & Drinks',
    description: 'Order food and drinks at restaurants',
    grammarPoint: {
      topic: 'Nouns with Articles',
      explanation: 'German nouns have genders: der (masculine), die (feminine), das (neuter). Food vocabulary: der Kaffee, die Milch, das Brot. Always learn nouns with their articles!',
      examples: [
        { de: 'Ich hätte gerne einen Kaffee.', en: 'I would like a coffee.', vi: 'Tôi muốn một cà phê.' },
        { de: 'Das Essen schmeckt gut.', en: 'The food tastes good.', vi: 'Món ăn ngon.' }
      ]
    },
    targetCategories: ['food']
  },
  {
    id: 6,
    title: 'Shopping & Money',
    description: 'Go shopping and handle money',
    grammarPoint: {
      topic: 'Question Words',
      explanation: 'Important question words: Was? (What?), Wo? (Where?), Wie? (How?), Wie viel? (How much?), Wann? (When?), Warum? (Why?)',
      examples: [
        { de: 'Wie viel kostet das?', en: 'How much does this cost?', vi: 'Cái này giá bao nhiêu?' },
        { de: 'Wo ist der Supermarkt?', en: 'Where is the supermarket?', vi: 'Siêu thị ở đâu?' }
      ]
    },
    targetCategories: ['shopping']
  },
  {
    id: 7,
    title: 'Time & Days',
    description: 'Tell time and talk about days of the week',
    grammarPoint: {
      topic: 'Time Expressions',
      explanation: 'Days: Montag, Dienstag, Mittwoch... Time phrases: morgens (in morning), nachmittags (in afternoon), abends (in evening), nachts (at night).',
      examples: [
        { de: 'Heute ist Montag.', en: 'Today is Monday.', vi: 'Hôm nay là thứ Hai.' },
        { de: 'Wir treffen uns morgens.', en: 'We meet in the morning.', vi: 'Chúng ta gặp nhau vào buổi sáng.' }
      ]
    },
    targetCategories: ['time']
  },
  {
    id: 8,
    title: 'Transport & Directions',
    description: 'Navigate around town and use public transport',
    grammarPoint: {
      topic: 'Prepositions of Place',
      explanation: 'Direction prepositions: zu (to), nach (to/after), in (in/into), an (at/on), auf (on). "Ich fahre mit dem Bus" (I go by bus).',
      examples: [
        { de: 'Wo ist der Bahnhof?', en: 'Where is the train station?', vi: 'Ga tàu ở đâu?' },
        { de: 'Gehen Sie geradeaus.', en: 'Go straight ahead.', vi: 'Đi thẳng.' }
      ]
    },
    targetCategories: ['transport', 'orientation']
  },
  {
    id: 9,
    title: 'Health & Body Parts',
    description: 'Talk about health issues and body parts',
    grammarPoint: {
      topic: 'Expressing Pain',
      explanation: 'To express pain: "Mein ... tut weh" (My ... hurts). Der Kopf (head), der Bauch (stomach), der Rücken (back), die Hand (hand).',
      examples: [
        { de: 'Mein Kopf tut weh.', en: 'My head hurts.', vi: 'Đầu tôi đau.' },
        { de: 'Ich brauche ein Medikament.', en: 'I need medicine.', vi: 'Tôi cần thuốc.' }
      ]
    },
    targetCategories: ['health']
  },
  {
    id: 10,
    title: 'Home & Surroundings',
    description: 'Describe your home and environment',
    grammarPoint: {
      topic: 'Dative Case - Location',
      explanation: 'Dative case for location: in dem/im (in the), an dem/am (at the), auf dem (on the). "Ich wohne in dem Haus" → "Ich wohne im Haus".',
      examples: [
        { de: 'Ich wohne in einer Wohnung.', en: 'I live in an apartment.', vi: 'Tôi sống trong một căn hộ.' },
        { de: 'Der Park ist schön.', en: 'The park is beautiful.', vi: 'Công viên đẹp.' }
      ]
    },
    targetCategories: ['surrounding']
  },
  {
    id: 11,
    title: 'Weather & Nature',
    description: 'Talk about weather and natural phenomena',
    grammarPoint: {
      topic: 'Impersonal "es"',
      explanation: 'Weather expressions use "es": Es regnet (It rains), Es schneit (It snows), Es ist sonnig (It is sunny).',
      examples: [
        { de: 'Es regnet heute.', en: 'It rains today.', vi: 'Hôm nay trời mưa.' },
        { de: 'Die Sonne scheint.', en: 'The sun shines.', vi: 'Mặt trời chiếu sáng.' }
      ]
    },
    targetCategories: ['surrounding']
  },
  {
    id: 12,
    title: 'Technology & Communication',
    description: 'Use technology and communicate',
    grammarPoint: {
      topic: 'Separable Verbs',
      explanation: 'Some verbs split in present tense: anrufen (to call) → Ich rufe an. aufladen (to charge) → Ich lade auf.',
      examples: [
        { de: 'Ich lade mein Handy auf.', en: 'I charge my phone.', vi: 'Tôi sạc điện thoại.' },
        { de: 'Das Passwort ist wichtig.', en: 'The password is important.', vi: 'Mật khẩu quan trọng.' }
      ]
    },
    targetCategories: ['technology']
  },
  {
    id: 13,
    title: 'Common Adjectives',
    description: 'Describe people, places, and things',
    grammarPoint: {
      topic: 'Adjective Usage (Predicative)',
      explanation: 'Predicative adjectives (after "sein", "werden"): Das Haus ist groß. Der Mann ist alt. No declension needed.',
      examples: [
        { de: 'Das Auto ist neu.', en: 'The car is new.', vi: 'Chiếc xe mới.' },
        { de: 'Sie ist sehr jung.', en: 'She is very young.', vi: 'Cô ấy rất trẻ.' }
      ]
    },
    targetCategories: ['adjectives']
  },
  {
    id: 14,
    title: 'Verb "haben" (to have)',
    description: 'Learn the second most important verb',
    grammarPoint: {
      topic: 'Conjugation of "haben"',
      explanation: 'haben (to have): ich habe, du hast, er/sie/es hat, wir haben, ihr habt, sie/Sie haben. Used for possession and in perfect tense.',
      examples: [
        { de: 'Ich habe ein Auto.', en: 'I have a car.', vi: 'Tôi có một chiếc xe.' },
        { de: 'Wir haben Zeit.', en: 'We have time.', vi: 'Chúng ta có thời gian.' }
      ]
    },
    targetCategories: ['verbs']
  },
  {
    id: 15,
    title: 'Regular Verbs - Present Tense',
    description: 'Conjugate regular verbs in present tense',
    grammarPoint: {
      topic: 'Regular Verb Conjugation',
      explanation: 'Regular verbs: lernen → ich lerne, du lernst, er/sie/es lernt, wir lernen, ihr lernt, sie/Sie lernen. Pattern: stem + endings (e, st, t, en, t, en).',
      examples: [
        { de: 'Ich lerne Deutsch.', en: 'I learn German.', vi: 'Tôi học tiếng Đức.' },
        { de: 'Wir machen Hausaufgaben.', en: 'We do homework.', vi: 'Chúng tôi làm bài tập về nhà.' }
      ]
    },
    targetCategories: ['verbs', 'frequency']
  },
  {
    id: 16,
    title: 'Modal Verbs',
    description: 'Express ability, permission, and necessity',
    grammarPoint: {
      topic: 'Modal Verb "können"',
      explanation: 'können (can/to be able to): ich kann, du kannst, er/sie/es kann, wir können, ihr könnt, sie/Sie können. Modal + infinitive at end.',
      examples: [
        { de: 'Ich kann Deutsch sprechen.', en: 'I can speak German.', vi: 'Tôi có thể nói tiếng Đức.' },
        { de: 'Sie kann gut kochen.', en: 'She can cook well.', vi: 'Cô ấy nấu ăn ngon.' }
      ]
    },
    targetCategories: ['verbs', 'frequency']
  },
  {
    id: 17,
    title: 'More Essential Verbs',
    description: 'Expand your verb vocabulary',
    grammarPoint: {
      topic: 'Irregular Verbs',
      explanation: 'Some verbs change stem vowel in 2nd/3rd person singular: geben → du gibst, er gibt. sehen → du siehst, er sieht.',
      examples: [
        { de: 'Er gibt mir das Buch.', en: 'He gives me the book.', vi: 'Anh ấy đưa cho tôi cuốn sách.' },
        { de: 'Ich sehe den Film.', en: 'I see/watch the film.', vi: 'Tôi xem bộ phim.' }
      ]
    },
    targetCategories: ['verbs', 'frequency']
  },
  {
    id: 18,
    title: 'Negation',
    description: 'Say "no" and negate sentences',
    grammarPoint: {
      topic: 'nicht vs. kein',
      explanation: 'nicht negates verbs/adjectives: Ich komme nicht. kein negates nouns (replaces ein): Ich habe kein Auto.',
      examples: [
        { de: 'Ich verstehe das nicht.', en: 'I don\'t understand that.', vi: 'Tôi không hiểu điều đó.' },
        { de: 'Sie hat keine Zeit.', en: 'She has no time.', vi: 'Cô ấy không có thời gian.' }
      ]
    },
    targetCategories: ['frequency']
  },
  {
    id: 19,
    title: 'Common Phrases & Idioms',
    description: 'Learn useful everyday phrases',
    grammarPoint: {
      topic: 'Fixed Expressions',
      explanation: 'Some phrases are fixed: Wie geht\'s? (How are you?), Es geht. (It\'s okay.), Kein Problem! (No problem!)',
      examples: [
        { de: 'Wie geht es dir?', en: 'How are you?', vi: 'Bạn khỏe không?' },
        { de: 'Alles klar!', en: 'All clear! / Understood!', vi: 'Rõ rồi!' }
      ]
    },
    targetCategories: ['sentences', 'frequency']
  },
  {
    id: 20,
    title: 'Review & Advanced Vocabulary',
    description: 'Review everything and learn additional useful words',
    grammarPoint: {
      topic: 'Word Order - Main Clause',
      explanation: 'German word order: Subject - Verb - Object (SVO). Verb is always in 2nd position. Time-Manner-Place (TeKaMoLo) for adverbials.',
      examples: [
        { de: 'Ich gehe heute mit dem Bus zur Schule.', en: 'I go to school today by bus.', vi: 'Hôm nay tôi đi học bằng xe buýt.' },
        { de: 'Wir lernen jeden Tag neue Wörter.', en: 'We learn new words every day.', vi: 'Chúng tôi học từ mới mỗi ngày.' }
      ]
    },
    targetCategories: ['frequency']
  }
];

// Organize vocabulary into units
const units = [];
const vocab = [...baseData.vocabulary];
const WORDS_PER_UNIT = 25;

for (let i = 0; i < unitBlueprints.length; i++) {
  const blueprint = unitBlueprints[i];
  const unitWords = [];

  // Priority: words from target categories (but limit to WORDS_PER_UNIT total)
  for (const category of blueprint.targetCategories) {
    if (unitWords.length >= WORDS_PER_UNIT) break;

    const needed = WORDS_PER_UNIT - unitWords.length;
    const categoryWords = vocab.filter(v => v.category === category).slice(0, needed);
    unitWords.push(...categoryWords);

    // Remove from vocab pool
    for (const word of categoryWords) {
      const idx = vocab.findIndex(v => v.word === word.word);
      if (idx >= 0) vocab.splice(idx, 1);
    }
  }

  // Fill remaining slots with any available words (frequency or others)
  while (unitWords.length < WORDS_PER_UNIT && vocab.length > 0) {
    unitWords.push(vocab.shift());
  }

  // Exactly 25 words per unit (or less for last units if vocab exhausted)
  const finalWords = unitWords.slice(0, WORDS_PER_UNIT);

  units.push({
    unitId: blueprint.id,
    title: blueprint.title,
    description: blueprint.description,
    grammarPoint: blueprint.grammarPoint,
    vocabularyCount: finalWords.length,
    vocabulary: finalWords.map(word => ({
      ...word,
      meaning_vi: word.meaning_en, // Placeholder - will translate later
      examples: [] // Will be filled by Qwen 32B or Tatoeba
    }))
  });

  console.log(`✓ Unit ${blueprint.id}: ${blueprint.title} (${finalWords.length} words) [Remaining pool: ${vocab.length}]`);
}

// Create curriculum structure
const curriculum = {
  language: 'German',
  level: 'A1',
  title: 'German A1 Complete Course',
  description: '20 structured units covering 500 core German A1 vocabulary words with grammar explanations',
  totalUnits: units.length,
  totalWords: units.reduce((sum, u) => sum + u.vocabularyCount, 0),
  createdAt: new Date().toISOString(),
  sources: baseData.sources || [baseData.source],
  license: baseData.license,
  units
};

// Save curriculum
const outputDir = path.join(process.cwd(), 'storage/curriculum');
await fs.mkdir(outputDir, { recursive: true });

const outputPath = path.join(outputDir, 'german_a1_curriculum.json');
await fs.writeFile(outputPath, JSON.stringify(curriculum, null, 2), 'utf-8');

console.log(`\n✅ Curriculum saved to: ${outputPath}`);
console.log(`📊 Summary:`);
console.log(`   Total Units: ${curriculum.totalUnits}`);
console.log(`   Total Words: ${curriculum.totalWords}`);
console.log(`   Words per Unit: ~${Math.round(curriculum.totalWords / curriculum.totalUnits)}`);
console.log(`\n⚠️  Note: Examples for each word need to be generated (Step 3)`);
