/**
 * Curriculum Content Improvement Script
 * Agent 4 (Exam Prep) + Agent 6 (Gamification) + Agent 8 (Quiz Bank)
 * Uses Claude Code CLI for stable API calls
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
            `echo '${escaped}' | claude -p 2>/dev/null`,
            { timeout: 600000, maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8' }
        );
        return result;
    } catch (err) {
        console.log(`  ⚠️ CLI error: ${(err as Error).message?.slice(0, 80)}`);
        return null;
    }
}

function parseJSON(text: string | null): any {
    if (!text) return null;
    try {
        const m = text.match(/\{[\s\S]*\}/);
        return m ? JSON.parse(m[0]) : null;
    } catch { return null; }
}

async function main() {
    console.log('🎯 Curriculum Content Improvement Sprint');
    console.log('═══════════════════════════════════════════\n');

    const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));

    // ═══════════════ PHASE 1: EXAM PREP (Agent 4) ═══════════════
    console.log('🎓 Phase 1: Goethe Exam Prep Modules');
    console.log('─────────────────────────────────────────');

    for (const level of ['A1', 'A2', 'B1', 'B2']) {
        const examKey = `Goethe-Zertifikat ${level}`;
        if (curriculum.exam_prep.some((e: any) => e.exam === examKey)) {
            console.log(`  ⏭ ${examKey} (exists)`);
            continue;
        }

        console.log(`  🔄 Creating ${examKey}...`);

        // Break into smaller prompts to avoid timeout
        const sections = ['Lesen', 'Hören', 'Schreiben', 'Sprechen'];
        const examModule: any = { exam: examKey, level, sections: [], _model: 'claude-cli' };

        for (const section of sections) {
            console.log(`    📝 ${section}...`);
            const text = callClaude(
                `Create Goethe-Zertifikat ${level} exam prep for section "${section}". For Vietnamese learners. Return ONLY JSON: {"name":"${section}","duration_minutes":NUMBER,"num_tasks":NUMBER,"task_types":["type1"],"strategies":["strategy1"],"practice_exercises":[{"task_number":1,"instruction_de":"German instruction","instruction_vi":"Vietnamese instruction","example_question":"question","example_options":["a","b","c","d"],"correct_answer":"a","tip":"tip for Vietnamese learners"}],"common_mistakes":["mistake1"]}. Include 3 practice exercises and 3 common mistakes specific to Vietnamese speakers. No markdown.`
            );
            const section_data = parseJSON(text);
            if (section_data) {
                examModule.sections.push(section_data);
                console.log(`    ✅ ${section}`);
            } else {
                console.log(`    ❌ ${section}`);
            }
        }

        // Weekly plan
        console.log(`    📅 Weekly plan...`);
        const planText = callClaude(
            `Create a 4-week Goethe-Zertifikat ${level} exam preparation plan for Vietnamese learners. Return ONLY JSON: {"weekly_plan":[{"week":1,"focus":"focus area","activities":["act1"],"mock_test":"description"}],"scoring":{"passing_score":60,"max_score":100,"breakdown":{"Lesen":25,"Hören":25,"Schreiben":25,"Sprechen":25}},"tips_for_vietnamese_learners":["tip1","tip2","tip3"]}. No markdown.`
        );
        const plan = parseJSON(planText);
        if (plan) {
            Object.assign(examModule, plan);
            console.log(`    ✅ Weekly plan`);
        }

        curriculum.exam_prep.push(examModule);
        console.log(`  ✅ ${examKey} complete (${examModule.sections.length}/4 sections)\n`);
    }

    // ═══════════════ PHASE 2: GAMIFICATION (Agent 6) ═══════════════
    console.log('\n🎮 Phase 2: Gamification & XP System');
    console.log('─────────────────────────────────────────');

    console.log('  🔄 Designing XP & badge system...');
    const gamText = callClaude(
        `Design a gamification system for a German DaF E-learning platform (CEFR A1-B2, Vietnamese learners). Return ONLY JSON: {"xp_system":{"activity_completion":NUMBER,"quiz_perfect":NUMBER,"streak_bonus":NUMBER,"cultural_module":NUMBER,"exam_prep":NUMBER},"levels":[{"name":"Anfänger","min_xp":0,"badge_icon":"🌱"},{"name":"name","min_xp":NUMBER,"badge_icon":"emoji"}],"badges":[{"id":"badge_id","name":"Badge Name","name_de":"German name","description":"How to earn","icon":"emoji","requirement":"specific requirement"}],"streaks":{"milestones":[{"days":3,"reward":"reward"},{"days":7,"reward":"reward"},{"days":30,"reward":"reward"}]},"weekly_challenges":[{"level":"A1","challenge":"specific weekly challenge"}],"leaderboard":{"categories":["XP Total","Streak","Quizzes"]}}. Include 12 badges, 5 XP levels, 4 streak milestones, 4 weekly challenges (1/level). No markdown.`
    );
    const gamification = parseJSON(gamText);
    if (gamification) {
        curriculum.gamification = gamification;
        console.log('  ✅ Gamification system created');
    } else {
        console.log('  ❌ Gamification system failed');
    }

    // ═══════════════ PHASE 3: QUIZ BANK (Agent 4 + 7) ═══════════════
    console.log('\n📝 Phase 3: Quiz Bank (MCQ + Fill-in-blank)');
    console.log('─────────────────────────────────────────');

    if (!curriculum.quiz_bank) curriculum.quiz_bank = [];

    for (const level of ['A1', 'A2', 'B1', 'B2']) {
        if (curriculum.quiz_bank.some((q: any) => q.level === level)) {
            console.log(`  ⏭ ${level} quiz bank (exists)`);
            continue;
        }

        console.log(`  🔄 ${level} quiz bank...`);
        const quizText = callClaude(
            `Create a quiz bank for CEFR ${level} German (DaF) for Vietnamese learners. Return ONLY JSON: {"level":"${level}","quizzes":[{"week":1,"topic":"topic name","questions":[{"type":"mcq","question_de":"German question","question_vi":"Vietnamese hint","options":["a","b","c","d"],"correct":0,"explanation_vi":"explanation in Vietnamese"},{"type":"fill_blank","sentence_de":"Ich ___ aus Vietnam.","correct_answer":"komme","hint_vi":"động từ kommen, ngôi ich","explanation_vi":"explanation"}]}]}. Create quizzes for weeks 1,4,8,12,16 with 4 questions each (2 MCQ + 2 fill-blank). Test vocabulary AND grammar from that week. No markdown.`
        );
        const quiz = parseJSON(quizText);
        if (quiz) {
            curriculum.quiz_bank.push(quiz);
            console.log(`  ✅ ${level} quiz bank (${quiz.quizzes?.length || 0} quizzes)`);
        } else {
            console.log(`  ❌ ${level} quiz bank failed`);
        }
    }

    // ═══════════════ PHASE 4: ASSESSMENT RUBRICS (Agent 4) ═══════════════
    console.log('\n📊 Phase 4: Assessment Rubrics');
    console.log('─────────────────────────────────────────');

    if (!curriculum.assessment_rubrics) {
        console.log('  🔄 Creating rubrics...');
        const rubricText = callClaude(
            `Create assessment rubrics for DaF German lessons (A1-B2). Return ONLY JSON: {"rubrics":[{"level":"A1","speaking":{"criteria":[{"name":"Aussprache","weight":25,"descriptors":{"excellent":"description","good":"desc","adequate":"desc","needs_work":"desc"}},{"name":"Wortschatz","weight":25,"descriptors":{"excellent":"","good":"","adequate":"","needs_work":""}},{"name":"Grammatik","weight":25,"descriptors":{"excellent":"","good":"","adequate":"","needs_work":""}},{"name":"Interaktion","weight":25,"descriptors":{"excellent":"","good":"","adequate":"","needs_work":""}}]},"writing":{"criteria":[{"name":"Inhalt","weight":30,"descriptors":{"excellent":"","good":"","adequate":"","needs_work":""}},{"name":"Grammatik","weight":30,"descriptors":{"excellent":"","good":"","adequate":"","needs_work":""}},{"name":"Wortschatz","weight":20,"descriptors":{"excellent":"","good":"","adequate":"","needs_work":""}},{"name":"Kohärenz","weight":20,"descriptors":{"excellent":"","good":"","adequate":"","needs_work":""}}]}}]}. Create rubrics for A1 and B2 only (representative). Keep descriptors concise. No markdown.`
        );
        const rubrics = parseJSON(rubricText);
        if (rubrics) {
            curriculum.assessment_rubrics = rubrics.rubrics || rubrics;
            console.log('  ✅ Assessment rubrics created');
        } else {
            console.log('  ❌ Assessment rubrics failed');
        }
    }

    // ═══════════════ SAVE ═══════════════
    curriculum.metadata.improvement_date = new Date().toISOString();
    curriculum.metadata.generators.push('Claude CLI (improvement sprint)');
    fs.writeFileSync(CURRICULUM_PATH, JSON.stringify(curriculum, null, 2));

    // ═══════════════ SUMMARY ═══════════════
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 IMPROVEMENT SPRINT SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`  Exam Prep modules: ${curriculum.exam_prep.length}`);
    console.log(`  Gamification:      ${curriculum.gamification ? '✅' : '❌'}`);
    console.log(`  Quiz bank levels:  ${curriculum.quiz_bank?.length || 0}`);
    console.log(`  Rubrics:           ${curriculum.assessment_rubrics ? '✅' : '❌'}`);
    console.log(`  Total lessons:     ${curriculum.lesson_plans.length}`);
    console.log(`  Total cultural:    ${curriculum.cultural_modules.length}`);
    console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
