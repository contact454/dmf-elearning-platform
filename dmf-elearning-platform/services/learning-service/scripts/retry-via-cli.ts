/**
 * Retry Failed Items via Claude Code CLI
 * Uses `claude -p` pipe mode for stable API calls through claudible.io
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const CURRICULUM_PATH = path.join(DATA_DIR, 'advanced-curriculum.json');

function callClaude(prompt: string): string | null {
    try {
        const escaped = prompt.replace(/'/g, "'\\''");
        const result = execSync(
            `echo '${escaped}' | claude -p --output-format json 2>/dev/null`,
            { timeout: 300000, maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8' }
        );
        // Extract the result text from JSON output
        try {
            const parsed = JSON.parse(result);
            return parsed.result || parsed.text || result;
        } catch {
            return result;
        }
    } catch (err) {
        console.log(`    ⚠️ CLI error: ${(err as Error).message?.slice(0, 100)}`);
        return null;
    }
}

function parseJSON(text: string | null): any {
    if (!text) return null;
    try {
        const m = text.match(/\{[\s\S]*\}/);
        return m ? JSON.parse(m[0]) : null;
    } catch {
        return null;
    }
}

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

async function retryViaCLI() {
    console.log('🔄 Retry Failed Items — Claude Code CLI');
    console.log('═══════════════════════════════════════════\n');

    const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));
    const existingTopics = new Set(curriculum.lesson_plans.map((p: any) => `${p.level}-${p.topic}`));
    const existingExams = new Set(curriculum.exam_prep.map((e: any) => e.exam));
    const existingCultural = new Set(curriculum.cultural_modules.map((c: any) => `${c.level}-${c.topic}`));

    let retried = 0, success = 0;

    // ─── LESSON PLANS ───
    console.log('📋 Retrying Lesson Plans via CLI...');
    for (const [level, topics] of Object.entries(ALL_TOPICS)) {
        for (let i = 0; i < topics.length; i++) {
            const key = `${level}-${topics[i]}`;
            if (existingTopics.has(key)) {
                console.log(`  ⏭ ${level} Wk${i + 1}: ${topics[i]} (exists)`);
                continue;
            }

            retried++;
            console.log(`  🔄 ${level} Wk${i + 1}: ${topics[i]}...`);

            const text = callClaude(
                `You are an expert DaF curriculum designer. Design a detailed weekly lesson plan for CEFR ${level}, Week ${i + 1}, Topic: "${topics[i]}". Target: Vietnamese adults learning German. Return ONLY a valid JSON object with these fields: week (number), level (string), topic (string), learning_objectives (array of Can-Do statements), prerequisite_knowledge (array), duration_minutes (90), sessions (array of 2 sessions, each with session_number, title, duration_minutes, activities array), vocabulary_target (array of German words), grammar_focus (string), cultural_note (string about DACH culture), homework (object with description, exercises array, estimated_time_minutes), assessment (object with formative array and summative string), differentiation (object with struggling_learners and advanced_learners strings), spaced_repetition (object with review_from_previous array and preview_next_week string). Each activity needs: type (warm_up/presentation/practice/production/review), title, description, duration_minutes, materials array, interaction_pattern (whole_class/pairs/groups/individual), skills_focus array. Return ONLY the JSON, no markdown fences.`
            );

            const plan = parseJSON(text);
            if (plan) {
                plan.level = level;
                plan.topic = topics[i];
                plan.week = i + 1;
                plan._model = 'claude-cli';
                curriculum.lesson_plans.push(plan);
                success++;
                console.log(`  ✅ ${topics[i]}`);
            } else {
                console.log(`  ❌ ${topics[i]}`);
            }
        }
    }

    // ─── EXAM PREP ───
    console.log('\n🎓 Retrying Exam Prep via CLI...');
    for (const level of ['A1', 'A2', 'B1', 'B2']) {
        const examKey = `Goethe-Zertifikat ${level}`;
        if (existingExams.has(examKey)) {
            console.log(`  ⏭ Goethe ${level} (exists)`);
            continue;
        }

        retried++;
        console.log(`  🔄 Goethe ${level}...`);
        const text = callClaude(
            `You are a Goethe-Institut exam specialist for Vietnamese learners. Design a Goethe-Zertifikat ${level} exam prep module. Return ONLY valid JSON with: exam (string "Goethe-Zertifikat ${level}"), total_prep_weeks (4), sections (array of 4 objects for Lesen/Hören/Schreiben/Sprechen, each with name, duration_minutes, num_tasks, task_types array, strategies array, practice_exercises array with task_number/instruction_de/instruction_vi/example_question/example_options/correct_answer/tip, common_mistakes array), weekly_plan (array of 4 weeks with week/focus/activities/mock_test), scoring (object with passing_score/max_score/breakdown), tips_for_vietnamese_learners (array). Return ONLY JSON, no markdown.`
        );
        const ep = parseJSON(text);
        if (ep) {
            ep.exam = examKey;
            ep._model = 'claude-cli';
            curriculum.exam_prep.push(ep);
            success++;
            console.log(`  ✅ Goethe ${level}`);
        } else {
            console.log(`  ❌ Goethe ${level}`);
        }
    }

    // ─── CULTURAL ───
    console.log('\n🌍 Retrying Cultural Modules via CLI...');
    for (const [level, topics] of Object.entries(CULTURAL_TOPICS)) {
        for (const topic of topics) {
            const key = `${level}-${topic}`;
            if (existingCultural.has(key)) {
                console.log(`  ⏭ ${level}: ${topic} (exists)`);
                continue;
            }

            retried++;
            console.log(`  🔄 ${level}: ${topic}...`);
            const text = callClaude(
                `You are an intercultural expert for German-Vietnamese exchange. Create a cultural module for CEFR ${level}, topic: "${topic}". Return ONLY valid JSON with: title, level ("${level}"), topic ("${topic}"), cultural_content_de (${level}-level German text), cultural_content_vi (Vietnamese translation), dach_perspective, vietnamese_perspective, intercultural_comparison, key_phrases (array of {de, vi, usage}), dos_and_donts (array of {type:"do"/"dont", advice_de, advice_vi}), discussion_questions (array of {de, vi}). No markdown fences.`
            );
            const cm = parseJSON(text);
            if (cm) {
                cm.level = level;
                cm.topic = topic;
                cm._model = 'claude-cli';
                curriculum.cultural_modules.push(cm);
                success++;
                console.log(`  ✅ ${topic}`);
            } else {
                console.log(`  ❌ ${topic}`);
            }
        }
    }

    // ─── SAVE ───
    curriculum.metadata.retry_date = new Date().toISOString();
    if (!curriculum.metadata.generators.includes('Claude Code CLI (retry)'))
        curriculum.metadata.generators.push('Claude Code CLI (retry)');
    fs.writeFileSync(CURRICULUM_PATH, JSON.stringify(curriculum, null, 2));

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 CLI RETRY SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`  Items retried:    ${retried}`);
    console.log(`  Successes:        ${success}`);
    console.log(`  Still failed:     ${retried - success}`);
    console.log(`  Total lessons:    ${curriculum.lesson_plans.length}`);
    console.log(`  Total exam prep:  ${curriculum.exam_prep.length}`);
    console.log(`  Total cultural:   ${curriculum.cultural_modules.length}`);
    console.log('═══════════════════════════════════════════');
}

retryViaCLI().catch(console.error);
