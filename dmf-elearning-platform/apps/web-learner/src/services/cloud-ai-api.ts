/**
 * Cloud AI API Client — Sprint 7.3
 * Typed client for Phase 1-6 Cloud Run endpoints
 * Uses existing axios api instance from api.ts
 */

import { api } from './api';

// ═══════════════ TYPES ═══════════════

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: { code: string; message: string };
}

// Analytics
export interface DashboardMetrics {
    overview: { totalUsers: number; activeToday: number; activeThisWeek: number; retentionRate7d: number; avgSessionMinutes: number };
    engagement: { dailyActiveUsers: { date: string; count: number }[]; avgReviewsPerDay: number; peakHours: { hour: number; sessions: number }[] };
    learning: { avgAccuracy: number; cefrDistribution: Record<string, number>; vocabMastered: number };
    gamification: { totalXPAwarded: number; avgXPPerUser: number; achievementsUnlocked: number; activeStreaks: number };
    topContent: { id: string; title: string; views: number; completionRate: number }[];
}

// NPC Conversation
export interface ConversationSession {
    sessionId: string;
    scenarioId: string;
    userId: string;
    turns: { role: 'user' | 'npc'; text: string; timestamp: string; corrections?: string[] }[];
    status: 'active' | 'completed';
    feedback?: { accuracy: number; fluency: number; tips: string[] };
}

// Socratic Tutor
export interface TutorSession {
    sessionId: string;
    userId: string;
    topic: string;
    scaffoldLevel: number;
    messages: { role: 'tutor' | 'student'; text: string; timestamp: string }[];
    status: 'active' | 'resolved' | 'abandoned';
}

// Recommendations
export interface Recommendation {
    id: string;
    contentId: string;
    title: string;
    type: string;
    reason: string;
    reasonType: string;
    score: number;
    difficulty: string;
}

// Early Warning
export interface WarningAlert {
    userId: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    suggestedAction: string;
    detectedAt: string;
}

// AR
export interface ARScene {
    id: string;
    name: string;
    nameVi: string;
    description: string;
    difficulty: string;
    objects: { id: string; labelDe: string; labelEn: string; article: string; plural: string; ipa: string }[];
}

// ═══════════════ API CLIENT ═══════════════

const CLOUD_URL = process.env.NEXT_PUBLIC_CLOUD_API_URL || 'https://dmf-learning-service-217304868664.asia-southeast1.run.app';

// Create cloud-specific axios instance
const cloudApi = api; // Reuse existing interceptors
cloudApi.defaults.baseURL = CLOUD_URL;

export const cloudAI = {
    // ─── Analytics (Phase 1) ───
    analytics: {
        getDashboard: () =>
            cloudApi.get<ApiResponse<DashboardMetrics>>('/api/analytics/dashboard').then(r => r.data),
        trackEvent: (event: { userId: string; action: string; data?: Record<string, unknown> }) =>
            cloudApi.post<ApiResponse<void>>('/api/analytics/events', event).then(r => r.data),
        getModuleStats: (moduleId: string) =>
            cloudApi.get<ApiResponse<unknown>>(`/api/analytics/modules/${moduleId}`).then(r => r.data),
    },

    // ─── Notifications (Phase 1) ───
    notifications: {
        registerDevice: (token: string, platform: string) =>
            cloudApi.post<ApiResponse<unknown>>('/api/notifications/register', { token, platform }).then(r => r.data),
        getPending: (userId: string) =>
            cloudApi.get<ApiResponse<unknown[]>>(`/api/notifications/pending/${userId}`).then(r => r.data),
        scheduleNudge: (nudge: { userId: string; type: string; scheduledFor: string }) =>
            cloudApi.post<ApiResponse<unknown>>('/api/notifications/nudge', nudge).then(r => r.data),
    },

    // ─── NPC Conversations (Phase 2) ───
    npc: {
        startConversation: (userId: string, scenarioId: string, cefrLevel: string) =>
            cloudApi.post<ApiResponse<ConversationSession>>('/api/assessment/conversation/start', { userId, scenarioId, cefrLevel }).then(r => r.data),
        sendMessage: (sessionId: string, message: string) =>
            cloudApi.post<ApiResponse<ConversationSession>>('/api/assessment/conversation/respond', { sessionId, message }).then(r => r.data),
        endConversation: (sessionId: string) =>
            cloudApi.post<ApiResponse<ConversationSession>>(`/api/assessment/conversation/end`, { sessionId }).then(r => r.data),
        getScenarios: () =>
            cloudApi.get<ApiResponse<unknown[]>>('/api/assessment/conversation/scenarios').then(r => r.data),
    },

    // ─── Prosody (Phase 2) ───
    prosody: {
        analyze: (audioData: string, referenceText: string) =>
            cloudApi.post<ApiResponse<unknown>>('/api/assessment/prosody/analyze', { audioData, referenceText }).then(r => r.data),
    },

    // ─── Adaptive (Phase 3) ───
    adaptive: {
        getSchedule: (userId: string) =>
            cloudApi.get<ApiResponse<unknown>>(`/api/adaptive/schedule/${userId}`).then(r => r.data),
        getProfile: (userId: string) =>
            cloudApi.get<ApiResponse<unknown>>(`/api/adaptive/profile/${userId}`).then(r => r.data),
        trackXAPI: (statement: { actor: string; verb: string; object: string; result?: unknown }) =>
            cloudApi.post<ApiResponse<unknown>>('/api/adaptive/xapi/statements', statement).then(r => r.data),
    },

    // ─── Recommendations (Phase 4) ───
    recommend: {
        getPersonalized: (userId: string, count?: number) =>
            cloudApi.post<ApiResponse<{ recommendations: Recommendation[]; reasoning: string }>>('/api/recommend/personalized', { userId, count }).then(r => r.data),
        findSimilar: (query: string, limit?: number) =>
            cloudApi.post<ApiResponse<unknown[]>>('/api/recommend/similar', { query, limit }).then(r => r.data),
    },

    // ─── Socratic Tutor (Phase 5) ───
    tutor: {
        startSession: (userId: string, topic: string, stuckPoint?: string) =>
            cloudApi.post<ApiResponse<TutorSession>>('/api/agents/tutor/start', { userId, topic, stuckPoint }).then(r => r.data),
        respond: (sessionId: string, message: string) =>
            cloudApi.post<ApiResponse<TutorSession>>('/api/agents/tutor/respond', { sessionId, message }).then(r => r.data),
        resolve: (sessionId: string) =>
            cloudApi.post<ApiResponse<TutorSession>>(`/api/agents/tutor/resolve`, { sessionId }).then(r => r.data),
        getHistory: (userId: string) =>
            cloudApi.get<ApiResponse<TutorSession[]>>(`/api/agents/tutor/history/${userId}`).then(r => r.data),
    },

    // ─── Early Warning (Phase 5) ───
    warnings: {
        scan: (userId: string) =>
            cloudApi.post<ApiResponse<WarningAlert[]>>('/api/agents/warnings/scan', { userId }).then(r => r.data),
        getActive: () =>
            cloudApi.get<ApiResponse<WarningAlert[]>>('/api/agents/warnings/active').then(r => r.data),
        resolve: (alertId: string) =>
            cloudApi.post<ApiResponse<unknown>>(`/api/agents/warnings/resolve`, { alertId }).then(r => r.data),
    },

    // ─── Admin Concierge (Phase 5) ───
    concierge: {
        ask: (question: string) =>
            cloudApi.post<ApiResponse<{ answer: string; suggestedActions?: string[] }>>('/api/agents/concierge', { question }).then(r => r.data),
    },

    // ─── Edge AI (Phase 6) ───
    edge: {
        getModels: (platform?: string) =>
            cloudApi.get<ApiResponse<unknown[]>>('/api/advanced/edge/models', { params: { platform } }).then(r => r.data),
        getManifest: (platform: string) =>
            cloudApi.get<ApiResponse<unknown>>(`/api/advanced/edge/manifest/${platform}`).then(r => r.data),
    },

    // ─── Spatial AR (Phase 6) ───
    ar: {
        getScenes: (level?: string) =>
            cloudApi.get<ApiResponse<ARScene[]>>('/api/advanced/ar/scenes', { params: { level } }).then(r => r.data),
        getScene: (id: string) =>
            cloudApi.get<ApiResponse<ARScene>>(`/api/advanced/ar/scenes/${id}`).then(r => r.data),
        detectObject: (label: string, sceneId?: string) =>
            cloudApi.post<ApiResponse<unknown>>('/api/advanced/ar/detect', { label, sceneId }).then(r => r.data),
        getFlashcard: (objectId: string, mode?: 'learn' | 'quiz' | 'review') =>
            cloudApi.get<ApiResponse<unknown>>(`/api/advanced/ar/flashcard/${objectId}`, { params: { mode } }).then(r => r.data),
        getVocabulary: () =>
            cloudApi.get<ApiResponse<unknown[]>>('/api/advanced/ar/vocabulary').then(r => r.data),
    },

    // ─── Continual Learning (Phase 6) ───
    ml: {
        detectDrift: (modelName: string) =>
            cloudApi.post<ApiResponse<unknown>>('/api/advanced/ml/drift/detect', { modelName }).then(r => r.data),
        getMemory: (userId: string) =>
            cloudApi.get<ApiResponse<unknown>>(`/api/advanced/ml/memory/${userId}`).then(r => r.data),
    },
};

export default cloudAI;
