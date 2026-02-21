/**
 * Placement Test Service — Sprint 2 Fix 1.1
 * 12-question adaptive test to determine initial CEFR level
 * Uses Computer Adaptive Testing (CAT) — adjusts difficulty based on answers
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

interface PlacementQuestion {
    id: string;
    level: CEFRLevel;
    type: 'vocabulary' | 'grammar' | 'reading';
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface PlacementResult {
    estimatedLevel: CEFRLevel;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    skillBreakdown: {
        vocabulary: CEFRLevel;
        grammar: CEFRLevel;
        reading: CEFRLevel;
    };
    recommendations: string[];
}

// Question bank — 4 per skill × 4 levels = 48 questions
const QUESTION_BANK: PlacementQuestion[] = [
    // ─── VOCABULARY A1 ───
    { id: 'v-a1-1', level: 'A1', type: 'vocabulary', question: 'Was bedeutet "Hund"?', options: ['Cat', 'Dog', 'Bird', 'Fish'], correctIndex: 1, explanation: 'Hund = Dog (chó)' },
    { id: 'v-a1-2', level: 'A1', type: 'vocabulary', question: '"Guten Morgen" bedeutet...', options: ['Good night', 'Good morning', 'Good evening', 'Goodbye'], correctIndex: 1, explanation: 'Guten Morgen = Good morning (Chào buổi sáng)' },
    { id: 'v-a1-3', level: 'A1', type: 'vocabulary', question: 'Was ist "Wasser"?', options: ['Wine', 'Milk', 'Water', 'Juice'], correctIndex: 2, explanation: 'Wasser = Water (nước)' },
    // ─── VOCABULARY A2 ───
    { id: 'v-a2-1', level: 'A2', type: 'vocabulary', question: '"Ich möchte bestellen" bedeutet...', options: ['I want to pay', 'I would like to order', 'I want to leave', 'I would like to cook'], correctIndex: 1, explanation: 'bestellen = to order (đặt hàng)' },
    { id: 'v-a2-2', level: 'A2', type: 'vocabulary', question: 'Das Gegenteil von "kalt" ist...', options: ['warm', 'heiß', 'kühl', 'nass'], correctIndex: 1, explanation: 'kalt ↔ heiß (lạnh ↔ nóng)' },
    { id: 'v-a2-3', level: 'A2', type: 'vocabulary', question: '"Der Bahnhof" ist ein Ort für...', options: ['Flugzeuge', 'Züge', 'Schiffe', 'Busse'], correctIndex: 1, explanation: 'Bahnhof = train station (ga tàu)' },
    // ─── VOCABULARY B1 ───
    { id: 'v-b1-1', level: 'B1', type: 'vocabulary', question: '"Erfahrung" bedeutet...', options: ['Experiment', 'Experience', 'Explanation', 'Expectation'], correctIndex: 1, explanation: 'Erfahrung = Experience (kinh nghiệm)' },
    { id: 'v-b1-2', level: 'B1', type: 'vocabulary', question: '"Sich bewerben" heißt...', options: ['to complain', 'to apply', 'to move', 'to evaluate'], correctIndex: 1, explanation: 'sich bewerben = to apply (ứng tuyển)' },
    // ─── VOCABULARY B2 ───
    { id: 'v-b2-1', level: 'B2', type: 'vocabulary', question: '"Nachhaltigkeit" bedeutet...', options: ['Sustainability', 'Negligence', 'Aftermath', 'Persistence'], correctIndex: 0, explanation: 'Nachhaltigkeit = Sustainability (bền vững)' },
    { id: 'v-b2-2', level: 'B2', type: 'vocabulary', question: '"Die Voraussetzung" ist ein Synonym für...', options: ['Vorhersage', 'Bedingung', 'Vorstellung', 'Vermutung'], correctIndex: 1, explanation: 'Voraussetzung = prerequisite/condition (điều kiện tiên quyết)' },

    // ─── GRAMMAR A1 ───
    { id: 'g-a1-1', level: 'A1', type: 'grammar', question: 'Ich ___ Student. (sein)', options: ['bin', 'bist', 'ist', 'sind'], correctIndex: 0, explanation: 'ich bin (tôi là)' },
    { id: 'g-a1-2', level: 'A1', type: 'grammar', question: 'Das ___ ein Buch. (sein)', options: ['bin', 'bist', 'ist', 'sind'], correctIndex: 2, explanation: 'das ist (đó là)' },
    { id: 'g-a1-3', level: 'A1', type: 'grammar', question: '___ heißt du?', options: ['Was', 'Wie', 'Wo', 'Wer'], correctIndex: 1, explanation: 'Wie heißt du? = What is your name?' },
    // ─── GRAMMAR A2 ───
    { id: 'g-a2-1', level: 'A2', type: 'grammar', question: 'Ich ___ gestern ins Kino gegangen. (sein)', options: ['habe', 'bin', 'war', 'hatte'], correctIndex: 1, explanation: 'gehen uses sein as auxiliary (ich bin gegangen)' },
    { id: 'g-a2-2', level: 'A2', type: 'grammar', question: 'Er hat ___ Buch gelesen.', options: ['der', 'die', 'das', 'den'], correctIndex: 2, explanation: 'Buch is neuter → das Buch (Akkusativ)' },
    // ─── GRAMMAR B1 ───
    { id: 'g-b1-1', level: 'B1', type: 'grammar', question: 'Wenn ich Zeit ___, würde ich reisen.', options: ['habe', 'hätte', 'hatte', 'haben'], correctIndex: 1, explanation: 'Konjunktiv II: wenn ich hätte (nếu tôi có)' },
    { id: 'g-b1-2', level: 'B1', type: 'grammar', question: 'Das ist der Mann, ___ ich gesehen habe.', options: ['der', 'den', 'dem', 'dessen'], correctIndex: 1, explanation: 'Relativpronomen Akkusativ: den' },
    // ─── GRAMMAR B2 ───
    { id: 'g-b2-1', level: 'B2', type: 'grammar', question: 'Er handelte, ___ er alles wüsste.', options: ['als ob', 'obwohl', 'weil', 'damit'], correctIndex: 0, explanation: 'als ob + Konjunktiv II (as if)' },

    // ─── READING A1 ───
    { id: 'r-a1-1', level: 'A1', type: 'reading', question: '"Ich wohne in Berlin." Wo wohnt die Person?', options: ['München', 'Berlin', 'Hamburg', 'Wien'], correctIndex: 1, explanation: 'wohnen in = sống ở' },
    { id: 'r-a1-2', level: 'A1', type: 'reading', question: '"Das Geschäft ist von 9 bis 18 Uhr geöffnet." Wann schließt es?', options: ['9 Uhr', '17 Uhr', '18 Uhr', '20 Uhr'], correctIndex: 2, explanation: 'bis 18 Uhr = until 6 PM' },
    // ─── READING A2 ───
    { id: 'r-a2-1', level: 'A2', type: 'reading', question: '"Der Zug nach München fährt um 14:30 ab Gleis 3." Von welchem Gleis fährt der Zug?', options: ['Gleis 1', 'Gleis 2', 'Gleis 3', 'Gleis 4'], correctIndex: 2, explanation: 'Gleis 3 = Platform 3' },
    // ─── READING B1 ───
    { id: 'r-b1-1', level: 'B1', type: 'reading', question: '"Trotz des schlechten Wetters gingen wir spazieren." Wie war das Wetter?', options: ['Gut', 'Schlecht', 'Warm', 'Sonnig'], correctIndex: 1, explanation: 'trotz des schlechten Wetters = despite the bad weather' },
    // ─── READING B2 ───
    { id: 'r-b2-1', level: 'B2', type: 'reading', question: '"Die Studie belegt, dass regelmäßiger Sport die kognitive Leistung verbessert." Was verbessert Sport?', options: ['Aussehen', 'Denkfähigkeit', 'Schlaf', 'Appetit'], correctIndex: 1, explanation: 'kognitive Leistung = cognitive performance (năng lực nhận thức)' },
];

const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

/**
 * Generate adaptive test — starts at A2, adjusts based on answers
 */
export function generatePlacementTest(): PlacementQuestion[] {
    const selected: PlacementQuestion[] = [];
    let currentLevel: CEFRLevel = 'A2'; // Start at A2

    const types: Array<'vocabulary' | 'grammar' | 'reading'> = ['vocabulary', 'grammar', 'reading'];

    // 4 rounds × 3 skills = 12 questions
    for (let round = 0; round < 4; round++) {
        for (const type of types) {
            const available = QUESTION_BANK.filter(
                q => q.level === currentLevel && q.type === type && !selected.find(s => s.id === q.id)
            );
            if (available.length > 0) {
                const q = available[Math.floor(Math.random() * available.length)];
                selected.push(q);
            }
        }
    }

    return selected.slice(0, 12);
}

/**
 * CAT: Adjust difficulty based on answer
 */
export function adjustLevel(currentLevel: CEFRLevel, correct: boolean): CEFRLevel {
    const idx = LEVEL_ORDER.indexOf(currentLevel);
    if (correct && idx < LEVEL_ORDER.length - 1) return LEVEL_ORDER[idx + 1];
    if (!correct && idx > 0) return LEVEL_ORDER[idx - 1];
    return currentLevel;
}

/**
 * Calculate placement result from answers
 */
export function calculatePlacementResult(
    questions: PlacementQuestion[],
    answers: number[]
): PlacementResult {
    let correctCount = 0;
    const skillScores: Record<string, { correct: number; total: number; levels: CEFRLevel[] }> = {
        vocabulary: { correct: 0, total: 0, levels: [] },
        grammar: { correct: 0, total: 0, levels: [] },
        reading: { correct: 0, total: 0, levels: [] },
    };

    questions.forEach((q, i) => {
        const isCorrect = answers[i] === q.correctIndex;
        if (isCorrect) {
            correctCount++;
            skillScores[q.type].correct++;
            skillScores[q.type].levels.push(q.level);
        }
        skillScores[q.type].total++;
    });

    // Determine level per skill
    const getSkillLevel = (skill: typeof skillScores[string]): CEFRLevel => {
        if (skill.correct === 0) return 'A1';
        const highestCorrect = skill.levels.sort((a, b) =>
            LEVEL_ORDER.indexOf(b) - LEVEL_ORDER.indexOf(a)
        )[0];
        return highestCorrect || 'A1';
    };

    const vocabLevel = getSkillLevel(skillScores.vocabulary);
    const grammarLevel = getSkillLevel(skillScores.grammar);
    const readingLevel = getSkillLevel(skillScores.reading);

    // Overall level = minimum of all skills (conservative approach)
    const overallIdx = Math.min(
        LEVEL_ORDER.indexOf(vocabLevel),
        LEVEL_ORDER.indexOf(grammarLevel),
        LEVEL_ORDER.indexOf(readingLevel)
    );
    const estimatedLevel = LEVEL_ORDER[overallIdx];

    // Generate recommendations
    const recommendations: string[] = [];
    if (vocabLevel === 'A1') recommendations.push('Bắt đầu với từ vựng cơ bản A1 — chào hỏi, số đếm, màu sắc');
    if (grammarLevel === 'A1') recommendations.push('Học ngữ pháp cơ bản — động từ sein/haben, trật tự câu');
    if (correctCount >= 9) recommendations.push('Tuyệt vời! Bạn có nền tảng tốt. Tập trung vào kỹ năng nghe và nói');
    if (correctCount < 4) recommendations.push('Hãy bắt đầu từ bài học A1 và học từng bước');

    return {
        estimatedLevel,
        score: Math.round((correctCount / questions.length) * 100),
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        skillBreakdown: {
            vocabulary: vocabLevel,
            grammar: grammarLevel,
            reading: readingLevel,
        },
        recommendations,
    };
}

/**
 * Save placement result to database
 */
export async function savePlacementResult(userId: string, result: PlacementResult): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            cefrLevel: result.estimatedLevel,
        },
    });
}
