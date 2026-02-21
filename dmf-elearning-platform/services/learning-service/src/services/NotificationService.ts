/**
 * Notification Service — Phase 1, Sprint 1.2
 * Push notifications via Firebase Cloud Messaging (FCM) + Expo Push
 * Predictive nudges based on FSRS due dates
 */

// ─── Types ───

export interface NotificationPayload {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    badge?: number;
    channelId?: string;
}

export interface NudgeConfig {
    userId: string;
    type: 'srs_reminder' | 'streak_warning' | 'daily_goal' | 'achievement' | 'group_challenge' | 'welcome_back';
    scheduledAt: Date;
    sent: boolean;
}

interface UserNotificationPrefs {
    userId: string;
    enabled: boolean;
    pushToken?: string;       // Expo push token or FCM token
    quietHoursStart?: number; // e.g., 22 (10 PM)
    quietHoursEnd?: number;   // e.g., 7 (7 AM)
    maxPerDay: number;        // Default: 3
    channels: {
        srsReminders: boolean;
        streakAlerts: boolean;
        achievements: boolean;
        socialUpdates: boolean;
        dailyGoal: boolean;
    };
}

// In-memory stores (production: Firestore/DB)
const pushTokens = new Map<string, string>();
const notificationHistory = new Map<string, NotificationPayload[]>(); // userId → sent notifications
const pendingNudges: NudgeConfig[] = [];
const userPrefs = new Map<string, UserNotificationPrefs>();
const dailySendCount = new Map<string, { date: string; count: number }>();

// ─── Token Management ───

/**
 * Register push token for a user
 */
export function registerPushToken(userId: string, token: string): void {
    pushTokens.set(userId, token);
}

/**
 * Get push token for a user
 */
export function getPushToken(userId: string): string | null {
    return pushTokens.get(userId) || null;
}

// ─── Notification Preferences ───

/**
 * Get or create user notification preferences
 */
export function getUserPrefs(userId: string): UserNotificationPrefs {
    if (!userPrefs.has(userId)) {
        userPrefs.set(userId, {
            userId,
            enabled: true,
            maxPerDay: 3,
            channels: {
                srsReminders: true,
                streakAlerts: true,
                achievements: true,
                socialUpdates: true,
                dailyGoal: true,
            },
        });
    }
    return userPrefs.get(userId)!;
}

/**
 * Update notification preferences
 */
export function updateUserPrefs(userId: string, updates: Partial<UserNotificationPrefs>): UserNotificationPrefs {
    const current = getUserPrefs(userId);
    const updated = { ...current, ...updates };
    userPrefs.set(userId, updated);
    return updated;
}

// ─── Send Notifications ───

/**
 * Send a push notification to a user
 * In production: calls FCM/Expo Push API
 */
export async function sendNotification(payload: NotificationPayload): Promise<{ sent: boolean; reason?: string }> {
    const prefs = getUserPrefs(payload.userId);

    // Check if notifications enabled
    if (!prefs.enabled) return { sent: false, reason: 'notifications_disabled' };

    // Check quiet hours
    const hour = new Date().getHours();
    if (prefs.quietHoursStart && prefs.quietHoursEnd) {
        if (prefs.quietHoursStart > prefs.quietHoursEnd) {
            // Wraps midnight (e.g., 22 → 7)
            if (hour >= prefs.quietHoursStart || hour < prefs.quietHoursEnd) {
                return { sent: false, reason: 'quiet_hours' };
            }
        } else if (hour >= prefs.quietHoursStart && hour < prefs.quietHoursEnd) {
            return { sent: false, reason: 'quiet_hours' };
        }
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `${payload.userId}_${today}`;
    const daily = dailySendCount.get(payload.userId) || { date: today, count: 0 };
    if (daily.date !== today) { daily.date = today; daily.count = 0; }
    if (daily.count >= prefs.maxPerDay) return { sent: false, reason: 'daily_limit_reached' };

    // Check push token
    const token = pushTokens.get(payload.userId);
    if (!token) return { sent: false, reason: 'no_push_token' };

    // Send via FCM/Expo Push (placeholder - production would call API)
    console.log(`[Notification] → ${payload.userId}: ${payload.title} — ${payload.body}`);

    // Record
    daily.count++;
    dailySendCount.set(payload.userId, daily);
    const history = notificationHistory.get(payload.userId) || [];
    history.push(payload);
    if (history.length > 50) history.splice(0, history.length - 50);
    notificationHistory.set(payload.userId, history);

    return { sent: true };
}

// ─── Predictive Nudges ───

/**
 * Schedule SRS reminder nudge
 * "3 từ sắp quên — ôn ngay trước khi mất tiến độ!"
 */
export function scheduleSRSNudge(userId: string, dueCount: number, nextDueAt: Date): void {
    // Schedule 30 minutes before first due item
    const nudgeTime = new Date(nextDueAt.getTime() - 30 * 60 * 1000);

    const nudge: NudgeConfig = {
        userId,
        type: 'srs_reminder',
        scheduledAt: nudgeTime > new Date() ? nudgeTime : new Date(Date.now() + 5 * 60 * 1000),
        sent: false,
    };

    pendingNudges.push(nudge);
}

/**
 * Schedule streak warning
 * "Streak 12 ngày sắp mất! Chỉ cần 5 review nữa."
 */
export function scheduleStreakWarning(userId: string, currentStreak: number): void {
    // Send at 8 PM if no activity today
    const tonight = new Date();
    tonight.setHours(20, 0, 0, 0);

    pendingNudges.push({
        userId,
        type: 'streak_warning',
        scheduledAt: tonight > new Date() ? tonight : new Date(Date.now() + 60 * 1000),
        sent: false,
    });
}

/**
 * Process all pending nudges (called by scheduler)
 */
export async function processPendingNudges(): Promise<{ processed: number; sent: number }> {
    const now = new Date();
    let processed = 0;
    let sent = 0;

    for (const nudge of pendingNudges) {
        if (nudge.sent || nudge.scheduledAt > now) continue;

        processed++;
        const payload = buildNudgePayload(nudge);
        const result = await sendNotification(payload);
        if (result.sent) sent++;
        nudge.sent = true;
    }

    // Clean up sent nudges older than 24h
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const remaining = pendingNudges.filter(n => !n.sent || n.scheduledAt > cutoff);
    pendingNudges.length = 0;
    pendingNudges.push(...remaining);

    return { processed, sent };
}

/**
 * Build notification payload from nudge config
 */
function buildNudgePayload(nudge: NudgeConfig): NotificationPayload {
    const templates: Record<NudgeConfig['type'], { title: string; body: string }> = {
        srs_reminder: {
            title: '📚 Từ vựng sắp quên!',
            body: 'Bạn có từ cần ôn — review ngay để giữ tiến độ!',
        },
        streak_warning: {
            title: '🔥 Streak sắp mất!',
            body: 'Hoàn thành 5 review nữa để giữ chuỗi ngày liên tiếp!',
        },
        daily_goal: {
            title: '🎯 Mục tiêu hôm nay',
            body: 'Kế hoạch học tập hôm nay đã sẵn sàng. Bắt đầu nhé!',
        },
        achievement: {
            title: '🏆 Thành tích mới!',
            body: 'Bạn vừa đạt một thành tích mới. Xem ngay!',
        },
        group_challenge: {
            title: '👥 Thử thách nhóm!',
            body: 'Nhóm của bạn có thử thách mới. Cùng tham gia!',
        },
        welcome_back: {
            title: '👋 Lâu rồi không gặp!',
            body: 'Quay lại ôn tập nhé — chỉ 5 phút thôi!',
        },
    };

    const template = templates[nudge.type];
    return {
        userId: nudge.userId,
        title: template.title,
        body: template.body,
        data: { type: nudge.type, action: 'open_review' },
        channelId: nudge.type,
    };
}

// ─── History ───

/**
 * Get notification history for a user
 */
export function getNotificationHistory(userId: string): NotificationPayload[] {
    return notificationHistory.get(userId) || [];
}

/**
 * Get pending nudges count
 */
export function getPendingNudgesCount(): number {
    return pendingNudges.filter(n => !n.sent).length;
}
