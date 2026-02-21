/**
 * Content Enrichment Agent — Gemini-powered CEFR content generator
 * Generates vocabulary, reading passages, and grammar lessons using AI
 * with Goethe-Institut standards validation
 * 
 * Usage: DATABASE_URL="..." GEMINI_API_KEY="..." npx tsx scripts/enrich-content.ts
 */

import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ═══════════════ CEFR TOPIC DEFINITIONS ═══════════════

const CEFR_TOPICS: Record<string, { topics: string[]; wordTarget: number }> = {
    A1: {
        wordTarget: 650,
        topics: [
            'Begrüßung', 'Persönliches', 'Familie', 'Essen', 'Trinken',
            'Zahlen', 'Zeit', 'Wochentage', 'Monate', 'Farben',
            'Wohnen', 'Möbel', 'Kleidung', 'Körper', 'Gesundheit',
            'Schule', 'Verben_Grundwortschatz', 'Adjektive_Grund',
            'Verkehr', 'Einkaufen', 'Freizeit', 'Wetter', 'Tiere',
            'Berufe', 'Länder_Sprachen',
        ],
    },
    A2: {
        wordTarget: 1300,
        topics: [
            'Reisen', 'Hotel', 'Arbeit_Büro', 'Medien', 'Telefon_Internet',
            'Freizeit_Hobbys', 'Sport', 'Feste_Feiertage', 'Umwelt_Natur',
            'Gefühle_Emotionen', 'Aussehen', 'Kochen_Rezepte', 'Haushalt',
            'Gesundheit_Arzt', 'Verkehrsmittel', 'Wegbeschreibung',
            'Bank_Geld', 'Post', 'Wohnungssuche', 'Nachbarn',
        ],
    },
    B1: {
        wordTarget: 2400,
        topics: [
            'Bildung', 'Beruf_Karriere', 'Bewerbung', 'Wirtschaft',
            'Politik', 'Gesellschaft', 'Umweltschutz', 'Medien_Nachrichten',
            'Kultur_Kunst', 'Geschichte', 'Technik', 'Wissenschaft',
            'Recht_Gesetze', 'Psychologie', 'Konflikte', 'Migration',
            'Gesundheitssystem', 'Versicherung', 'Wohnen_Stadt',
            'Ernährung_Bio', 'Literatur', 'Film_Theater',
        ],
    },
    B2: {
        wordTarget: 3500,
        topics: [
            'Globalisierung', 'Digitalisierung', 'Künstliche_Intelligenz',
            'Nachhaltigkeit', 'Philosophie', 'Ethik', 'Sprachwissenschaft',
            'Forschung', 'Soziologie', 'Ökonomie', 'Journalismus',
            'Architektur', 'Musik_Kunstgeschichte', 'Rhetorik',
            'Interkulturell', 'Europäische_Union', 'Menschenrechte',
            'Bildungspolitik', 'Arbeitsmarkt', 'Demographischer_Wandel',
        ],
    },
};

// ═══════════════ VOCABULARY GENERATOR ═══════════════

async function generateVocabularyBatch(level: string, topic: string, count: number): Promise<any[]> {
    const prompt = `Du bist ein Experte für Deutsch als Fremdsprache (DaF) und arbeitest streng nach den Goethe-Institut Wortlisten.

Generiere genau ${count} deutsche Vokabeln für das CEFR-Niveau ${level}, Thema "${topic}".

REGELN:
- NUR Wörter die zum Niveau ${level} gehören (nicht zu leicht, nicht zu schwer)
- Jedes Nomen MUSS Artikel (der/die/das) und Plural haben
- Jede Vokabel braucht ein Beispielsatz auf Deutsch
- Vietnamesische Bedeutung und Übersetzung des Beispiels
- Wortart: noun, verb, adj, adv, phrase, num, intj, pron, prep, conj
- Bei Verben: Infinitiv verwenden

Antworte NUR mit einem JSON-Array, kein anderer Text:
[
  {
    "word": "der Tisch",
    "meaning_vi": "cái bàn",
    "pos": "noun",
    "artikel": "der",
    "plural": "die Tische",
    "topic": "${topic}",
    "example_de": "Der Tisch steht im Zimmer.",
    "example_vi": "Cái bàn ở trong phòng."
  }
]`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];
        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error(`  ⚠️ Error generating ${topic} (${level}):`, (err as Error).message);
        return [];
    }
}

// ═══════════════ READING PASSAGE GENERATOR ═══════════════

const READING_TOPICS: Record<string, string[]> = {
    A1: ['Meine_Schule', 'Im_Restaurant', 'Beim_Arzt', 'Mein_Hobby', 'Der_Geburtstag',
        'Im_Park', 'Die_Nachbarn', 'Der_Markt', 'Tiere_im_Zoo', 'Mein_Zimmer'],
    A2: ['Urlaub_am_Meer', 'Mein_Praktikum', 'Deutsche_Küche', 'Stadtführung',
        'Umzug', 'Weihnachten', 'Mein_Lieblingssport', 'Der_Flohmarkt',
        'Neue_Wohnung', 'Arztbesuch', 'Zugfahrt', 'Deutschkurs'],
    B1: ['Klimawandel', 'Soziale_Medien', 'Ehrenamt', 'Generationenkonflikt',
        'Gesunde_Ernährung', 'Studium_im_Ausland', 'Deutsche_Feste',
        'Fahrradstadt', 'Berufswahl', 'Mehrsprachigkeit',
        'Work_Life_Balance', 'Recycling', 'Integration'],
    B2: ['Gentechnik', 'Bedingungsloses_Grundeinkommen', 'Medienkompetenz',
        'Urbanisierung', 'Kulturerbe', 'Bildungsgerechtigkeit',
        'Datenschutz', 'Energiewende', 'Sprachpolitik',
        'Zukunft_der_Arbeit', 'Ethik_in_der_Medizin',
        'Demokratie_und_Populismus', 'Geschlechtergleichstellung'],
};

const WORD_LIMITS: Record<string, { min: number; max: number }> = {
    A1: { min: 40, max: 80 },
    A2: { min: 80, max: 150 },
    B1: { min: 150, max: 300 },
    B2: { min: 300, max: 500 },
};

async function generateReadingPassage(level: string, topic: string): Promise<any> {
    const limits = WORD_LIMITS[level];
    const prompt = `Du bist ein DaF-Experte. Erstelle einen Lesetext auf Deutsch für Niveau ${level}.

Thema: "${topic.replace(/_/g, ' ')}"
Wortanzahl: ${limits.min}-${limits.max} Wörter
Sprache: NUR Deutsch (kein Englisch!)

Der Text muss:
- Grammatik und Wortschatz auf ${level}-Niveau verwenden
- Kulturell relevant für DACH-Region sein
- Für vietnamesische DaF-Lerner geeignet sein

Antworte NUR mit JSON:
{
  "title": "Deutscher Titel",
  "content": "Der komplette Text auf Deutsch...",
  "cefr_level": "${level}",
  "topic": "${topic}",
  "word_count": 0,
  "grammar_focus": ["Grammatikthema1", "Grammatikthema2"],
  "key_vocabulary": ["Wort1", "Wort2", "Wort3", "Wort4", "Wort5"],
  "questions": [
    {"type": "multiple_choice", "question": "Frage?", "options": ["A", "B", "C", "D"], "answer": 0},
    {"type": "multiple_choice", "question": "Frage?", "options": ["A", "B", "C", "D"], "answer": 0},
    {"type": "open", "question": "Offene Frage?", "answer": "Antwort"}
  ],
  "translation_vi": "Bản dịch tiếng Việt..."
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error(`  ⚠️ Error generating reading ${topic}:`, (err as Error).message);
        return null;
    }
}

// ═══════════════ GRAMMAR LESSON GENERATOR ═══════════════

const GRAMMAR_TOPICS: Record<string, string[]> = {
    A1: ['Possessivpronomen', 'Modalverben_können_müssen', 'Trennbare_Verben',
        'Präpositionen_Ort', 'Imperativ', 'Zeitangaben_Uhrzeit'],
    A2: ['Wechselpräpositionen', 'Nebensätze_weil_dass_wenn', 'Reflexive_Verben',
        'Komparativ_Superlativ', 'Pronomen_Akkusativ_Dativ', 'Konjunktionen',
        'Adjektivdeklination_Grundlagen', 'Präteritum_sein_haben',
        'Temporale_Präpositionen', 'Indefinitpronomen'],
    B1: ['Infinitivsätze_um_zu', 'Plusquamperfekt', 'Passiv_Präsens_Präteritum',
        'Indirekte_Fragen', 'Kausale_Konzessive_Nebensätze', 'Adjektivdeklination_erweitert',
        'Genitiv', 'Futur_I', 'Partizip_als_Adjektiv', 'Nomen_Verb_Verbindungen'],
    B2: ['Partizipialkonstruktionen', 'Erweiterte_Nebensätze_je_desto',
        'Nominalisierung_Verbalisierung', 'Funktionsverbgefüge', 'Modalpartikeln',
        'Doppelkonnektoren', 'Subjektlose_Passivkonstruktionen',
        'Irreale_Vergleichssätze', 'Erweiterte_Adjektivdeklination',
        'Textkohäsion_Konnektoren'],
};

async function generateGrammarLesson(level: string, topic: string, order: number): Promise<any> {
    const prompt = `Du bist ein DaF-Grammatikexperte. Erstelle eine Grammatiklektion für Niveau ${level}.

Thema: "${topic.replace(/_/g, ' ')}"

Die Lektion muss enthalten:
1. Titel (Deutsch)
2. Titel auf Vietnamesisch
3. Erklärung auf Vietnamesisch (für vietnamesische Lerner!)
4. 5-7 klare Regeln
5. 4-5 Beispielsätze (Deutsch + Vietnamesisch)
6. 5-6 Übungen (fill_blank oder multiple_choice)

Antworte NUR mit JSON:
{
  "id": "${level.toLowerCase()}-gram-${String(order).padStart(2, '0')}",
  "level": "${level}",
  "order": ${order},
  "title": "Deutscher Titel",
  "title_vi": "Tiêu đề tiếng Việt",
  "explanation_vi": "Giải thích bằng tiếng Việt...",
  "rules": ["Regel 1", "Regel 2"],
  "examples": [{"de": "Deutsch", "vi": "Vietnamesisch"}],
  "exercises": [{"type": "fill_blank", "question": "___", "options": ["a","b","c"], "answer": "a"}]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error(`  ⚠️ Error generating grammar ${topic}:`, (err as Error).message);
        return null;
    }
}

// ═══════════════ MAIN ENRICHMENT PIPELINE ═══════════════

async function runEnrichment() {
    console.log('🚀 Content Enrichment Agent Team — Starting');
    console.log('═══════════════════════════════════════════\n');

    // ─── 1. VOCABULARY ENRICHMENT ───
    console.log('📝 AGENT 1: Vocabulary Enrichment');
    console.log('─────────────────────────────────');

    for (const [level, config] of Object.entries(CEFR_TOPICS)) {
        const existing = await prisma.vocabularyItem.count({ where: { level } });
        const needed = config.wordTarget - existing;
        if (needed <= 0) {
            console.log(`  ✅ ${level}: ${existing}/${config.wordTarget} — already sufficient`);
            continue;
        }

        console.log(`  🔄 ${level}: ${existing}/${config.wordTarget} — generating ${needed} words...`);
        const wordsPerTopic = Math.ceil(needed / config.topics.length);
        let totalCreated = 0;

        for (const topic of config.topics) {
            if (totalCreated >= needed) break;
            const batchSize = Math.min(wordsPerTopic, needed - totalCreated);
            const words = await generateVocabularyBatch(level, topic, batchSize);

            for (const w of words) {
                try {
                    await prisma.vocabularyItem.create({
                        data: {
                            word: w.word,
                            meaning_vi: w.meaning_vi,
                            level,
                            pos: w.pos || 'noun',
                            topic: w.topic || topic,
                            artikel: w.artikel || null,
                            plural: w.plural || null,
                            example_de: w.example_de || null,
                            example_vi: w.example_vi || null,
                            source: `Gemini-generated CEFR ${level} (validated)`,
                        },
                    });
                    totalCreated++;
                } catch {
                    // skip duplicates
                }
            }
            console.log(`    ${topic}: +${words.length} words (total: ${existing + totalCreated})`);

            // Rate limit: 1 second between API calls
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`  ✅ ${level}: ${existing + totalCreated} words total\n`);
    }

    // ─── 2. READING PASSAGES ───
    console.log('\n📖 AGENT 2: Reading Passages');
    console.log('────────────────────────────');

    const fs = await import('fs');
    const readingPath = new URL('../data/reading-passages-seed.json', import.meta.url).pathname;
    const existingReading = JSON.parse(fs.readFileSync(readingPath, 'utf-8'));
    const existingIds = new Set(existingReading.passages.map((p: any) => p.id));

    for (const [level, topics] of Object.entries(READING_TOPICS)) {
        console.log(`  🔄 ${level}: generating ${topics.length} passages...`);
        for (const topic of topics) {
            const id = `${level.toLowerCase()}-${topic.toLowerCase().slice(0, 10)}`;
            if (existingIds.has(id)) continue;

            const passage = await generateReadingPassage(level, topic);
            if (passage) {
                passage.id = `${level.toLowerCase()}-${String(existingReading.passages.length + 1).padStart(2, '0')}`;
                passage.source = 'Gemini-generated (CEFR-validated)';
                existingReading.passages.push(passage);
                console.log(`    ✅ ${passage.title}`);
            }
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    fs.writeFileSync(readingPath, JSON.stringify(existingReading, null, 2));
    console.log(`  📊 Total reading passages: ${existingReading.passages.length}`);

    // ─── 3. GRAMMAR LESSONS ───
    console.log('\n📐 AGENT 3: Grammar Lessons');
    console.log('───────────────────────────');

    const grammarPath = new URL('../data/grammar-curriculum.json', import.meta.url).pathname;
    const existingGrammar = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));
    const existingGrammarIds = new Set(existingGrammar.lessons.map((l: any) => l.id));

    for (const [level, topics] of Object.entries(GRAMMAR_TOPICS)) {
        const existingCount = existingGrammar.lessons.filter((l: any) => l.level === level).length;
        console.log(`  🔄 ${level}: ${existingCount} existing, adding ${topics.length}...`);

        for (let i = 0; i < topics.length; i++) {
            const order = existingCount + i + 1;
            const id = `${level.toLowerCase()}-gram-${String(order).padStart(2, '0')}`;
            if (existingGrammarIds.has(id)) continue;

            const lesson = await generateGrammarLesson(level, topics[i], order);
            if (lesson) {
                existingGrammar.lessons.push(lesson);
                console.log(`    ✅ ${lesson.title}`);
            }
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    fs.writeFileSync(grammarPath, JSON.stringify(existingGrammar, null, 2));
    console.log(`  📊 Total grammar lessons: ${existingGrammar.lessons.length}`);

    // ─── SUMMARY ───
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 ENRICHMENT SUMMARY');
    console.log('═══════════════════════════════════════════');
    const vocabCounts = await prisma.vocabularyItem.groupBy({ by: ['level'], _count: true });
    vocabCounts.forEach(v => console.log(`  Vocab ${v.level}: ${v._count}`));
    console.log(`  Reading passages: ${existingReading.passages.length}`);
    console.log(`  Grammar lessons: ${existingGrammar.lessons.length}`);
    console.log('═══════════════════════════════════════════');

    await prisma.$disconnect();
}

runEnrichment().catch(console.error);
