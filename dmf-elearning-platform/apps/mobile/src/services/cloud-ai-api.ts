/**
 * Cloud AI API Client — React Native (Expo)
 * Adapted from web-learner cloud-ai-api.ts for React Native
 */

const CLOUD_URL = process.env.EXPO_PUBLIC_CLOUD_API_URL || 'https://dmf-learning-service-217304868664.asia-southeast1.run.app';

// ═══════════════ TYPES ═══════════════

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: { code: string; message: string };
}

export interface ConversationSession {
    sessionId: string;
    scenarioId: string;
    turns: { role: 'user' | 'npc'; text: string; corrections?: string[] }[];
    status: 'active' | 'completed';
    feedback?: { accuracy: number; fluency: number; tips: string[] };
}

export interface TutorSession {
    sessionId: string;
    topic: string;
    scaffoldLevel: number;
    messages: { role: 'tutor' | 'student'; text: string; timestamp: string }[];
    status: 'active' | 'resolved';
}

export interface Recommendation {
    id: string;
    title: string;
    type: string;
    reason: string;
    score: number;
    difficulty: string;
}

// ═══════════════ FETCH HELPER ═══════════════

let authToken: string | null = null;

export function setMobileAuthToken(token: string) { authToken = token; }
export function clearMobileAuthToken() { authToken = null; }

async function apiFetch<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

    const res = await fetch(`${CLOUD_URL}${path}`, {
        ...options,
        headers: { ...headers, ...(options?.headers as Record<string, string>) },
    });

    return res.json();
}

// ═══════════════ API CLIENT ═══════════════

export const mobileAPI = {
    // ─── Analytics ───
    analytics: {
        getDashboard: () => apiFetch('/api/analytics/dashboard'),
        trackEvent: (event: { userId: string; action: string; data?: Record<string, unknown> }) =>
            apiFetch('/api/analytics/events', { method: 'POST', body: JSON.stringify(event) }),
    },

    // ─── NPC Conversations ───
    npc: {
        start: (userId: string, scenarioId: string, cefrLevel: string) =>
            apiFetch<ConversationSession>('/api/assessment/conversation/start', {
                method: 'POST', body: JSON.stringify({ userId, scenarioId, cefrLevel }),
            }),
        respond: (sessionId: string, message: string) =>
            apiFetch<ConversationSession>('/api/assessment/conversation/respond', {
                method: 'POST', body: JSON.stringify({ sessionId, message }),
            }),
        end: (sessionId: string) =>
            apiFetch<ConversationSession>('/api/assessment/conversation/end', {
                method: 'POST', body: JSON.stringify({ sessionId }),
            }),
        scenarios: () => apiFetch('/api/assessment/conversation/scenarios'),
    },

    // ─── Socratic Tutor ───
    tutor: {
        start: (userId: string, topic: string, stuckPoint?: string) =>
            apiFetch<TutorSession>('/api/agents/tutor/start', {
                method: 'POST', body: JSON.stringify({ userId, topic, stuckPoint }),
            }),
        respond: (sessionId: string, message: string) =>
            apiFetch<TutorSession>('/api/agents/tutor/respond', {
                method: 'POST', body: JSON.stringify({ sessionId, message }),
            }),
        history: (userId: string) => apiFetch<TutorSession[]>(`/api/agents/tutor/history/${userId}`),
    },

    // ─── Recommendations ───
    recommend: {
        personalized: (userId: string, count = 5) =>
            apiFetch<{ recommendations: Recommendation[]; reasoning: string }>('/api/recommend/personalized', {
                method: 'POST', body: JSON.stringify({ userId, count }),
            }),
    },

    // ─── Notifications ───
    notifications: {
        register: (token: string, platform: string) =>
            apiFetch('/api/notifications/register', {
                method: 'POST', body: JSON.stringify({ token, platform }),
            }),
        pending: (userId: string) => apiFetch(`/api/notifications/pending/${userId}`),
    },

    // ─── Vocabulary (cached) ───
    vocabulary: {
        list: (level?: string, limit = 50) =>
            apiFetch(`/api/vocabulary?level=${level || ''}&limit=${limit}`),
        random: (count = 10, level?: string) =>
            apiFetch(`/api/vocabulary/random?count=${count}${level ? `&level=${level}` : ''}`),
    },

    // ─── Health ───
    health: () => apiFetch('/health'),
};

export default mobileAPI;
