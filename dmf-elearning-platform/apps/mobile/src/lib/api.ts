/**
 * API Client for DMF Mobile
 * Connects to learning-service backend
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json', ...options?.headers },
            ...options,
        });
        return await res.json();
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export const api = {
    // Vocabulary
    getVocabulary: (level?: string) => request(`/vocabulary?level=${level || 'A1'}`),
    getReviewQueue: (userId: string) => request(`/review/queue?userId=${userId}`),
    submitReview: (data: any) => request('/review/submit', { method: 'POST', body: JSON.stringify(data) }),

    // Reading
    getReadingContent: (level?: string) => request(`/reading?level=${level || 'A1'}`),

    // Gamification
    getXP: (userId: string) => request(`/gamification/xp?userId=${userId}`),
    awardXP: (data: any) => request('/gamification/xp/award', { method: 'POST', body: JSON.stringify(data) }),
    getLeaderboard: () => request('/gamification/leaderboard'),
    getAchievements: (userId: string) => request(`/gamification/achievements?userId=${userId}`),
    updateStreak: (data: any) => request('/gamification/streak', { method: 'POST', body: JSON.stringify(data) }),

    // Education
    assessCEFR: (mastery: any) => request('/education/cefr/assess', { method: 'POST', body: JSON.stringify({ mastery }) }),
    checkReadiness: (data: any) => request('/education/readiness/check', { method: 'POST', body: JSON.stringify(data) }),

    // User
    getUserProfile: (userId: string) => request(`/user/profile?userId=${userId}`),
};

export default api;
