/**
 * Grammar Exercise Service — Sprint 3 Fix 3.6
 * Interactive grammar exercises: fill-in-blank, conjugation drills, 
 * sentence reordering, error correction
 */

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';
type ExerciseType = 'fill_blank' | 'conjugation' | 'reorder' | 'error_correction';

interface GrammarExercise {
    id: string;
    level: CEFRLevel;
    type: ExerciseType;
    title: string;
    instruction: string;
    question: string;
    correctAnswer: string;
    options?: string[];  // For multiple choice
    hint?: string;
    explanation: string;
    grammarTopic: string;
    xpReward: number;
}

interface ExerciseResult {
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    xpEarned: number;
}

// ─── EXERCISE BANK ───

const GRAMMAR_EXERCISES: GrammarExercise[] = [
    // ═══ A1: Verb Conjugation (sein/haben) ═══
    { id: 'a1-conj-1', level: 'A1', type: 'fill_blank', title: 'Verb "sein" konjugieren', instruction: 'Ergänze die richtige Form von "sein"', question: 'Ich ___ Student.', correctAnswer: 'bin', options: ['bin', 'bist', 'ist', 'sind'], hint: 'ich → ?', explanation: 'ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind', grammarTopic: 'Konjugation: sein', xpReward: 10 },
    { id: 'a1-conj-2', level: 'A1', type: 'fill_blank', title: 'Verb "haben" konjugieren', instruction: 'Ergänze die richtige Form von "haben"', question: 'Er ___ einen Hund.', correctAnswer: 'hat', options: ['habe', 'hast', 'hat', 'haben'], hint: 'er → ?', explanation: 'ich habe, du hast, er/sie/es hat, wir haben, ihr habt, sie/Sie haben', grammarTopic: 'Konjugation: haben', xpReward: 10 },
    { id: 'a1-conj-3', level: 'A1', type: 'conjugation', title: 'Verb "kommen" konjugieren', instruction: 'Konjugiere "kommen" für die Person', question: 'du + kommen = ?', correctAnswer: 'kommst', hint: 'st-Endung für du', explanation: 'du kommst — Regelmäßige Verben: -e, -st, -t, -en, -t, -en', grammarTopic: 'Konjugation: regelmäßig', xpReward: 10 },

    // ═══ A1: Articles ═══
    { id: 'a1-art-1', level: 'A1', type: 'fill_blank', title: 'Bestimmter Artikel', instruction: 'Welcher Artikel ist richtig?', question: '___ Buch liegt auf dem Tisch.', correctAnswer: 'Das', options: ['Der', 'Die', 'Das', 'Den'], hint: 'Buch ist neutral', explanation: 'das Buch (neutral) — der (m), die (f), das (n)', grammarTopic: 'Artikel', xpReward: 10 },
    { id: 'a1-art-2', level: 'A1', type: 'fill_blank', title: 'Bestimmter Artikel', instruction: 'Welcher Artikel ist richtig?', question: '___ Frau arbeitet im Büro.', correctAnswer: 'Die', options: ['Der', 'Die', 'Das', 'Den'], hint: 'Frau ist feminin', explanation: 'die Frau (feminin)', grammarTopic: 'Artikel', xpReward: 10 },

    // ═══ A1: Word Order ═══
    { id: 'a1-word-1', level: 'A1', type: 'reorder', title: 'Satzstellung', instruction: 'Bringe die Wörter in die richtige Reihenfolge', question: 'heißt / Wie / du / ?', correctAnswer: 'Wie heißt du?', hint: 'Fragewort zuerst', explanation: 'W-Fragen: Fragewort + Verb + Subjekt', grammarTopic: 'Satzstellung: W-Fragen', xpReward: 15 },
    { id: 'a1-word-2', level: 'A1', type: 'reorder', title: 'Satzstellung', instruction: 'Ordne den Satz', question: 'heute / Ich / Kino / ins / gehe', correctAnswer: 'Ich gehe heute ins Kino', hint: 'Verb auf Position 2', explanation: 'Hauptsatz: Subjekt + Verb + Zeitangabe + Objekt', grammarTopic: 'Satzstellung: V2', xpReward: 15 },

    // ═══ A2: Perfekt ═══
    { id: 'a2-perf-1', level: 'A2', type: 'fill_blank', title: 'Perfekt bilden', instruction: 'Bilde das Perfekt', question: 'Er ___ einen Film geguckt. (haben)', correctAnswer: 'hat', options: ['hat', 'ist', 'hast', 'haben'], hint: 'gucken = haben + ge...t', explanation: 'gucken → hat geguckt (haben als Hilfsverb)', grammarTopic: 'Perfekt', xpReward: 15 },
    { id: 'a2-perf-2', level: 'A2', type: 'fill_blank', title: 'Perfekt mit "sein"', instruction: 'Welches Hilfsverb?', question: 'Sie ___ nach Berlin gefahren.', correctAnswer: 'ist', options: ['hat', 'ist', 'sind', 'hast'], hint: 'Bewegungsverben → sein', explanation: 'fahren = Bewegung → ist gefahren', grammarTopic: 'Perfekt: sein', xpReward: 15 },

    // ═══ A2: Dativ ═══
    { id: 'a2-dat-1', level: 'A2', type: 'fill_blank', title: 'Dativ-Präpositionen', instruction: 'Ergänze den richtigen Artikel', question: 'Ich gehe zu ___ Arzt. (der Arzt)', correctAnswer: 'dem', options: ['der', 'dem', 'den', 'des'], hint: 'zu + Dativ', explanation: 'zu + Dativ: der Arzt → dem Arzt', grammarTopic: 'Dativ-Präpositionen', xpReward: 15 },

    // ═══ A2: Error Correction ═══
    { id: 'a2-err-1', level: 'A2', type: 'error_correction', title: 'Fehlerkorrektur', instruction: 'Finde und korrigiere den Fehler', question: 'Ich habe gestern ins Kino gegangen.', correctAnswer: 'Ich bin gestern ins Kino gegangen.', hint: 'Welches Hilfsverb braucht "gehen"?', explanation: 'gehen → sein (Bewegungsverb): Ich bin gegangen', grammarTopic: 'Perfekt: Hilfsverb', xpReward: 20 },

    // ═══ B1: Konjunktiv II ═══
    { id: 'b1-konj-1', level: 'B1', type: 'fill_blank', title: 'Konjunktiv II', instruction: 'Ergänze die Konjunktiv-II-Form', question: 'Wenn ich reich ___, würde ich reisen. (sein)', correctAnswer: 'wäre', options: ['wäre', 'bin', 'war', 'sei'], hint: 'Irrealer Wunsch', explanation: 'Konjunktiv II von sein: wäre', grammarTopic: 'Konjunktiv II', xpReward: 20 },
    { id: 'b1-konj-2', level: 'B1', type: 'fill_blank', title: 'Konjunktiv II', instruction: 'Ergänze die richtige Form', question: 'Ich ___ gern nach Japan fliegen. (werden)', correctAnswer: 'würde', options: ['werde', 'würde', 'wurde', 'werde'], hint: 'Höfliche Wünsche', explanation: 'würde + Infinitiv: Ich würde gern fliegen', grammarTopic: 'Konjunktiv II: würde', xpReward: 20 },

    // ═══ B1: Relativsätze ═══
    { id: 'b1-rel-1', level: 'B1', type: 'fill_blank', title: 'Relativpronomen', instruction: 'Welches Relativpronomen?', question: 'Das ist der Film, ___ ich gesehen habe.', correctAnswer: 'den', options: ['der', 'den', 'dem', 'dessen'], hint: 'Akkusativ (den Film gesehen)', explanation: 'Relativpronomen Akkusativ maskulin: den', grammarTopic: 'Relativsätze', xpReward: 20 },

    // ═══ B1: Passiv ═══
    { id: 'b1-pass-1', level: 'B1', type: 'fill_blank', title: 'Passiv Präsens', instruction: 'Bilde das Passiv', question: 'Das Auto ___ repariert. (werden)', correctAnswer: 'wird', options: ['wird', 'wurde', 'worden', 'werde'], hint: 'Präsens Passiv: werden + Partizip II', explanation: 'Passiv Präsens: wird + Partizip II: Das Auto wird repariert', grammarTopic: 'Passiv', xpReward: 20 },

    // ═══ B2: Nominalisierung ═══
    { id: 'b2-nom-1', level: 'B2', type: 'fill_blank', title: 'Nominalisierung', instruction: 'Welches nominalisierte Verb?', question: 'Die ___ der neuen Mitarbeiter dauert zwei Wochen. (einarbeiten)', correctAnswer: 'Einarbeitung', options: ['Einarbeitung', 'Einarbeit', 'Eingearbeitung', 'Arbeitung'], hint: 'Verb → Nomen mit -ung', explanation: 'einarbeiten → die Einarbeitung (-ung Suffix)', grammarTopic: 'Nominalisierung', xpReward: 25 },

    // ═══ B2: Konjunktionen ═══
    { id: 'b2-konj-1', level: 'B2', type: 'fill_blank', title: 'Konzessive Konjunktion', instruction: 'Welche Konjunktion passt?', question: '___ des schlechten Wetters gingen wir spazieren.', correctAnswer: 'Trotz', options: ['Wegen', 'Trotz', 'Während', 'Aufgrund'], hint: 'Gegengrund', explanation: 'trotz + Genitiv: Trotz des Wetters (obwohl das Wetter schlecht war)', grammarTopic: 'Konzessive Konjunktionen', xpReward: 25 },
];

/**
 * Get exercises by level and optionally by type
 */
export function getExercises(level: CEFRLevel, type?: ExerciseType, limit = 5): GrammarExercise[] {
    let exercises = GRAMMAR_EXERCISES.filter(e => e.level === level);
    if (type) exercises = exercises.filter(e => e.type === type);

    // Shuffle and limit
    const shuffled = exercises.sort(() => Math.random() - 0.5);

    // Return without correct answers for client
    return shuffled.slice(0, limit);
}

/**
 * Get exercises without answers (for client)
 */
export function getExercisesForClient(level: CEFRLevel, type?: ExerciseType, limit = 5) {
    return getExercises(level, type, limit).map(e => ({
        id: e.id,
        level: e.level,
        type: e.type,
        title: e.title,
        instruction: e.instruction,
        question: e.question,
        options: e.options,
        hint: e.hint,
        grammarTopic: e.grammarTopic,
        xpReward: e.xpReward,
    }));
}

/**
 * Check answer and return result
 */
export function checkAnswer(exerciseId: string, userAnswer: string): ExerciseResult {
    const exercise = GRAMMAR_EXERCISES.find(e => e.id === exerciseId);
    if (!exercise) throw new Error(`Exercise ${exerciseId} not found`);

    const correct = userAnswer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

    return {
        correct,
        userAnswer,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
        xpEarned: correct ? exercise.xpReward : 0,
    };
}

/**
 * Get available grammar topics per level
 */
export function getTopics(level?: CEFRLevel): string[] {
    let exercises = GRAMMAR_EXERCISES;
    if (level) exercises = exercises.filter(e => e.level === level);
    return [...new Set(exercises.map(e => e.grammarTopic))];
}

/**
 * Get exercise types available
 */
export function getExerciseTypes(): ExerciseType[] {
    return ['fill_blank', 'conjugation', 'reorder', 'error_correction'];
}
