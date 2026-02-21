'use client';

/**
 * React Hooks for Cloud AI Services — Sprint 7.3
 * Drop-in hooks for Socratic Tutor, NPC Conversations,
 * Recommendations, Analytics, and Early Warnings
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import cloudAI, {
    type TutorSession,
    type ConversationSession,
    type Recommendation,
    type DashboardMetrics,
    type WarningAlert,
    type ARScene,
} from '@/services/cloud-ai-api';

// ═══════════════ useSocraticTutor ═══════════════

export function useSocraticTutor(userId: string) {
    const [session, setSession] = useState<TutorSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startSession = useCallback(async (topic: string, stuckPoint?: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await cloudAI.tutor.startSession(userId, topic, stuckPoint);
            if (res.success) setSession(res.data);
            else setError(res.error?.message || 'Failed to start session');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const sendMessage = useCallback(async (message: string) => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await cloudAI.tutor.respond(session.sessionId, message);
            if (res.success) setSession(res.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const resolveSession = useCallback(async () => {
        if (!session) return;
        try {
            await cloudAI.tutor.resolve(session.sessionId);
            setSession(null);
        } catch (err: any) {
            setError(err.message);
        }
    }, [session]);

    return { session, loading, error, startSession, sendMessage, resolveSession };
}

// ═══════════════ useNPCConversation ═══════════════

export function useNPCConversation(userId: string) {
    const [session, setSession] = useState<ConversationSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startConversation = useCallback(async (scenarioId: string, cefrLevel: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await cloudAI.npc.startConversation(userId, scenarioId, cefrLevel);
            if (res.success) setSession(res.data);
            else setError(res.error?.message || 'Failed to start');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const sendMessage = useCallback(async (message: string) => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await cloudAI.npc.sendMessage(session.sessionId, message);
            if (res.success) setSession(res.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const endConversation = useCallback(async () => {
        if (!session) return;
        try {
            const res = await cloudAI.npc.endConversation(session.sessionId);
            if (res.success) setSession(res.data);
        } catch (err: any) {
            setError(err.message);
        }
    }, [session]);

    return { session, loading, error, startConversation, sendMessage, endConversation };
}

// ═══════════════ useRecommendations ═══════════════

export function useRecommendations(userId: string, autoFetch = true) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [reasoning, setReasoning] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const fetched = useRef(false);

    const fetchRecommendations = useCallback(async (count = 5) => {
        setLoading(true);
        try {
            const res = await cloudAI.recommend.getPersonalized(userId, count);
            if (res.success && res.data) {
                setRecommendations(res.data.recommendations || []);
                setReasoning(res.data.reasoning || '');
            }
        } catch (err) {
            console.error('Recommendations error:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (autoFetch && userId && !fetched.current) {
            fetched.current = true;
            fetchRecommendations();
        }
    }, [autoFetch, userId, fetchRecommendations]);

    return { recommendations, reasoning, loading, refresh: fetchRecommendations };
}

// ═══════════════ useAnalytics ═══════════════

export function useAnalytics() {
    const [dashboard, setDashboard] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await cloudAI.analytics.getDashboard();
            if (res.success) setDashboard(res.data);
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return { dashboard, loading, refresh: fetchDashboard };
}

// ═══════════════ useEarlyWarnings ═══════════════

export function useEarlyWarnings() {
    const [alerts, setAlerts] = useState<WarningAlert[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await cloudAI.warnings.getActive();
            if (res.success) setAlerts(res.data || []);
        } catch (err) {
            console.error('Warnings error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const scanUser = useCallback(async (userId: string) => {
        try {
            const res = await cloudAI.warnings.scan(userId);
            if (res.success) return res.data;
        } catch (err) {
            console.error('Scan error:', err);
        }
        return [];
    }, []);

    return { alerts, loading, fetchAlerts, scanUser };
}

// ═══════════════ useARScenes ═══════════════

export function useARScenes(level?: string) {
    const [scenes, setScenes] = useState<ARScene[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cloudAI.ar.getScenes(level)
            .then(res => { if (res.success) setScenes(res.data || []); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [level]);

    return { scenes, loading };
}

// ═══════════════ useAdminConcierge ═══════════════

export function useAdminConcierge() {
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const ask = useCallback(async (question: string) => {
        setMessages(prev => [...prev, { role: 'user', text: question }]);
        setLoading(true);
        try {
            const res = await cloudAI.concierge.ask(question);
            if (res.success && res.data) {
                setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
            }
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'bot', text: `Error: ${err.message}` }]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => setMessages([]), []);

    return { messages, loading, ask, clear };
}
