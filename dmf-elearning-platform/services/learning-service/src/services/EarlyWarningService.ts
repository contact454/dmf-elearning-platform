/**
 * Early Warning Agent — Phase 5, Sprint 5.2
 * Detects dropout risk, behavior anomalies, motivation decline
 * Triggers proactive interventions before students disengage
 */

import { getStudentProfile, getStatements, type StudentBehaviorProfile } from './LRSService';
import { scheduleStreakWarning, scheduleSRSNudge } from './NotificationService';

// ─── Types ───

export interface WarningAlert {
    id: string;
    userId: string;
    type: AlertType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    messageVi: string;
    detectedAt: Date;
    signals: DetectionSignal[];
    suggestedActions: InterventionAction[];
    status: 'pending' | 'acted' | 'dismissed';
}

type AlertType =
    | 'dropout_risk'
    | 'accuracy_decline'
    | 'engagement_drop'
    | 'streak_danger'
    | 'long_absence'
    | 'frustration_detected'
    | 'pace_too_fast'
    | 'pace_too_slow';

interface DetectionSignal {
    metric: string;
    currentValue: number;
    expectedValue: number;
    deviation: number;    // Percentage deviation
    trend: 'improving' | 'stable' | 'declining';
}

interface InterventionAction {
    type: 'notification' | 'content_adjust' | 'mentor_alert' | 'difficulty_reduce' | 'encouragement' | 'break_suggest';
    description: string;
    descriptionVi: string;
    autoExecutable: boolean;
    priority: number;
}

// ─── Store ───

const alerts = new Map<string, WarningAlert>();

// ─── Detection Engine ───

/**
 * Run full analysis on a user — detect all warning signals
 */
export function analyzeUser(userId: string): WarningAlert[] {
    const profile = getStudentProfile(userId);
    const detectedAlerts: WarningAlert[] = [];

    // Check each detection rule
    const checks = [
        checkDropoutRisk(userId, profile),
        checkAccuracyDecline(userId, profile),
        checkEngagementDrop(userId, profile),
        checkStreakDanger(userId, profile),
        checkLongAbsence(userId, profile),
        checkFrustration(userId, profile),
        checkPacing(userId, profile),
    ];

    for (const alert of checks) {
        if (alert) {
            alerts.set(alert.id, alert);
            detectedAlerts.push(alert);
        }
    }

    return detectedAlerts;
}

/**
 * Batch analyze all active users
 */
export function analyzeAllUsers(userIds: string[]): { analyzed: number; alertsGenerated: number; alerts: WarningAlert[] } {
    const allAlerts: WarningAlert[] = [];
    for (const userId of userIds) {
        const userAlerts = analyzeUser(userId);
        allAlerts.push(...userAlerts);
    }
    return { analyzed: userIds.length, alertsGenerated: allAlerts.length, alerts: allAlerts };
}

/**
 * Execute auto-interventions for an alert
 */
export function executeIntervention(alertId: string): { executed: string[]; skipped: string[] } {
    const alert = alerts.get(alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);

    const executed: string[] = [];
    const skipped: string[] = [];

    for (const action of alert.suggestedActions) {
        if (action.autoExecutable) {
            // Execute automatic interventions
            switch (action.type) {
                case 'notification':
                    if (alert.type === 'streak_danger') {
                        scheduleStreakWarning(alert.userId, 0);
                    } else {
                        scheduleSRSNudge(alert.userId, 3, new Date(Date.now() + 30 * 60 * 1000));
                    }
                    executed.push(action.description);
                    break;
                case 'encouragement':
                    scheduleSRSNudge(alert.userId, 0, new Date(Date.now() + 60 * 60 * 1000));
                    executed.push(action.description);
                    break;
                default:
                    skipped.push(action.description);
            }
        } else {
            skipped.push(action.description);
        }
    }

    alert.status = 'acted';
    return { executed, skipped };
}

/**
 * Get all alerts (optionally filtered)
 */
export function getAlerts(filters?: {
    userId?: string;
    severity?: string;
    status?: string;
    type?: string;
}): WarningAlert[] {
    let result = [...alerts.values()];
    if (filters?.userId) result = result.filter(a => a.userId === filters.userId);
    if (filters?.severity) result = result.filter(a => a.severity === filters.severity);
    if (filters?.status) result = result.filter(a => a.status === filters.status);
    if (filters?.type) result = result.filter(a => a.type === filters.type);
    return result.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
}

/**
 * Dismiss an alert
 */
export function dismissAlert(alertId: string): void {
    const alert = alerts.get(alertId);
    if (alert) alert.status = 'dismissed';
}

// ─── Detection Rules ───

function createAlert(userId: string, type: AlertType, severity: WarningAlert['severity'], message: string, messageVi: string, signals: DetectionSignal[], actions: InterventionAction[]): WarningAlert {
    return {
        id: `warn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId, type, severity, message, messageVi,
        detectedAt: new Date(), signals, suggestedActions: actions, status: 'pending',
    };
}

function checkDropoutRisk(userId: string, profile: StudentBehaviorProfile): WarningAlert | null {
    if (profile.dropoffRisk !== 'high') return null;
    return createAlert(userId, 'dropout_risk', 'critical',
        `High dropout risk detected for user ${userId}`,
        `Nguy cơ bỏ học cao — cần can thiệp ngay`,
        [{ metric: 'dropoffRisk', currentValue: 1, expectedValue: 0, deviation: 100, trend: 'declining' }],
        [
            { type: 'notification', description: 'Send welcome-back notification', descriptionVi: 'Gửi thông báo chào mừng quay lại', autoExecutable: true, priority: 1 },
            { type: 'content_adjust', description: 'Reduce difficulty for next session', descriptionVi: 'Giảm độ khó cho buổi học tiếp', autoExecutable: false, priority: 2 },
            { type: 'mentor_alert', description: 'Notify assigned mentor', descriptionVi: 'Thông báo cho mentor phụ trách', autoExecutable: false, priority: 3 },
        ]
    );
}

function checkAccuracyDecline(userId: string, profile: StudentBehaviorProfile): WarningAlert | null {
    if (profile.avgAccuracy >= 60) return null;
    return createAlert(userId, 'accuracy_decline', 'medium',
        `Accuracy declining: ${profile.avgAccuracy}% (expected 60%+)`,
        `Độ chính xác giảm: ${profile.avgAccuracy}% (kỳ vọng 60%+)`,
        [{ metric: 'avgAccuracy', currentValue: profile.avgAccuracy, expectedValue: 60, deviation: Math.round((60 - profile.avgAccuracy) / 60 * 100), trend: 'declining' }],
        [
            { type: 'difficulty_reduce', description: 'Auto-reduce difficulty by 2 levels', descriptionVi: 'Tự động giảm 2 mức độ khó', autoExecutable: false, priority: 1 },
            { type: 'encouragement', description: 'Send encouraging message', descriptionVi: 'Gửi tin nhắn động viên', autoExecutable: true, priority: 2 },
        ]
    );
}

function checkEngagementDrop(userId: string, profile: StudentBehaviorProfile): WarningAlert | null {
    if (profile.sessionsPerWeek >= 2) return null;
    return createAlert(userId, 'engagement_drop', 'medium',
        `Engagement dropping: ${profile.sessionsPerWeek} sessions/week (expected 2+)`,
        `Mức độ tham gia giảm: ${profile.sessionsPerWeek} buổi/tuần (kỳ vọng 2+)`,
        [{ metric: 'sessionsPerWeek', currentValue: profile.sessionsPerWeek, expectedValue: 2, deviation: Math.round((2 - profile.sessionsPerWeek) / 2 * 100), trend: 'declining' }],
        [
            { type: 'notification', description: 'Send daily goal reminder', descriptionVi: 'Gửi nhắc nhở mục tiêu hàng ngày', autoExecutable: true, priority: 1 },
            { type: 'content_adjust', description: 'Offer shorter micro-lessons', descriptionVi: 'Đề xuất bài micro-lesson ngắn 5 phút', autoExecutable: false, priority: 2 },
        ]
    );
}

function checkStreakDanger(userId: string, profile: StudentBehaviorProfile): WarningAlert | null {
    if (profile.loginStreak <= 0 || profile.lastActivityDaysAgo < 1) return null;
    return createAlert(userId, 'streak_danger', 'high',
        `Streak of ${profile.loginStreak} days at risk — no activity today`,
        `Chuỗi ${profile.loginStreak} ngày sắp mất — chưa học hôm nay`,
        [{ metric: 'loginStreak', currentValue: profile.loginStreak, expectedValue: profile.loginStreak + 1, deviation: 0, trend: 'stable' }],
        [
            { type: 'notification', description: 'Send urgent streak reminder', descriptionVi: 'Gửi nhắc nhở khẩn cấp giữ streak', autoExecutable: true, priority: 1 },
        ]
    );
}

function checkLongAbsence(userId: string, profile: StudentBehaviorProfile): WarningAlert | null {
    if (profile.lastActivityDaysAgo < 7) return null;
    const severity = profile.lastActivityDaysAgo >= 14 ? 'critical' : 'high';
    return createAlert(userId, 'long_absence', severity,
        `User absent for ${profile.lastActivityDaysAgo} days`,
        `Học viên vắng mặt ${profile.lastActivityDaysAgo} ngày`,
        [{ metric: 'lastActivityDaysAgo', currentValue: profile.lastActivityDaysAgo, expectedValue: 0, deviation: 100, trend: 'declining' }],
        [
            { type: 'notification', description: 'Send welcome-back with easy review', descriptionVi: 'Gửi chào đón quay lại + bài ôn nhẹ', autoExecutable: true, priority: 1 },
            { type: 'mentor_alert', description: 'Flag for mentor follow-up', descriptionVi: 'Đánh dấu cho mentor theo dõi', autoExecutable: false, priority: 2 },
        ]
    );
}

function checkFrustration(userId: string, profile: StudentBehaviorProfile): WarningAlert | null {
    if (profile.motivationTrend !== 'declining' || profile.avgAccuracy >= 50) return null;
    return createAlert(userId, 'frustration_detected', 'high',
        `Frustration signals: declining motivation + low accuracy (${profile.avgAccuracy}%)`,
        `Phát hiện dấu hiệu nản: xu hướng giảm + accuracy thấp (${profile.avgAccuracy}%)`,
        [
            { metric: 'motivationTrend', currentValue: -1, expectedValue: 0, deviation: 100, trend: 'declining' },
            { metric: 'avgAccuracy', currentValue: profile.avgAccuracy, expectedValue: 60, deviation: Math.round((60 - profile.avgAccuracy) / 60 * 100), trend: 'declining' },
        ],
        [
            { type: 'difficulty_reduce', description: 'Switch to easier content immediately', descriptionVi: 'Chuyển ngay sang nội dung dễ hơn', autoExecutable: false, priority: 1 },
            { type: 'break_suggest', description: 'Suggest a short break', descriptionVi: 'Đề xuất nghỉ ngắn', autoExecutable: false, priority: 2 },
            { type: 'encouragement', description: 'Send personalized encouragement', descriptionVi: 'Gửi lời động viên cá nhân hóa', autoExecutable: true, priority: 3 },
        ]
    );
}

function checkPacing(userId: string, profile: StudentBehaviorProfile): WarningAlert | null {
    if (profile.avgSessionMinutes <= 0) return null;
    if (profile.avgSessionMinutes > 60) {
        return createAlert(userId, 'pace_too_fast', 'low',
            `Sessions averaging ${profile.avgSessionMinutes} minutes — risk of burnout`,
            `Buổi học trung bình ${profile.avgSessionMinutes} phút — nguy cơ kiệt sức`,
            [{ metric: 'avgSessionMinutes', currentValue: profile.avgSessionMinutes, expectedValue: 30, deviation: Math.round((profile.avgSessionMinutes - 30) / 30 * 100), trend: 'stable' }],
            [{ type: 'break_suggest', description: 'Suggest taking breaks', descriptionVi: 'Đề xuất nghỉ giải lao', autoExecutable: false, priority: 1 }]
        );
    }
    return null;
}
