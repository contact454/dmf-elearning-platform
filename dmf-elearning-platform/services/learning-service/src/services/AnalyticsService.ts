/**
 * Analytics Service — Phase 1, Sprint 1.1
 * Real-time learning analytics aggregation
 * Designed for BigQuery integration (currently in-memory for development)
 */

// ─── Types ───

export interface DashboardMetrics {
    overview: OverviewMetrics;
    engagement: EngagementMetrics;
    learning: LearningMetrics;
    gamification: GamificationMetrics;
    topContent: ContentMetric[];
    recentActivity: ActivityEntry[];
}

interface OverviewMetrics {
    totalUsers: number;
    activeToday: number;
    activeThisWeek: number;
    activeThisMonth: number;
    newUsersThisWeek: number;
    retentionRate7d: number;  // % users returning after 7 days
    avgSessionMinutes: number;
}

interface EngagementMetrics {
    dailyActiveUsers: DailyCount[];  // Last 30 days
    avgReviewsPerDay: number;
    avgSessionsPerUser: number;
    streakDistribution: { streak: number; count: number }[];
    peakHours: { hour: number; sessions: number }[];
}

interface LearningMetrics {
    avgAccuracy: number;           // Overall accuracy %
    cefrDistribution: Record<string, number>;  // A1: 30, A2: 25, etc.
    skillBreakdown: { skill: string; avgScore: number }[];
    completionRates: { module: string; rate: number }[];
    vocabMastered: number;
    avgWordsPerDay: number;
}

interface GamificationMetrics {
    totalXPAwarded: number;
    avgXPPerUser: number;
    achievementsUnlocked: number;
    activeStreaks: number;
    dailyChallengesCompleted: number;
    groupsActive: number;
}

interface ContentMetric {
    id: string;
    title: string;
    type: 'vocabulary' | 'reading' | 'listening' | 'grammar' | 'writing' | 'speaking';
    views: number;
    completionRate: number;
    avgScore: number;
}

interface ActivityEntry {
    userId: string;
    action: string;
    module: string;
    timestamp: Date;
    details?: string;
}

export interface DailyCount {
    date: string;  // YYYY-MM-DD
    count: number;
}

// ─── Analytics Event Tracking ───

export type AnalyticsEvent = {
    userId: string;
    event: string;
    module: string;
    properties: Record<string, any>;
    timestamp: Date;
    sessionId?: string;
};

// In-memory store (production: BigQuery)
const events: AnalyticsEvent[] = [];
const dailyActive = new Map<string, Set<string>>(); // date → userIds

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent): void {
    events.push({ ...event, timestamp: new Date() });

    // Track DAU
    const dateKey = new Date().toISOString().split('T')[0];
    if (!dailyActive.has(dateKey)) dailyActive.set(dateKey, new Set());
    dailyActive.get(dateKey)!.add(event.userId);

    // Keep last 100K events in memory
    if (events.length > 100000) events.splice(0, events.length - 100000);
}

/**
 * Get dashboard metrics
 */
export function getDashboardMetrics(): DashboardMetrics {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Overview
    const allUsers = new Set(events.map(e => e.userId));
    const todayUsers = dailyActive.get(today) || new Set();
    const weekUsers = new Set<string>();
    const monthUsers = new Set<string>();

    for (const [date, users] of dailyActive) {
        if (date >= weekAgo) users.forEach(u => weekUsers.add(u));
        users.forEach(u => monthUsers.add(u));
    }

    // Daily active users (last 30 days)
    const dailyActiveUsers: DailyCount[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dk = d.toISOString().split('T')[0];
        dailyActiveUsers.push({ date: dk, count: dailyActive.get(dk)?.size || 0 });
    }

    // Peak hours
    const hourCounts = new Array(24).fill(0);
    events.forEach(e => hourCounts[new Date(e.timestamp).getHours()]++);
    const peakHours = hourCounts.map((sessions, hour) => ({ hour, sessions }));

    // CEFR distribution (from events)
    const cefrEvents = events.filter(e => e.properties?.cefrLevel);
    const cefrDist: Record<string, number> = {};
    cefrEvents.forEach(e => {
        const lvl = e.properties.cefrLevel;
        cefrDist[lvl] = (cefrDist[lvl] || 0) + 1;
    });

    // Skill breakdown
    const skillScores = new Map<string, number[]>();
    events.filter(e => e.properties?.score != null).forEach(e => {
        const mod = e.module || 'general';
        if (!skillScores.has(mod)) skillScores.set(mod, []);
        skillScores.get(mod)!.push(e.properties.score);
    });
    const skillBreakdown = [...skillScores.entries()].map(([skill, scores]) => ({
        skill,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));

    // Streak distribution
    const streakMap = new Map<number, number>();
    events.filter(e => e.event === 'streak_update').forEach(e => {
        const s = e.properties?.streakDays || 0;
        streakMap.set(s, (streakMap.get(s) || 0) + 1);
    });
    const streakDistribution = [...streakMap.entries()]
        .map(([streak, count]) => ({ streak, count }))
        .sort((a, b) => a.streak - b.streak);

    // XP totals
    const xpEvents = events.filter(e => e.event === 'xp_awarded');
    const totalXP = xpEvents.reduce((sum, e) => sum + (e.properties?.xp || 0), 0);

    // Top content
    const contentViews = new Map<string, { title: string; type: string; views: number; scores: number[] }>();
    events.filter(e => e.properties?.contentId).forEach(e => {
        const id = e.properties.contentId;
        if (!contentViews.has(id)) {
            contentViews.set(id, { title: e.properties.contentTitle || id, type: e.module as any, views: 0, scores: [] });
        }
        const cv = contentViews.get(id)!;
        cv.views++;
        if (e.properties.score != null) cv.scores.push(e.properties.score);
    });
    const topContent: ContentMetric[] = [...contentViews.entries()]
        .map(([id, cv]) => ({
            id, title: cv.title, type: cv.type as any,
            views: cv.views,
            completionRate: cv.scores.length / cv.views * 100,
            avgScore: cv.scores.length ? Math.round(cv.scores.reduce((a, b) => a + b, 0) / cv.scores.length) : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    // Recent activity
    const recentActivity: ActivityEntry[] = events.slice(-20).reverse().map(e => ({
        userId: e.userId,
        action: e.event,
        module: e.module,
        timestamp: e.timestamp,
        details: e.properties?.details,
    }));

    return {
        overview: {
            totalUsers: allUsers.size,
            activeToday: todayUsers.size,
            activeThisWeek: weekUsers.size,
            activeThisMonth: monthUsers.size,
            newUsersThisWeek: 0, // TODO: needs user registration dates
            retentionRate7d: allUsers.size > 0 ? Math.round(weekUsers.size / allUsers.size * 100) : 0,
            avgSessionMinutes: 15, // TODO: calculate from session events
        },
        engagement: {
            dailyActiveUsers,
            avgReviewsPerDay: events.filter(e => e.event === 'review_submit').length / 30,
            avgSessionsPerUser: allUsers.size > 0 ? events.length / allUsers.size : 0,
            streakDistribution,
            peakHours,
        },
        learning: {
            avgAccuracy: skillBreakdown.length > 0 ? Math.round(skillBreakdown.reduce((s, sk) => s + sk.avgScore, 0) / skillBreakdown.length) : 0,
            cefrDistribution: cefrDist,
            skillBreakdown,
            completionRates: [],
            vocabMastered: events.filter(e => e.event === 'vocab_mastered').length,
            avgWordsPerDay: events.filter(e => e.event === 'vocab_review').length / 30,
        },
        gamification: {
            totalXPAwarded: totalXP,
            avgXPPerUser: allUsers.size > 0 ? Math.round(totalXP / allUsers.size) : 0,
            achievementsUnlocked: events.filter(e => e.event === 'achievement_unlocked').length,
            activeStreaks: streakDistribution.filter(s => s.streak > 0).reduce((sum, s) => sum + s.count, 0),
            dailyChallengesCompleted: events.filter(e => e.event === 'challenge_completed').length,
            groupsActive: 0,
        },
        topContent,
        recentActivity,
    };
}

/**
 * Get metrics for a specific user
 */
export function getUserMetrics(userId: string) {
    const userEvents = events.filter(e => e.userId === userId);
    const reviews = userEvents.filter(e => e.event === 'review_submit');
    const scores = userEvents.filter(e => e.properties?.score != null).map(e => e.properties.score);

    return {
        userId,
        totalEvents: userEvents.length,
        totalReviews: reviews.length,
        avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        totalXP: userEvents.filter(e => e.event === 'xp_awarded').reduce((s, e) => s + (e.properties?.xp || 0), 0),
        lastActive: userEvents.length > 0 ? userEvents[userEvents.length - 1].timestamp : null,
        modulesUsed: [...new Set(userEvents.map(e => e.module))],
    };
}

/**
 * Get trending metrics (for admin alerts)
 */
export function getTrendingAlerts(): Array<{ type: 'warning' | 'info' | 'success'; message: string }> {
    const alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string }> = [];
    const metrics = getDashboardMetrics();

    if (metrics.overview.retentionRate7d < 50) {
        alerts.push({ type: 'warning', message: `Retention rate dropped to ${metrics.overview.retentionRate7d}%` });
    }
    if (metrics.learning.avgAccuracy < 60) {
        alerts.push({ type: 'warning', message: `Average accuracy is ${metrics.learning.avgAccuracy}% — consider easier content` });
    }
    if (metrics.gamification.activeStreaks > 10) {
        alerts.push({ type: 'success', message: `${metrics.gamification.activeStreaks} users maintaining active streaks!` });
    }

    return alerts;
}

/**
 * Export events for BigQuery (batch upload)
 */
export function exportForBigQuery(since?: Date): AnalyticsEvent[] {
    if (!since) return [...events];
    return events.filter(e => e.timestamp >= since);
}
