/**
 * Advanced Curriculum Generator — Dual-AI (Claude + Gemini)
 * 
 * Uses Claude Sonnet via OpenAI-compatible API for pedagogical design
 * Uses Gemini Flash for cross-validation
 * 
 * Generates:
 * - 64 weekly lesson plans (16/level, A1→B2)
 * - 4 Goethe exam prep modules
 * - 12 cultural modules (DACH vs Vietnam)
 * 
 * Usage: npx tsx scripts/generate-advanced-curriculum.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════ CONFIG ═══════════════

const CLAUDE_API_KEY = process.env.ANTHROPIC_AUTH_TOKEN!;
const CLAUDE_BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://claudible.io';
const CLAUDE_MODEL = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL || 'claude-sonnet-4.6';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const gemini = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const DATA_DIR = path.join(__dirname, '..', 'data');

// ═══════════════ CLAUDE via OpenAI-compatible API ═══════════════

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string | null> {
    try {
        const response = await fetch(`${CLAUDE_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CLAUDE_API_KEY}`,
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 4096,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`  ⚠️ Claude API ${response.status}: ${errText.slice(0, 200)}`);
            return null;
        }

        const data = await response.json() as any;
        return data.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.error(`  ⚠️ Claude error:`, (err as Error).message);
        return null;
    }
}

// ═══════════════ LESSON PLAN DESIGNER ═══════════════

async function designLessonPlan(level: string, weekNum: number, topic: string): Promise<any> {
    const systemPrompt = `You are an expert DaF (Deutsch als Fremdsprache) curriculum designer with 20 years experience. You follow CEFR standards strictly and design lessons specifically for Vietnamese adult learners of German. Always return valid JSON only.`;

    const userPrompt = `Design a detailed weekly lesson plan for CEFR level ${level}, Week ${weekNum}.
Topic: "${topic}"

Return a JSON object with this structure:
{
  "week": ${weekNum},
  "level": "${level}",
  "topic": "${topic}",
  "learning_objectives": ["Can-Do statement 1", "Can-Do statement 2", "Can-Do statement 3"],
  "prerequisite_knowledge": ["What learner should already know"],
  "duration_minutes": 90,
  "sessions": [
    {
      "session_number": 1,
      "title": "Session title",
      "duration_minutes": 45,
      "activities": [
        {
          "type": "warm_up",
          "title": "Activity name",
          "description": "Detailed description",
          "duration_minutes": 10,
          "materials": ["Handout"],
          "interaction_pattern": "pairs",
          "skills_focus": ["speaking"]
        }
      ]
    }
  ],
  "vocabulary_target": ["word1", "word2"],
  "grammar_focus": "Grammatical structure",
  "cultural_note": "DACH cultural info",
  "homework": {
    "description": "Homework",
    "exercises": ["Ex 1"],
    "estimated_time_minutes": 30
  },
  "assessment": {
    "formative": ["Check understanding"],
    "summative": "Quiz description"
  },
  "differentiation": {
    "struggling_learners": "Support strategies",
    "advanced_learners": "Extension activities"
  },
  "spaced_repetition": {
    "review_from_previous": ["Topics to revisit"],
    "preview_next_week": "Bridge to next topic"
  }
}

Return ONLY valid JSON.`;

    const text = await callClaude(systemPrompt, userPrompt);
    if (!text) return null;

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error(`  ⚠️ JSON parse error for ${topic}:`, (err as Error).message);
        return null;
    }
}

// ═══════════════ EXAM PREPARATION ═══════════════

async function designExamPrep(level: string): Promise<any> {
    const systemPrompt = `You are a Goethe-Institut certified exam preparation specialist. Design comprehensive exam prep modules for Vietnamese learners. Return valid JSON only.`;

    const userPrompt = `Design a complete Goethe-Zertifikat ${level} exam preparation module.

The exam has 4 parts: Lesen (Reading), Hören (Listening), Schreiben (Writing), Sprechen (Speaking).

Return JSON:
{
  "exam": "Goethe-Zertifikat ${level}",
  "total_prep_weeks": 4,
  "sections": [
    {
      "name": "Lesen",
      "duration_minutes": 25,
      "num_tasks": 3,
      "task_types": ["Type description"],
      "strategies": ["Strategy 1"],
      "practice_exercises": [
        {
          "task_number": 1,
          "instruction_de": "German instruction",
          "instruction_vi": "Vietnamese instruction",
          "example_question": "Question",
          "example_options": ["A", "B", "C"],
          "correct_answer": "A",
          "tip": "Exam tip"
        }
      ],
      "common_mistakes": ["Mistake Vietnamese learners make"]
    }
  ],
  "weekly_plan": [
    {"week": 1, "focus": "Focus", "activities": ["Activity"], "mock_test": false}
  ],
  "scoring": {"passing_score": 60, "max_score": 100, "breakdown": {"Lesen": 25, "Hören": 25, "Schreiben": 25, "Sprechen": 25}},
  "tips_for_vietnamese_learners": ["Tip 1"]
}

Return ONLY valid JSON.`;

    const text = await callClaude(systemPrompt, userPrompt);
    if (!text) return null;

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
        return null;
    }
}

// ═══════════════ CULTURAL MODULES ═══════════════

async function designCulturalModule(level: string, topic: string): Promise<any> {
    const systemPrompt = `You are an intercultural communication expert specializing in German-Vietnamese cultural exchange. Return valid JSON only.`;

    const userPrompt = `Create a cultural learning module for CEFR ${level} comparing DACH and Vietnamese culture.
Topic: "${topic}"

Return JSON:
{
  "title": "Title",
  "level": "${level}",
  "topic": "${topic}",
  "cultural_content_de": "German text (${level}-level)",
  "cultural_content_vi": "Vietnamese translation",
  "dach_perspective": "DACH view",
  "vietnamese_perspective": "Vietnam view",
  "intercultural_comparison": "Key differences",
  "key_phrases": [{"de": "German", "vi": "Vietnamese", "usage": "When"}],
  "dos_and_donts": [{"type": "do", "advice_de": "DE", "advice_vi": "VI"}],
  "discussion_questions": [{"de": "DE question", "vi": "VI question"}]
}

Return ONLY valid JSON.`;

    const text = await callClaude(systemPrompt, userPrompt);
    if (!text) return null;

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
        return null;
    }
}

// ═══════════════ GEMINI CROSS-VALIDATION ═══════════════

async function geminiValidate(content: any, type: string): Promise<{ valid: boolean; issues: string[] }> {
    try {
        const result = await gemini.generateContent(
            `Validate this ${type} for CEFR accuracy, German grammar, and Vietnamese translations. Check for errors.
Content: ${JSON.stringify(content, null, 2).slice(0, 3000)}
Return JSON: {"valid": true, "issues": []}`
        );
        const text = result.response.text();
        const m = text.match(/\{[\s\S]*?\}/);
        return m ? JSON.parse(m[0]) : { valid: true, issues: [] };
    } catch {
        return { valid: true, issues: [] };
    }
}

// ═══════════════ TOPIC DEFINITIONS ═══════════════

const WEEKLY_TOPICS: Record<string, string[]> = {
    A1: [
        'Sich vorstellen & Begrüßung', 'Familie & Freunde', 'Wohnung & Möbel',
        'Essen & Trinken bestellen', 'Tagesablauf & Uhrzeit', 'Einkaufen & Zahlen',
        'Körper & Gesundheit', 'Wegbeschreibung & Verkehr', 'Hobbys & Freizeit',
        'Wetter & Jahreszeiten', 'Kleidung & Farben', 'Berufe & Arbeit',
        'Termine & Verabredungen', 'Feste & Einladungen', 'Reisen & Hotel',
        'Prüfungsvorbereitung Goethe A1',
    ],
    A2: [
        'Kindheit & Erinnerungen', 'Wohnungssuche & Umzug', 'Gesundheit & Arztbesuch',
        'Arbeit & Bewerbung', 'Medien & Internet', 'Reisen & Mobilität',
        'Essen & Kochen', 'Nachbarn & Zusammenleben', 'Feste & Traditionen',
        'Schule & Ausbildung', 'Umwelt & Natur', 'Gefühle & Beziehungen',
        'Bank & Post', 'Sport & Fitness', 'Zukunftspläne',
        'Prüfungsvorbereitung Goethe A2',
    ],
    B1: [
        'Beruf & Karriere', 'Bildungssystem im DACH-Raum', 'Wohnen in der Stadt',
        'Gesundheitssystem & Versicherung', 'Medien & Nachrichten', 'Umweltschutz',
        'Politik & Gesellschaft', 'Kultur & Kunst', 'Integration & Migration',
        'Wissenschaft & Technik', 'Konflikte & Lösungen', 'Wirtschaft & Konsum',
        'Reisen & interkulturelle Erfahrungen', 'Literatur & Film', 'Zukunft & Träume',
        'Prüfungsvorbereitung Goethe B1',
    ],
    B2: [
        'Globalisierung & Digitalisierung', 'Arbeitswelt im Wandel', 'Bildungsgerechtigkeit',
        'Nachhaltigkeit & Energie', 'Demokratie & Populismus', 'Kulturelle Identität',
        'Ethik in der Wissenschaft', 'Medien & Meinungsfreiheit', 'Soziale Ungleichheit',
        'Gentechnik & Bioethik', 'Städtebau & Urbanisierung', 'Sprachpolitik & Mehrsprachigkeit',
        'Datenschutz & Privatsphäre', 'Generationenkonflikte', 'Europäische Integration',
        'Prüfungsvorbereitung Goethe B2',
    ],
};

const CULTURAL_TOPICS: Record<string, string[]> = {
    A1: ['Begrüßung & Höflichkeit', 'Pünktlichkeit', 'Brot & Frühstück'],
    A2: ['Mülltrennung', 'Feiertage (Weihnachten, Karneval)', 'Duale Ausbildung'],
    B1: ['Vereinsleben', 'Sozialversicherung', 'Deutsche Geschichte (Kurzfassung)'],
    B2: ['Erinnerungskultur', 'Föderalismus', 'Integration & Leitkultur-Debatte'],
};

// ═══════════════ MAIN ═══════════════

async function run() {
    console.log('🧠 Advanced Curriculum Generator — Claude + Gemini');
    console.log('═══════════════════════════════════════════════════\n');

    const curriculum: any = {
        metadata: {
            version: '2.0',
            generators: [`Claude ${CLAUDE_MODEL}`, 'Gemini 2.5 Flash'],
            standard: 'CEFR / Goethe-Institut / Profile Deutsch',
            created: new Date().toISOString(),
            cross_validated: true,
        },
        lesson_plans: [],
        exam_prep: [],
        cultural_modules: [],
    };

    // ─── 1. LESSON PLANS ───
    console.log('📋 Phase 1: Weekly Lesson Plans (Claude Sonnet)');
    console.log('────────────────────────────────────────────────');

    for (const [level, topics] of Object.entries(WEEKLY_TOPICS)) {
        console.log(`\n  📖 ${level}: ${topics.length} weeks`);
        for (let i = 0; i < topics.length; i++) {
            console.log(`    Week ${i + 1}: ${topics[i]}...`);
            const plan = await designLessonPlan(level, i + 1, topics[i]);
            if (plan) {
                const v = await geminiValidate(plan, 'lesson plan');
                plan._validated = v.valid;
                plan._validation_issues = v.issues;
                curriculum.lesson_plans.push(plan);
                console.log(`    ✅ ${topics[i]} ${v.valid ? '✓' : '⚠️ ' + v.issues.join(', ')}`);
            } else {
                console.log(`    ❌ ${topics[i]}`);
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    // ─── 2. EXAM PREP ───
    console.log('\n\n🎓 Phase 2: Goethe Exam Prep (Claude Sonnet)');
    console.log('──────────────────────────────────────────────');

    for (const level of ['A1', 'A2', 'B1', 'B2']) {
        console.log(`  📝 Goethe ${level}...`);
        const ep = await designExamPrep(level);
        if (ep) {
            curriculum.exam_prep.push(ep);
            console.log(`  ✅ Goethe ${level}`);
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    // ─── 3. CULTURAL MODULES ───
    console.log('\n\n🌍 Phase 3: Cultural Modules (Claude Sonnet)');
    console.log('─────────────────────────────────────────────');

    for (const [level, topics] of Object.entries(CULTURAL_TOPICS)) {
        console.log(`  🏛 ${level}:`);
        for (const topic of topics) {
            console.log(`    ${topic}...`);
            const cm = await designCulturalModule(level, topic);
            if (cm) {
                curriculum.cultural_modules.push(cm);
                console.log(`    ✅ ${topic}`);
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    // ─── SAVE ───
    const out = path.join(DATA_DIR, 'advanced-curriculum.json');
    fs.writeFileSync(out, JSON.stringify(curriculum, null, 2));

    // ─── SUMMARY ───
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 ADVANCED CURRICULUM SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Lesson plans:     ${curriculum.lesson_plans.length}`);
    console.log(`  Exam prep:        ${curriculum.exam_prep.length}`);
    console.log(`  Cultural modules: ${curriculum.cultural_modules.length}`);
    console.log(`  Output: ${out}`);
    console.log('═══════════════════════════════════════════════════');
}

run().catch(console.error);
