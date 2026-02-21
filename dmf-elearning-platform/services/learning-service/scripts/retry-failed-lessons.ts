/**
 * Retry Failed Items — Claude Opus 4.6
 * Reads existing advanced-curriculum.json, identifies missing items, retries with Opus
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const CLAUDE_API_KEY = process.env.ANTHROPIC_AUTH_TOKEN!;
const CLAUDE_BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://claudible.io';
const SONNET_MODEL = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL || 'claude-sonnet-4.6';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const gemini = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const DATA_DIR = path.join(__dirname, '..', 'data');
const CURRICULUM_PATH = path.join(DATA_DIR, 'advanced-curriculum.json');

async function callOpus(system: string, user: string, retries = 3): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(`${CLAUDE_BASE_URL}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CLAUDE_API_KEY}` },
                body: JSON.stringify({
                    model: SONNET_MODEL,
                    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
                    max_tokens: 4096, temperature: 0.7,
                }),
            });
            if (!res.ok) {
                const err = await res.text();
                console.log(`      ⚠️ Attempt ${attempt}/${retries}: ${res.status} — retrying in ${attempt * 5}s...`);
                await new Promise(r => setTimeout(r, attempt * 5000));
                continue;
            }
            const data = await res.json() as any;
            return data.choices?.[0]?.message?.content || null;
        } catch (err) {
            console.log(`      ⚠️ Attempt ${attempt}/${retries}: ${(err as Error).message}`);
            await new Promise(r => setTimeout(r, attempt * 5000));
        }
    }
    return null;
}

function parseJSON(text: string | null): any {
    if (!text) return null;
    try {
        const m = text.match(/\{[\s\S]*\}/);
        return m ? JSON.parse(m[0]) : null;
    } catch { return null; }
}

// ═══════════════ TOPIC DEFINITIONS ═══════════════

const ALL_TOPICS: Record<string, string[]> = {
    A1: ['Sich vorstellen & Begrüßung', 'Familie & Freunde', 'Wohnung & Möbel', 'Essen & Trinken bestellen', 'Tagesablauf & Uhrzeit', 'Einkaufen & Zahlen', 'Körper & Gesundheit', 'Wegbeschreibung & Verkehr', 'Hobbys & Freizeit', 'Wetter & Jahreszeiten', 'Kleidung & Farben', 'Berufe & Arbeit', 'Termine & Verabredungen', 'Feste & Einladungen', 'Reisen & Hotel', 'Prüfungsvorbereitung Goethe A1'],
    A2: ['Kindheit & Erinnerungen', 'Wohnungssuche & Umzug', 'Gesundheit & Arztbesuch', 'Arbeit & Bewerbung', 'Medien & Internet', 'Reisen & Mobilität', 'Essen & Kochen', 'Nachbarn & Zusammenleben', 'Feste & Traditionen', 'Schule & Ausbildung', 'Umwelt & Natur', 'Gefühle & Beziehungen', 'Bank & Post', 'Sport & Fitness', 'Zukunftspläne', 'Prüfungsvorbereitung Goethe A2'],
    B1: ['Beruf & Karriere', 'Bildungssystem im DACH-Raum', 'Wohnen in der Stadt', 'Gesundheitssystem & Versicherung', 'Medien & Nachrichten', 'Umweltschutz', 'Politik & Gesellschaft', 'Kultur & Kunst', 'Integration & Migration', 'Wissenschaft & Technik', 'Konflikte & Lösungen', 'Wirtschaft & Konsum', 'Reisen & interkulturelle Erfahrungen', 'Literatur & Film', 'Zukunft & Träume', 'Prüfungsvorbereitung Goethe B1'],
    B2: ['Globalisierung & Digitalisierung', 'Arbeitswelt im Wandel', 'Bildungsgerechtigkeit', 'Nachhaltigkeit & Energie', 'Demokratie & Populismus', 'Kulturelle Identität', 'Ethik in der Wissenschaft', 'Medien & Meinungsfreiheit', 'Soziale Ungleichheit', 'Gentechnik & Bioethik', 'Städtebau & Urbanisierung', 'Sprachpolitik & Mehrsprachigkeit', 'Datenschutz & Privatsphäre', 'Generationenkonflikte', 'Europäische Integration', 'Prüfungsvorbereitung Goethe B2'],
};

const CULTURAL_TOPICS: Record<string, string[]> = {
    A1: ['Begrüßung & Höflichkeit', 'Pünktlichkeit', 'Brot & Frühstück'],
    A2: ['Mülltrennung', 'Feiertage (Weihnachten, Karneval)', 'Duale Ausbildung'],
    B1: ['Vereinsleben', 'Sozialversicherung', 'Deutsche Geschichte (Kurzfassung)'],
    B2: ['Erinnerungskultur', 'Föderalismus', 'Integration & Leitkultur-Debatte'],
};

// ═══════════════ MAIN ═══════════════

async function retryFailed() {
    console.log('🔄 Retry Failed Items — Claude Opus 4.6');
    console.log('═══════════════════════════════════════════\n');

    const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));
    const existingTopics = new Set(curriculum.lesson_plans.map((p: any) => `${p.level}-${p.topic}`));
    const existingExams = new Set(curriculum.exam_prep.map((e: any) => e.exam));
    const existingCultural = new Set(curriculum.cultural_modules.map((c: any) => `${c.level}-${c.topic}`));

    let retried = 0, success = 0;

    // ─── RETRY LESSON PLANS ───
    console.log('📋 Retrying Lesson Plans with Opus 4.6...');
    const sysPrompt = `You are an expert DaF curriculum designer with 20 years experience. Return ONLY valid JSON.`;

    for (const [level, topics] of Object.entries(ALL_TOPICS)) {
        for (let i = 0; i < topics.length; i++) {
            const key = `${level}-${topics[i]}`;
            if (existingTopics.has(key)) continue;

            retried++;
            console.log(`  🔄 ${level} Wk${i + 1}: ${topics[i]}...`);

            const text = await callOpus(sysPrompt, `Design a detailed weekly lesson plan for CEFR ${level}, Week ${i + 1}, Topic: "${topics[i]}". Target: Vietnamese adults. Include: learning_objectives (Can-Do), 2 sessions with activities (type, description, duration, materials, interaction_pattern, skills_focus), vocabulary_target, grammar_focus, cultural_note, homework, assessment, differentiation, spaced_repetition. Return JSON with week, level, topic, and all fields above.`);

            const plan = parseJSON(text);
            if (plan) {
                plan.level = level;
                plan.topic = topics[i];
                plan.week = i + 1;
                plan._model = 'claude-opus-4.6';
                curriculum.lesson_plans.push(plan);
                success++;
                console.log(`  ✅ ${topics[i]}`);
            } else {
                console.log(`  ❌ ${topics[i]}`);
            }
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    // ─── RETRY EXAM PREP ───
    console.log('\n🎓 Retrying Exam Prep with Opus 4.6...');
    for (const level of ['A1', 'A2', 'B1', 'B2']) {
        const examKey = `Goethe-Zertifikat ${level}`;
        if (existingExams.has(examKey)) continue;

        retried++;
        console.log(`  🔄 Goethe ${level}...`);
        const text = await callOpus(
            'You are a Goethe-Institut exam specialist. Return ONLY valid JSON.',
            `Design Goethe-Zertifikat ${level} exam prep. Include: exam name, 4 sections (Lesen/Hören/Schreiben/Sprechen) with duration, task_types, strategies, practice_exercises (with instruction_de, instruction_vi, example), common_mistakes for Vietnamese learners, 4-week plan, scoring breakdown, tips_for_vietnamese_learners. Return valid JSON.`
        );
        const ep = parseJSON(text);
        if (ep) {
            ep.exam = examKey;
            ep._model = 'claude-opus-4.6';
            curriculum.exam_prep.push(ep);
            success++;
            console.log(`  ✅ Goethe ${level}`);
        } else {
            console.log(`  ❌ Goethe ${level}`);
        }
        await new Promise(r => setTimeout(r, 3000));
    }

    // ─── RETRY CULTURAL ───
    console.log('\n🌍 Retrying Cultural Modules with Opus 4.6...');
    for (const [level, topics] of Object.entries(CULTURAL_TOPICS)) {
        for (const topic of topics) {
            const key = `${level}-${topic}`;
            if (existingCultural.has(key)) continue;

            retried++;
            console.log(`  🔄 ${level}: ${topic}...`);
            const text = await callOpus(
                'You are an intercultural communication expert. Return ONLY valid JSON.',
                `Create a cultural module for CEFR ${level}, topic "${topic}". Compare DACH vs Vietnamese culture. Include: title, level, topic, cultural_content_de (${level}-level German), cultural_content_vi, dach_perspective, vietnamese_perspective, intercultural_comparison, key_phrases [{de, vi, usage}], dos_and_donts [{type, advice_de, advice_vi}], discussion_questions [{de, vi}]. Return valid JSON.`
            );
            const cm = parseJSON(text);
            if (cm) {
                cm.level = level;
                cm.topic = topic;
                cm._model = 'claude-opus-4.6';
                curriculum.cultural_modules.push(cm);
                success++;
                console.log(`  ✅ ${topic}`);
            } else {
                console.log(`  ❌ ${topic}`);
            }
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    // ─── SAVE ───
    curriculum.metadata.retry_date = new Date().toISOString();
    curriculum.metadata.generators.push('Claude Opus 4.6 (retry)');
    fs.writeFileSync(CURRICULUM_PATH, JSON.stringify(curriculum, null, 2));

    // ─── SUMMARY ───
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 RETRY SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`  Items retried:    ${retried}`);
    console.log(`  Successes:        ${success}`);
    console.log(`  Still failed:     ${retried - success}`);
    console.log(`  Total lessons:    ${curriculum.lesson_plans.length}`);
    console.log(`  Total exam prep:  ${curriculum.exam_prep.length}`);
    console.log(`  Total cultural:   ${curriculum.cultural_modules.length}`);
    console.log('═══════════════════════════════════════════');
}

retryFailed().catch(console.error);
