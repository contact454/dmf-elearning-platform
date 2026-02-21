/**
 * Rubric Scoring — S13-03
 * Speaking + Writing rubric-based scoring (4 dimensions each)
 */

// ─── WRITING RUBRIC ───

export interface WritingRubricScores {
    grammar: number;      // 0-100
    vocabulary: number;   // 0-100
    coherence: number;    // 0-100
    taskCompletion: number; // 0-100
}

export interface WritingRubricResult {
    scores: WritingRubricScores;
    overall: number;
    level: string;
    feedback: string[];
}

export function scoreWriting(scores: WritingRubricScores): WritingRubricResult {
    const weights = { grammar: 0.3, vocabulary: 0.25, coherence: 0.25, taskCompletion: 0.2 };
    const overall = Math.round(
        scores.grammar * weights.grammar +
        scores.vocabulary * weights.vocabulary +
        scores.coherence * weights.coherence +
        scores.taskCompletion * weights.taskCompletion
    );

    const feedback: string[] = [];
    if (scores.grammar < 50) feedback.push('Grammatik braucht Übung. Achten Sie auf Verbkonjugation und Satzstruktur.');
    if (scores.vocabulary < 50) feedback.push('Versuchen Sie, vielfältigeren Wortschatz zu verwenden.');
    if (scores.coherence < 50) feedback.push('Verbinden Sie Ihre Sätze besser mit Konnektoren (und, aber, weil, obwohl).');
    if (scores.taskCompletion < 50) feedback.push('Lesen Sie die Aufgabenstellung nochmal und beantworten Sie alle Fragen.');
    if (overall >= 80) feedback.push('Ausgezeichnete Arbeit! Weiter so!');

    const level = overall >= 90 ? 'Exzellent' : overall >= 70 ? 'Gut' : overall >= 50 ? 'Befriedigend' : 'Noch üben';

    return { scores, overall, level, feedback };
}

// ─── SPEAKING RUBRIC ───

export interface SpeakingRubricScores {
    pronunciation: number;  // 0-100
    fluency: number;        // 0-100
    accuracy: number;       // 0-100 (grammar/word choice)
    interaction: number;    // 0-100 (response relevance)
}

export interface SpeakingRubricResult {
    scores: SpeakingRubricScores;
    overall: number;
    level: string;
    feedback: string[];
}

export function scoreSpeaking(scores: SpeakingRubricScores): SpeakingRubricResult {
    const weights = { pronunciation: 0.3, fluency: 0.25, accuracy: 0.25, interaction: 0.2 };
    const overall = Math.round(
        scores.pronunciation * weights.pronunciation +
        scores.fluency * weights.fluency +
        scores.accuracy * weights.accuracy +
        scores.interaction * weights.interaction
    );

    const feedback: string[] = [];
    if (scores.pronunciation < 50) feedback.push('Arbeiten Sie an der Aussprache. Hören Sie sich Muttersprachler an.');
    if (scores.fluency < 50) feedback.push('Versuchen Sie, flüssiger zu sprechen. Weniger Pausen machen.');
    if (scores.accuracy < 50) feedback.push('Achten Sie auf die richtige Verbkonjugation und Wortwahl.');
    if (scores.interaction < 50) feedback.push('Beantworten Sie die Fragen direkter und ausführlicher.');
    if (overall >= 80) feedback.push('Sehr gut gesprochen! Ihre Aussprache ist klar.');

    const level = overall >= 90 ? 'Exzellent' : overall >= 70 ? 'Gut' : overall >= 50 ? 'Befriedigend' : 'Noch üben';

    return { scores, overall, level, feedback };
}
