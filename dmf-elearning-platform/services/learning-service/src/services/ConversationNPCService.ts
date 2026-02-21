/**
 * Conversation NPC Service — Phase 2, Sprint 2.2
 * AI NPC roleplay partner using Gemini 2.0 Flash
 * Dynamic difficulty, emotion-aware, CEFR-adapted
 */

// ─── Types ───

export interface ConversationScenario {
    id: string;
    title: string;
    titleVi: string;
    description: string;
    setting: string;
    npcName: string;
    npcRole: string;
    npcPersonality: string;
    difficulty: 'A1' | 'A2' | 'B1' | 'B2';
    objectives: string[];    // What user should practice
    vocabularyFocus: string[];
    grammarFocus: string[];
}

export interface ConversationTurn {
    role: 'npc' | 'user';
    text: string;
    timestamp: Date;
    feedback?: TurnFeedback;
}

interface TurnFeedback {
    grammarCorrections: Array<{ original: string; corrected: string; rule: string }>;
    vocabularySuggestions: string[];
    naturalness: number;  // 0-100
    tip?: string;
}

export interface ConversationSession {
    id: string;
    scenario: ConversationScenario;
    turns: ConversationTurn[];
    userId: string;
    startedAt: Date;
    status: 'active' | 'completed' | 'abandoned';
    summary?: SessionSummary;
}

interface SessionSummary {
    totalTurns: number;
    avgNaturalness: number;
    grammarErrorCount: number;
    newWordsUsed: string[];
    objectivesMet: string[];
    xpEarned: number;
    overallGrade: string;
    feedbackVi: string;
}

// ─── Scenario Library ───

const SCENARIOS: ConversationScenario[] = [
    // A1
    {
        id: 'a1-cafe', title: 'At the Café', titleVi: 'Tại quán cà phê',
        description: 'Order food and drinks at a German café',
        setting: 'A cozy café in Berlin, morning time',
        npcName: 'Luisa', npcRole: 'Waitress', npcPersonality: 'friendly, patient, speaks slowly',
        difficulty: 'A1',
        objectives: ['Order food/drinks', 'Ask for the bill', 'Say please/thank you'],
        vocabularyFocus: ['Kaffee', 'Tee', 'Kuchen', 'Wasser', 'bitte', 'danke', 'zahlen'],
        grammarFocus: ['Ich möchte...', 'Haben Sie...?', 'Wie viel kostet...?'],
    },
    {
        id: 'a1-intro', title: 'Meeting Someone', titleVi: 'Gặp gỡ làm quen',
        description: 'Introduce yourself and get to know someone',
        setting: 'A language exchange meetup in Munich',
        npcName: 'Max', npcRole: 'Student', npcPersonality: 'curious, enthusiastic, asks simple questions',
        difficulty: 'A1',
        objectives: ['Introduce yourself', 'Ask/tell where you are from', 'Talk about hobbies'],
        vocabularyFocus: ['heißen', 'kommen', 'wohnen', 'Hobby', 'Beruf'],
        grammarFocus: ['Ich heiße...', 'Ich komme aus...', 'Ich bin...'],
    },
    // A2
    {
        id: 'a2-shopping', title: 'Shopping for Clothes', titleVi: 'Mua sắm quần áo',
        description: 'Buy clothes at a department store',
        setting: 'A clothing store in Hamburg',
        npcName: 'Frau Schmidt', npcRole: 'Sales Associate', npcPersonality: 'helpful, professional',
        difficulty: 'A2',
        objectives: ['Ask about sizes/colors', 'Try on clothes', 'Negotiate or decide'],
        vocabularyFocus: ['Größe', 'Farbe', 'anprobieren', 'Umkleidekabine', 'passt'],
        grammarFocus: ['Können Sie mir...?', 'Der/Die/Das ist zu...', 'Darf ich...?'],
    },
    {
        id: 'a2-doctor', title: 'At the Doctor', titleVi: 'Đi khám bác sĩ',
        description: 'Describe symptoms and understand medical advice',
        setting: 'A doctor\'s office in Frankfurt',
        npcName: 'Dr. Weber', npcRole: 'Doctor', npcPersonality: 'calm, clear, reassuring',
        difficulty: 'A2',
        objectives: ['Describe symptoms', 'Understand instructions', 'Make a follow-up'],
        vocabularyFocus: ['Kopfschmerzen', 'Fieber', 'Medikament', 'Rezept', 'Termin'],
        grammarFocus: ['Ich habe...', 'Mir tut... weh', 'Seit wann...?'],
    },
    // B1
    {
        id: 'b1-apartment', title: 'Apartment Viewing', titleVi: 'Xem nhà thuê',
        description: 'Visit and discuss renting an apartment',
        setting: 'An apartment in Berlin-Kreuzberg',
        npcName: 'Herr Müller', npcRole: 'Landlord', npcPersonality: 'business-like, detail-oriented',
        difficulty: 'B1',
        objectives: ['Ask about rent/utilities', 'Discuss contract terms', 'Negotiate'],
        vocabularyFocus: ['Miete', 'Nebenkosten', 'Kaution', 'Vertrag', 'Kündigung'],
        grammarFocus: ['Konjunktiv II', 'Relativsätze', 'Passiv'],
    },
    {
        id: 'b1-job-interview', title: 'Job Interview', titleVi: 'Phỏng vấn xin việc',
        description: 'Attend a job interview at a German company',
        setting: 'HR office at a tech company in Munich',
        npcName: 'Frau Becker', npcRole: 'HR Manager', npcPersonality: 'professional, direct, evaluative',
        difficulty: 'B1',
        objectives: ['Describe work experience', 'Explain strengths', 'Ask about the role'],
        vocabularyFocus: ['Erfahrung', 'Stärken', 'Teamarbeit', 'Gehalt', 'Aufgaben'],
        grammarFocus: ['Perfekt', 'Nebensätze mit weil/dass', 'Konjunktiv II (höflich)'],
    },
    // B2
    {
        id: 'b2-debate', title: 'Environmental Debate', titleVi: 'Tranh luận về môi trường',
        description: 'Discuss climate change and sustainability',
        setting: 'A university seminar room',
        npcName: 'Prof. König', npcRole: 'Professor', npcPersonality: 'intellectual, challenging, Socratic',
        difficulty: 'B2',
        objectives: ['Present arguments', 'Counter-argue', 'Use academic vocabulary'],
        vocabularyFocus: ['Klimawandel', 'Nachhaltigkeit', 'erneuerbare Energie', 'Emissionen'],
        grammarFocus: ['Konjunktiv I (Zitat)', 'Passiv', 'Nominalisierung'],
    },
    {
        id: 'b2-business', title: 'Business Meeting', titleVi: 'Họp doanh nghiệp',
        description: 'Lead a project status meeting',
        setting: 'Conference room at a multinational company',
        npcName: 'Herr Schneider', npcRole: 'Project Director', npcPersonality: 'demanding, strategic',
        difficulty: 'B2',
        objectives: ['Report progress', 'Address problems', 'Propose solutions'],
        vocabularyFocus: ['Fortschritt', 'Herausforderung', 'Deadline', 'Budget', 'Maßnahme'],
        grammarFocus: ['Konjunktiv II', 'Futur II', 'Partizipialkonstruktionen'],
    },
];

// In-memory session store
const sessions = new Map<string, ConversationSession>();

// ─── Scenario Discovery ───

/**
 * Get available scenarios filtered by difficulty
 */
export function getScenarios(level?: string): ConversationScenario[] {
    if (!level) return SCENARIOS;
    return SCENARIOS.filter(s => s.difficulty === level.toUpperCase());
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): ConversationScenario | undefined {
    return SCENARIOS.find(s => s.id === id);
}

// ─── Conversation Management ───

/**
 * Start a new conversation session
 */
export function startConversation(userId: string, scenarioId: string): ConversationSession {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);

    const sessionId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Generate NPC opening line
    const opening = generateNPCOpening(scenario);

    const session: ConversationSession = {
        id: sessionId,
        scenario,
        turns: [{ role: 'npc', text: opening, timestamp: new Date() }],
        userId,
        startedAt: new Date(),
        status: 'active',
    };

    sessions.set(sessionId, session);
    return session;
}

/**
 * Submit user message and get NPC response
 * In production: calls Gemini 2.0 Flash API
 */
export async function submitUserMessage(
    sessionId: string,
    userMessage: string
): Promise<{ npcResponse: string; feedback: TurnFeedback; session: ConversationSession }> {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (session.status !== 'active') throw new Error('Session is not active');

    // Add user turn
    const feedback = analyzeUserTurn(userMessage, session.scenario);
    session.turns.push({
        role: 'user',
        text: userMessage,
        timestamp: new Date(),
        feedback,
    });

    // Generate NPC response (production: Gemini 2.0 Flash API call)
    const npcResponse = generateNPCResponse(session);
    session.turns.push({
        role: 'npc',
        text: npcResponse,
        timestamp: new Date(),
    });

    // Auto-complete after 10 turns
    if (session.turns.length >= 20) {
        completeConversation(sessionId);
    }

    return { npcResponse, feedback, session };
}

/**
 * Complete a conversation and generate summary
 */
export function completeConversation(sessionId: string): SessionSummary {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.status = 'completed';

    const userTurns = session.turns.filter(t => t.role === 'user');
    const feedbacks = userTurns.filter(t => t.feedback).map(t => t.feedback!);

    const avgNaturalness = feedbacks.length > 0
        ? Math.round(feedbacks.reduce((s, f) => s + f.naturalness, 0) / feedbacks.length)
        : 0;

    const grammarErrorCount = feedbacks.reduce((s, f) => s + f.grammarCorrections.length, 0);

    // Calculate XP: base 20 + naturalness bonus + grammar bonus
    const xpEarned = Math.round(
        20 +
        avgNaturalness * 0.3 +
        Math.max(0, (10 - grammarErrorCount) * 2)
    );

    const summary: SessionSummary = {
        totalTurns: session.turns.length,
        avgNaturalness,
        grammarErrorCount,
        newWordsUsed: [...new Set(feedbacks.flatMap(f => f.vocabularySuggestions))].slice(0, 5),
        objectivesMet: session.scenario.objectives.slice(0, Math.ceil(session.scenario.objectives.length * avgNaturalness / 100)),
        xpEarned,
        overallGrade: avgNaturalness >= 80 ? 'Excellent' : avgNaturalness >= 60 ? 'Good' : 'Keep Practicing',
        feedbackVi: avgNaturalness >= 80
            ? 'Cuộc hội thoại rất tự nhiên! Bạn đang tiến bộ vượt bậc 🌟'
            : avgNaturalness >= 60
                ? 'Khá tốt! Hãy chú ý thêm ngữ pháp và từ vựng chuyên môn 💪'
                : 'Đừng ngại mắc lỗi — mỗi cuộc hội thoại đều là cơ hội học hỏi! 🎯',
    };

    session.summary = summary;
    return summary;
}

/**
 * Get session by ID
 */
export function getSession(sessionId: string): ConversationSession | undefined {
    return sessions.get(sessionId);
}

/**
 * Get all sessions for a user
 */
export function getUserSessions(userId: string): ConversationSession[] {
    return [...sessions.values()].filter(s => s.userId === userId);
}

// ─── NPC Intelligence (Gemini 2.0 Flash placeholder) ───

function generateNPCOpening(scenario: ConversationScenario): string {
    const openings: Record<string, string> = {
        'a1-cafe': 'Guten Morgen! Willkommen im Café. Was möchten Sie bestellen?',
        'a1-intro': 'Hallo! Ich bin Max. Wie heißt du? Woher kommst du?',
        'a2-shopping': 'Guten Tag! Kann ich Ihnen helfen? Suchen Sie etwas Bestimmtes?',
        'a2-doctor': 'Guten Tag, bitte nehmen Sie Platz. Was führt Sie zu mir?',
        'b1-apartment': 'Guten Tag! Schön, dass Sie sich die Wohnung ansehen möchten. Kommen Sie herein!',
        'b1-job-interview': 'Guten Tag! Vielen Dank, dass Sie heute gekommen sind. Erzählen Sie mir bitte etwas über sich.',
        'b2-debate': 'Willkommen zum Seminar. Heute diskutieren wir über Nachhaltigkeit und Klimapolitik. Was ist Ihre Meinung dazu?',
        'b2-business': 'Guten Morgen, alle zusammen. Lassen Sie uns mit dem Statusbericht anfangen. Wie ist der aktuelle Stand?',
    };

    return openings[scenario.id] || `Hallo! Willkommen. ${scenario.description}`;
}

function generateNPCResponse(session: ConversationSession): string {
    const scenario = session.scenario;
    const lastUserMsg = session.turns.filter(t => t.role === 'user').pop()?.text || '';
    const turnCount = session.turns.filter(t => t.role === 'npc').length;

    // Level-adapted response complexity
    const responses = getNPCResponses(scenario, lastUserMsg, turnCount);
    return responses;
}

function getNPCResponses(scenario: ConversationScenario, userMsg: string, turnCount: number): string {
    const lower = userMsg.toLowerCase();

    // Scenario-specific contextual responses
    if (scenario.id.startsWith('a1-cafe')) {
        if (lower.includes('kaffee') || lower.includes('tee')) {
            return 'Sehr gerne! Möchten Sie noch etwas dazu? Wir haben heute frischen Kuchen.';
        }
        if (lower.includes('kuchen') || lower.includes('essen')) {
            return 'Wir haben Apfelkuchen und Schokoladentorte. Was möchten Sie?';
        }
        if (lower.includes('zahlen') || lower.includes('rechnung')) {
            return 'Natürlich! Das macht zusammen 7,50 Euro. Bar oder mit Karte?';
        }
        if (turnCount >= 4) {
            return 'Möchten Sie noch etwas bestellen? Oder möchten Sie zahlen?';
        }
        return 'Das klingt gut! Möchten Sie etwas zu trinken dazu?';
    }

    if (scenario.id.startsWith('a1-intro')) {
        if (lower.includes('vietnam') || lower.includes('komme aus')) {
            return 'Oh, interessant! Ich war noch nie in Vietnam. Was machst du beruflich? Oder studierst du?';
        }
        if (lower.includes('student') || lower.includes('studiere') || lower.includes('arbeit')) {
            return 'Super! Und was sind deine Hobbys? Ich spiele gern Fußball und lese Bücher.';
        }
        return 'Das ist toll! Seit wann lernst du Deutsch? Dein Deutsch ist schon gut!';
    }

    if (scenario.id.startsWith('a2')) {
        if (lower.includes('ja') || lower.includes('bitte') || lower.includes('gern')) {
            return 'Wunderbar! Haben Sie noch Fragen? Ich helfe Ihnen gerne weiter.';
        }
        return 'Verstehe. Können Sie das bitte genauer beschreiben? Ich möchte Ihnen bestmöglich helfen.';
    }

    if (scenario.id.startsWith('b1')) {
        if (lower.includes('erfahrung') || lower.includes('arbeit')) {
            return 'Das klingt vielversprechend. Könnten Sie mir ein konkretes Beispiel geben, wie Sie diese Fähigkeit eingesetzt haben?';
        }
        return 'Interessant. Und wie würden Sie mit einer schwierigen Situation in diesem Bereich umgehen?';
    }

    if (scenario.id.startsWith('b2')) {
        if (lower.includes('meinung') || lower.includes('denke') || lower.includes('glaube')) {
            return 'Ein interessanter Standpunkt. Aber haben Sie auch die Gegenargumente berücksichtigt? Wie würden Sie auf den Einwand reagieren, dass wirtschaftliche Interessen oft Vorrang haben?';
        }
        return 'Das ist ein valider Punkt. Könnten Sie Ihre These mit konkreten Daten oder Beispielen untermauern?';
    }

    return 'Das ist interessant! Erzählen Sie mir mehr darüber.';
}

/**
 * Analyze user's message for grammar, vocabulary, naturalness
 */
function analyzeUserTurn(message: string, scenario: ConversationScenario): TurnFeedback {
    const corrections: TurnFeedback['grammarCorrections'] = [];
    const suggestions: string[] = [];
    const lower = message.toLowerCase();

    // Check if user used vocabulary from the scenario
    for (const word of scenario.vocabularyFocus) {
        if (lower.includes(word.toLowerCase())) {
            suggestions.push(word);
        }
    }

    // Basic grammar checks (production: Gemini API)
    // Check common A1/A2 errors
    if (/\bich bin (\d+) jahre\b/i.test(message) && !message.includes('alt')) {
        corrections.push({ original: message.match(/ich bin \d+ Jahre/i)?.[0] || '', corrected: message.match(/ich bin \d+ Jahre/i)?.[0] + ' alt' || '', rule: 'Alter: "Ich bin X Jahre alt"' });
    }
    if (/\bich habe \w+ Jahre\b/i.test(message) && message.includes('alt')) {
        corrections.push({ original: 'ich habe...alt', corrected: 'Ich bin...alt', rule: 'Alter mit "sein", nicht "haben"' });
    }
    if (/\bin die Schule\b/i.test(message) && !message.includes('gehe')) {
        corrections.push({ original: 'in die Schule', corrected: 'Ich gehe in die Schule', rule: 'Bewegung → Akkusativ mit "gehen"' });
    }

    // Naturalness based on message length, vocabulary depth
    const wordCount = message.split(/\s+/).length;
    let naturalness = 50;

    if (wordCount >= 5) naturalness += 10;
    if (wordCount >= 10) naturalness += 10;
    if (suggestions.length > 0) naturalness += 15;
    if (corrections.length === 0) naturalness += 15;
    if (/[.!?]$/.test(message.trim())) naturalness += 5; // Proper punctuation

    naturalness = Math.min(100, naturalness);

    return {
        grammarCorrections: corrections,
        vocabularySuggestions: suggestions,
        naturalness,
        tip: corrections.length > 0
            ? `💡 Lưu ý: ${corrections[0].rule}`
            : suggestions.length > 0
                ? `✨ Bạn đã dùng đúng từ vựng: ${suggestions.join(', ')}`
                : undefined,
    };
}

/**
 * Generate Gemini API system prompt for a scenario
 * (Used when calling Gemini 2.0 Flash in production)
 */
export function buildGeminiSystemPrompt(scenario: ConversationScenario): string {
    return `You are ${scenario.npcName}, a ${scenario.npcRole}. ${scenario.npcPersonality}.

Setting: ${scenario.setting}
CEFR Level: ${scenario.difficulty}

RULES:
1. Stay in character as ${scenario.npcName} at all times
2. Speak ONLY in German at ${scenario.difficulty} level
3. Use vocabulary: ${scenario.vocabularyFocus.join(', ')}
4. Focus grammar: ${scenario.grammarFocus.join(', ')}
5. If the user makes a grammar mistake, gently correct them IN the conversation naturally
6. Adjust complexity: speak ${scenario.difficulty === 'A1' ? 'very slowly with simple words' : scenario.difficulty === 'A2' ? 'clearly with common vocabulary' : scenario.difficulty === 'B1' ? 'at normal pace with some complex structures' : 'fluently with advanced vocabulary and idioms'}
7. Keep responses under 3 sentences for A1-A2, under 5 for B1-B2
8. If user seems confused, simplify and offer help
9. Move the conversation toward these objectives: ${scenario.objectives.join(', ')}
10. After 8-10 exchanges, naturally wrap up the conversation`;
}
