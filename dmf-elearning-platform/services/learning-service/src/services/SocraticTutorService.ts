/**
 * Socratic Tutor Agent — Phase 5, Sprint 5.1
 * AI tutor that NEVER gives answers directly
 * Guides through questions, hints, and scaffolding
 * Designed for Gemini 2.0 Flash via Vertex AI
 */

import { getStudentProfile } from './LRSService';

// ─── Types ───

export interface TutorSession {
    id: string;
    userId: string;
    module: string;           // grammar, vocabulary, reading, writing, etc.
    exerciseId?: string;
    difficulty: number;
    turns: TutorTurn[];
    status: 'active' | 'resolved' | 'escalated';
    startedAt: Date;
    resolvedAt?: Date;
    scaffoldingLevel: number; // 0=no help → 5=almost giving answer
}

interface TutorTurn {
    role: 'student' | 'tutor';
    text: string;
    timestamp: Date;
    strategy?: TutoringStrategy;
}

type TutoringStrategy =
    | 'open_question'         // "Was denkst du, warum...?"
    | 'leading_question'      // "Hast du bemerkt, dass...?"
    | 'analogy'               // "Das ist ähnlich wie..."
    | 'simplification'        // Break into smaller steps
    | 'counter_example'       // "Was passiert wenn...?"
    | 'encourage'             // "Du bist auf dem richtigen Weg!"
    | 'review_hint'           // "Schau dir nochmal... an"
    | 'metacognition';        // "Wie bist du auf diese Antwort gekommen?"

export interface TutorResponse {
    message: string;
    messageVi: string;
    strategy: TutoringStrategy;
    scaffoldingLevel: number;
    hints: string[];
    relatedConcepts: string[];
    shouldEscalate: boolean;
}

// ─── Knowledge Base: Common Stuck Points ───

const GERMAN_STUCK_POINTS: Record<string, {
    concept: string;
    commonErrors: string[];
    socraticQuestions: Array<{ de: string; vi: string; strategy: TutoringStrategy }>;
    analogy: string;
}> = {
    'accusative_dative': {
        concept: 'Akkusativ vs. Dativ',
        commonErrors: ['Using Dativ with Akkusativ verbs', 'Confusing article changes'],
        socraticQuestions: [
            { de: 'Welche Frage stellst du: "Wen?" oder "Wem?"', vi: 'Bạn hỏi câu gì: "Ai?" (Akkusativ) hay "Cho ai?" (Dativ)?', strategy: 'open_question' },
            { de: 'Was passiert mit dem Artikel, wenn wir den Akkusativ benutzen?', vi: 'Điều gì xảy ra với mạo từ khi dùng Akkusativ?', strategy: 'leading_question' },
            { de: 'Denk an den Satz: "Ich gebe DEM Mann DEN Ball." Wer bekommt? Was wird gegeben?', vi: 'Nghĩ về câu: "Ich gebe DEM Mann DEN Ball." Ai nhận? Cái gì được đưa?', strategy: 'analogy' },
        ],
        analogy: 'Akkusativ = direct object (bạn tác động trực tiếp), Dativ = indirect object (ai nhận/hưởng lợi)',
    },
    'word_order': {
        concept: 'Wortstellung (Verb Second)',
        commonErrors: ['Verb not in 2nd position', 'Wrong order with subordinate clauses'],
        socraticQuestions: [
            { de: 'An welcher Stelle steht das Verb im Hauptsatz?', vi: 'Động từ đứng ở vị trí thứ mấy trong câu chính?', strategy: 'open_question' },
            { de: 'Was passiert mit dem Verb, wenn der Satz mit "weil" anfängt?', vi: 'Điều gì xảy ra với động từ khi câu bắt đầu bằng "weil"?', strategy: 'leading_question' },
            { de: 'Versuch den Satz umzustellen: "Gestern bin ich..." — wo steht das Verb jetzt?', vi: 'Thử đảo câu: "Gestern bin ich..." — động từ ở đâu?', strategy: 'counter_example' },
        ],
        analogy: 'Verb = ngôi sao trên sân khấu — trong câu chính LUÔN đứng vị trí thứ 2 (V2 rule)',
    },
    'adjective_declension': {
        concept: 'Adjektivdeklination',
        commonErrors: ['Wrong ending after der/die/das', 'Missing ending after ein/eine'],
        socraticQuestions: [
            { de: 'Welcher Artikel steht vor dem Adjektiv? Bestimmt oder unbestimmt?', vi: 'Mạo từ nào đứng trước tính từ? Xác định hay bất định?', strategy: 'open_question' },
            { de: 'Wenn du "der große Mann" sagst — warum endet "groß" auf "-e"?', vi: 'Khi nói "der große Mann" — tại sao "groß" kết thúc bằng "-e"?', strategy: 'leading_question' },
            { de: 'Vergleiche: "ein großER Mann" vs "der großE Mann" — was fällt dir auf?', vi: 'So sánh: "ein großER Mann" vs "der großE Mann" — bạn thấy gì?', strategy: 'counter_example' },
        ],
        analogy: 'Nếu mạo từ đã "strong" (der/die/das) → tính từ chỉ cần đuôi yếu (-e, -en). Nếu mạo từ "weak" (ein) → tính từ phải mang đuôi mạnh (-er, -es, -em)',
    },
    'separable_verbs': {
        concept: 'Trennbare Verben',
        commonErrors: ['Not separating prefix in main clause', 'Separating in subordinate clause'],
        socraticQuestions: [
            { de: 'Was ist das Präfix von "anfangen"? Wo steht es im Hauptsatz?', vi: 'Tiền tố của "anfangen" là gì? Nó đứng ở đâu trong câu chính?', strategy: 'open_question' },
            { de: 'Schau dir "aufstehen" an: "Ich stehe um 7 Uhr auf." — Siehst du, wie es sich trennt?', vi: 'Xem "aufstehen": "Ich stehe um 7 Uhr auf." — Bạn thấy nó tách ra như thế nào?', strategy: 'analogy' },
            { de: 'Was passiert mit "aufstehen" in einem "weil"-Satz?', vi: 'Điều gì xảy ra với "aufstehen" trong câu "weil"?', strategy: 'counter_example' },
        ],
        analogy: 'Động từ tách = con rắn: đầu (tiền tố) bay về cuối câu, thân (gốc) ở lại vị trí 2',
    },
    'pronunciation_umlauts': {
        concept: 'Umlaute (ä, ö, ü)',
        commonErrors: ['Pronouncing ü as u', 'Pronouncing ö as o'],
        socraticQuestions: [
            { de: 'Kannst du den Unterschied zwischen "u" und "ü" hören?', vi: 'Bạn có nghe được sự khác biệt giữa "u" và "ü" không?', strategy: 'open_question' },
            { de: 'Versuch "i" zu sagen und dabei die Lippen zu runden — was kommt raus?', vi: 'Thử nói "i" và tròn môi — âm gì phát ra?', strategy: 'simplification' },
            { de: 'Sag "Mutter" und dann "Mütter" — spürst du den Unterschied?', vi: 'Nói "Mutter" rồi "Mütter" — bạn cảm nhận sự khác biệt?', strategy: 'counter_example' },
        ],
        analogy: 'ü = "i" + tròn môi, ö = "e" + tròn môi, ä = "e" mở rộng (giống "è" trong tiếng Việt)',
    },
};

// ─── Session Store ───

const sessions = new Map<string, TutorSession>();

// ─── Core Functions ───

/**
 * Start a tutoring session when student gets stuck
 */
export function startTutorSession(
    userId: string,
    module: string,
    context: {
        exerciseId?: string;
        question?: string;
        userAnswer?: string;
        correctAnswer?: string;
        difficulty?: number;
    }
): TutorSession {
    const sessionId = `tutor_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const profile = getStudentProfile(userId);

    // Detect closest stuck point
    const stuckPoint = detectStuckPoint(context.question || '', context.userAnswer || '', module);

    // Generate initial tutor response
    const firstResponse = generateTutorResponse(stuckPoint, 0, context.userAnswer, context.question);

    const session: TutorSession = {
        id: sessionId,
        userId,
        module,
        exerciseId: context.exerciseId,
        difficulty: context.difficulty || 5,
        turns: [
            { role: 'student', text: context.userAnswer || 'Tôi không biết trả lời', timestamp: new Date() },
            { role: 'tutor', text: firstResponse.message, timestamp: new Date(), strategy: firstResponse.strategy },
        ],
        status: 'active',
        startedAt: new Date(),
        scaffoldingLevel: 0,
    };

    sessions.set(sessionId, session);
    return session;
}

/**
 * Student responds to tutor — get next guidance
 */
export function respondToTutor(
    sessionId: string,
    studentMessage: string
): TutorResponse {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (session.status !== 'active') throw new Error('Session is not active');

    // Add student turn
    session.turns.push({ role: 'student', text: studentMessage, timestamp: new Date() });

    // Increase scaffolding if student still stuck
    const isCorrectDirection = analyzeStudentProgress(studentMessage, session);

    if (isCorrectDirection) {
        // Student making progress → encourage
        const response = {
            message: 'Genau richtig! Du bist auf dem richtigen Weg. Kannst du den Gedanken weiterführen?',
            messageVi: 'Chính xác! Bạn đang đi đúng hướng. Hãy tiếp tục phát triển ý tưởng đó!',
            strategy: 'encourage' as TutoringStrategy,
            scaffoldingLevel: session.scaffoldingLevel,
            hints: [],
            relatedConcepts: [],
            shouldEscalate: false,
        };
        session.turns.push({ role: 'tutor', text: response.message, timestamp: new Date(), strategy: response.strategy });
        return response;
    }

    // Increase scaffolding
    session.scaffoldingLevel = Math.min(5, session.scaffoldingLevel + 1);

    // Check if should escalate (too many failed attempts)
    if (session.scaffoldingLevel >= 5) {
        session.status = 'escalated';
        return {
            message: 'Das ist ein schwieriges Thema. Lass uns zusammen die Regel noch einmal anschauen.',
            messageVi: 'Đây là chủ đề khó. Hãy cùng xem lại quy tắc một lần nữa — đừng lo, ai cũng cần thời gian!',
            strategy: 'simplification',
            scaffoldingLevel: 5,
            hints: ['Xem lại bài giảng về chủ đề này', 'Thử với ví dụ đơn giản hơn'],
            relatedConcepts: [],
            shouldEscalate: true,
        };
    }

    // Generate next Socratic response
    const stuckPoint = detectStuckPoint(
        session.turns.find(t => t.role === 'student')?.text || '',
        studentMessage,
        session.module
    );

    const response = generateTutorResponse(stuckPoint, session.scaffoldingLevel, studentMessage);
    session.turns.push({ role: 'tutor', text: response.message, timestamp: new Date(), strategy: response.strategy });

    return response;
}

/**
 * Mark session as resolved
 */
export function resolveSession(sessionId: string): TutorSession {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.status = 'resolved';
    session.resolvedAt = new Date();
    return session;
}

/**
 * Get session by ID
 */
export function getTutorSession(sessionId: string): TutorSession | undefined {
    return sessions.get(sessionId);
}

/**
 * Get user's tutor history
 */
export function getUserTutorHistory(userId: string): TutorSession[] {
    return [...sessions.values()].filter(s => s.userId === userId);
}

// ─── Stuck Point Detection ───

function detectStuckPoint(question: string, answer: string, module: string): string {
    const combined = `${question} ${answer} ${module}`.toLowerCase();

    if (combined.includes('akkusativ') || combined.includes('dativ') || combined.includes('case')) return 'accusative_dative';
    if (combined.includes('wortstellung') || combined.includes('word order') || combined.includes('verb position')) return 'word_order';
    if (combined.includes('adjektiv') || combined.includes('adjective') || combined.includes('deklination')) return 'adjective_declension';
    if (combined.includes('trennbar') || combined.includes('separable') || combined.includes('prefix')) return 'separable_verbs';
    if (combined.includes('umlaut') || combined.includes('ü') || combined.includes('ö') || combined.includes('pronunciation')) return 'pronunciation_umlauts';

    return 'word_order'; // Default
}

function analyzeStudentProgress(message: string, session: TutorSession): boolean {
    // Simple heuristic: longer responses with question marks = engagement
    const wordCount = message.split(/\s+/).length;
    const hasQuestion = message.includes('?');
    const hasKeywords = message.toLowerCase().match(/(?:weil|denn|also|aber|vielleicht|ich denke|ich glaube)/);

    return wordCount >= 5 || hasQuestion || !!hasKeywords;
}

function generateTutorResponse(
    stuckPointKey: string,
    scaffoldLevel: number,
    studentAnswer?: string,
    question?: string
): TutorResponse {
    const stuckPoint = GERMAN_STUCK_POINTS[stuckPointKey];
    if (!stuckPoint) {
        return {
            message: 'Lass uns das zusammen anschauen. Was genau verstehst du nicht?',
            messageVi: 'Hãy cùng xem nhé. Bạn chưa hiểu phần nào?',
            strategy: 'open_question',
            scaffoldingLevel: scaffoldLevel,
            hints: [],
            relatedConcepts: [stuckPointKey],
            shouldEscalate: false,
        };
    }

    // Select question based on scaffolding level
    const qIdx = Math.min(scaffoldLevel, stuckPoint.socraticQuestions.length - 1);
    const sq = stuckPoint.socraticQuestions[qIdx];

    // At high scaffolding levels, add analogy
    const hints: string[] = [];
    if (scaffoldLevel >= 2) {
        hints.push(stuckPoint.analogy);
    }
    if (scaffoldLevel >= 3) {
        hints.push(`Lỗi thường gặp: ${stuckPoint.commonErrors[0]}`);
    }

    return {
        message: sq.de,
        messageVi: sq.vi,
        strategy: sq.strategy,
        scaffoldingLevel: scaffoldLevel,
        hints,
        relatedConcepts: [stuckPoint.concept],
        shouldEscalate: scaffoldLevel >= 4,
    };
}

/**
 * Build Gemini system prompt for Socratic tutoring
 */
export function buildSocraticGeminiPrompt(session: TutorSession): string {
    return `You are a Socratic tutor for German language learning on DMF E-Learning platform.

ABSOLUTE RULES:
1. NEVER give the answer directly
2. Guide through questions ONLY
3. Use scaffolding: start with open questions → if student struggles, give hints → if still stuck, use analogies → last resort: simplify the concept
4. Respond in BOTH German (main) and Vietnamese (translation) 
5. Keep responses under 3 sentences
6. Be encouraging but not patronizing

CURRENT SESSION:
- Module: ${session.module}
- Difficulty: ${session.difficulty}/10
- Scaffolding level: ${session.scaffoldingLevel}/5 (0=no help, 5=near answer)
- Turns so far: ${session.turns.length}

CONVERSATION SO FAR:
${session.turns.map(t => `${t.role === 'tutor' ? '🎓' : '🙋'}: ${t.text}`).join('\n')}

STRATEGIES TO USE (rotate based on scaffolding level):
- Level 0-1: open_question (Socratic questioning)
- Level 2: leading_question or analogy 
- Level 3: counter_example or simplification
- Level 4: review_hint with specific reference
- Level 5: metacognition (ask HOW they're thinking about it)

Respond with JSON: { "message": "German text", "messageVi": "Vietnamese translation", "strategy": "strategy_name", "hints": ["optional hints"], "shouldEscalate": false }`;
}
