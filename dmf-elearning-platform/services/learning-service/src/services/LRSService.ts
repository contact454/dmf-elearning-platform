/**
 * Learning Record Store (LRS) Service — Phase 3, Sprint 3.1
 * xAPI-compatible event tracking + student behavior profiling
 * Designed for BigQuery analytics warehouse
 */

// ─── xAPI Statement Format ───

export interface xAPIStatement {
    id: string;
    actor: xAPIActor;
    verb: xAPIVerb;
    object: xAPIObject;
    result?: xAPIResult;
    context?: xAPIContext;
    timestamp: string; // ISO 8601
    stored?: string;
}

interface xAPIActor {
    mbox: string;       // mailto:user@example.com
    name?: string;
    objectType: 'Agent';
}

interface xAPIVerb {
    id: string;         // IRI e.g. http://adlnet.gov/expapi/verbs/completed
    display: Record<string, string>;
}

interface xAPIObject {
    id: string;         // IRI of the learning object
    objectType: 'Activity';
    definition?: {
        name?: Record<string, string>;
        description?: Record<string, string>;
        type?: string;     // Activity type IRI
        extensions?: Record<string, any>;
    };
}

interface xAPIResult {
    score?: { scaled?: number; raw?: number; min?: number; max?: number };
    success?: boolean;
    completion?: boolean;
    duration?: string;   // ISO 8601 duration e.g. PT30S
    extensions?: Record<string, any>;
}

interface xAPIContext {
    registration?: string;
    contextActivities?: {
        parent?: xAPIObject[];
        grouping?: xAPIObject[];
        category?: xAPIObject[];
    };
    extensions?: Record<string, any>;
}

// ─── xAPI Verb Registry ───

export const VERBS = {
    started: { id: 'http://activitystrea.ms/start', display: { en: 'started', de: 'gestartet', vi: 'bắt đầu' } },
    completed: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { en: 'completed', de: 'abgeschlossen', vi: 'hoàn thành' } },
    attempted: { id: 'http://adlnet.gov/expapi/verbs/attempted', display: { en: 'attempted', de: 'versucht', vi: 'thử' } },
    answered: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { en: 'answered', de: 'beantwortet', vi: 'trả lời' } },
    experienced: { id: 'http://adlnet.gov/expapi/verbs/experienced', display: { en: 'experienced', de: 'erfahren', vi: 'trải nghiệm' } },
    mastered: { id: 'http://adlnet.gov/expapi/verbs/mastered', display: { en: 'mastered', de: 'gemeistert', vi: 'làm chủ' } },
    failed: { id: 'http://adlnet.gov/expapi/verbs/failed', display: { en: 'failed', de: 'nicht bestanden', vi: 'thất bại' } },
    paused: { id: 'http://id.tincanapi.com/verb/paused', display: { en: 'paused', de: 'pausiert', vi: 'tạm dừng' } },
    resumed: { id: 'http://id.tincanapi.com/verb/resumed', display: { en: 'resumed', de: 'fortgesetzt', vi: 'tiếp tục' } },
    reviewed: { id: 'http://id.tincanapi.com/verb/reviewed', display: { en: 'reviewed', de: 'überprüft', vi: 'ôn tập' } },
    scored: { id: 'http://adlnet.gov/expapi/verbs/scored', display: { en: 'scored', de: 'bewertet', vi: 'chấm điểm' } },
    interacted: { id: 'http://adlnet.gov/expapi/verbs/interacted', display: { en: 'interacted', de: 'interagiert', vi: 'tương tác' } },
} as const;

// ─── LRS Store ───

const statements: xAPIStatement[] = [];
const userProfiles = new Map<string, StudentBehaviorProfile>();

export interface StudentBehaviorProfile {
    userId: string;
    totalStatements: number;
    firstSeen: Date;
    lastSeen: Date;
    // Engagement signals
    avgSessionMinutes: number;
    sessionsPerWeek: number;
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    loginStreak: number;
    // Learning signals
    avgAccuracy: number;
    strongSkills: string[];
    weakSkills: string[];
    cefrLevel: string;
    vocabMastered: number;
    // Risk signals
    dropoffRisk: 'low' | 'medium' | 'high';
    motivationTrend: 'rising' | 'stable' | 'declining';
    lastActivityDaysAgo: number;
}

// ─── Core Functions ───

/**
 * Store an xAPI statement
 */
export function storeStatement(stmt: Omit<xAPIStatement, 'id' | 'stored'>): xAPIStatement {
    const full: xAPIStatement = {
        ...stmt,
        id: `stmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        stored: new Date().toISOString(),
    };

    statements.push(full);
    if (statements.length > 200000) statements.splice(0, statements.length - 200000);

    // Update user profile
    updateProfile(stmt.actor.mbox, full);
    return full;
}

/**
 * Convenience: track a learning event in xAPI format
 */
export function trackLearningEvent(params: {
    userId: string;
    verb: keyof typeof VERBS;
    activityId: string;
    activityName: string;
    activityType: string;
    score?: number;
    success?: boolean;
    duration?: number;  // seconds
    cefrLevel?: string;
    module?: string;
    extras?: Record<string, any>;
}): xAPIStatement {
    return storeStatement({
        actor: { mbox: `mailto:${params.userId}@dmf.edu`, name: params.userId, objectType: 'Agent' },
        verb: VERBS[params.verb],
        object: {
            id: `https://dmf.edu/activities/${params.activityType}/${params.activityId}`,
            objectType: 'Activity',
            definition: {
                name: { de: params.activityName, vi: params.activityName },
                type: `https://dmf.edu/activity-types/${params.activityType}`,
                extensions: params.extras ? { 'https://dmf.edu/extensions': params.extras } : undefined,
            },
        },
        result: (params.score != null || params.success != null || params.duration != null) ? {
            score: params.score != null ? { scaled: params.score / 100, raw: params.score, min: 0, max: 100 } : undefined,
            success: params.success,
            duration: params.duration ? `PT${params.duration}S` : undefined,
        } : undefined,
        context: {
            extensions: {
                'https://dmf.edu/extensions/cefrLevel': params.cefrLevel,
                'https://dmf.edu/extensions/module': params.module,
            },
        },
        timestamp: new Date().toISOString(),
    });
}

/**
 * Query statements by user
 */
export function getStatements(filters?: {
    userId?: string;
    verb?: string;
    since?: string;
    limit?: number;
}): xAPIStatement[] {
    let result = [...statements];
    if (filters?.userId) result = result.filter(s => s.actor.mbox.includes(filters.userId!));
    if (filters?.verb) result = result.filter(s => s.verb.id.includes(filters.verb!));
    if (filters?.since) result = result.filter(s => s.timestamp >= filters.since!);
    return result.slice(-(filters?.limit || 100));
}

/**
 * Get or create student behavior profile
 */
export function getStudentProfile(userId: string): StudentBehaviorProfile {
    if (!userProfiles.has(userId)) {
        userProfiles.set(userId, createEmptyProfile(userId));
    }
    return userProfiles.get(userId)!;
}

/**
 * Export for BigQuery batch upload
 */
export function exportStatements(since?: string): {
    count: number;
    statements: xAPIStatement[];
    format: 'xAPI-1.0.3';
} {
    const filtered = since ? statements.filter(s => s.timestamp >= since) : [...statements];
    return { count: filtered.length, statements: filtered, format: 'xAPI-1.0.3' };
}

// ─── Profile Builder ───

function updateProfile(mbox: string, stmt: xAPIStatement): void {
    const userId = mbox.replace('mailto:', '').replace('@dmf.edu', '');
    const profile = getStudentProfile(userId);

    profile.totalStatements++;
    profile.lastSeen = new Date();
    profile.lastActivityDaysAgo = 0;

    // Update accuracy
    if (stmt.result?.score?.scaled != null) {
        const n = profile.totalStatements;
        profile.avgAccuracy = Math.round(((profile.avgAccuracy * (n - 1)) + stmt.result.score.scaled * 100) / n);
    }

    // Update skill strengths/weaknesses
    const module = stmt.context?.extensions?.['https://dmf.edu/extensions/module'];
    const score = stmt.result?.score?.scaled;
    if (module && score != null) {
        if (score >= 0.8 && !profile.strongSkills.includes(module)) {
            profile.strongSkills.push(module);
            profile.weakSkills = profile.weakSkills.filter(s => s !== module);
        } else if (score < 0.5 && !profile.weakSkills.includes(module)) {
            profile.weakSkills.push(module);
        }
    }

    // CEFR level
    const cefr = stmt.context?.extensions?.['https://dmf.edu/extensions/cefrLevel'];
    if (cefr) profile.cefrLevel = cefr;

    // Mastery count
    if (stmt.verb.id.includes('mastered')) profile.vocabMastered++;

    // Motivation trend
    const recentStmts = statements.filter(s => s.actor.mbox === mbox).slice(-20);
    const recentScores = recentStmts.filter(s => s.result?.score?.scaled != null).map(s => s.result!.score!.scaled!);
    if (recentScores.length >= 5) {
        const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
        const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        profile.motivationTrend = avgSecond > avgFirst + 0.05 ? 'rising' : avgSecond < avgFirst - 0.05 ? 'declining' : 'stable';
    }

    // Dropoff risk
    profile.dropoffRisk = profile.motivationTrend === 'declining' ? 'high'
        : profile.sessionsPerWeek < 2 ? 'medium' : 'low';

    // Preferred time
    const hour = new Date().getHours();
    profile.preferredTimeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
}

function createEmptyProfile(userId: string): StudentBehaviorProfile {
    return {
        userId,
        totalStatements: 0,
        firstSeen: new Date(),
        lastSeen: new Date(),
        avgSessionMinutes: 0,
        sessionsPerWeek: 0,
        preferredTimeOfDay: 'afternoon',
        loginStreak: 0,
        avgAccuracy: 0,
        strongSkills: [],
        weakSkills: [],
        cefrLevel: 'A1',
        vocabMastered: 0,
        dropoffRisk: 'low',
        motivationTrend: 'stable',
        lastActivityDaysAgo: 0,
    };
}
