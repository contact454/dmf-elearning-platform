/**
 * CP-SIPP Adaptive Scheduler — Phase 3, Sprint 3.2
 * Conformal Prediction + Safe Interval Path Planning
 * Upgrades LearningPathService with uncertainty handling
 */

import { getStudentProfile, type StudentBehaviorProfile } from './LRSService';

// ─── Types ───

export interface AdaptiveSchedule {
    userId: string;
    date: string;            // YYYY-MM-DD
    cefrLevel: string;
    totalMinutes: number;
    confidenceInterval: [number, number]; // [min, max] minutes
    cognitiveLoadLevel: 'light' | 'moderate' | 'intensive';
    activities: ScheduledActivity[];
    adaptationReason: string;  // Why this schedule was chosen
    uncertaintyScore: number;  // 0-100 (higher = more uncertain)
}

export interface ScheduledActivity {
    id: string;
    type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'review' | 'conversation';
    title: string;
    titleVi: string;
    duration: number;         // minutes
    priority: 'critical' | 'high' | 'normal' | 'optional';
    difficulty: number;       // 1-10
    reason: string;           // Why this activity was scheduled
    safeInterval: [number, number]; // [earliest, latest] minutes from session start
    xpReward: number;
    isAdaptive: boolean;      // Was this dynamically adjusted?
}

interface ConformalPrediction {
    predicted: number;
    lower: number;
    upper: number;
    confidence: number;       // e.g., 0.90 = 90% coverage
    nonconformityScore: number;
}

// ─── Schedule Generation ───

/**
 * Generate an adaptive daily schedule using CP-SIPP
 */
export function generateAdaptiveSchedule(
    userId: string,
    options?: {
        date?: string;
        overrideLevel?: string;
        maxMinutes?: number;
        focusSkills?: string[];
        userMood?: 'energized' | 'normal' | 'tired' | 'stressed';
    }
): AdaptiveSchedule {
    const profile = getStudentProfile(userId);
    const date = options?.date || new Date().toISOString().split('T')[0];
    const level = options?.overrideLevel || profile.cefrLevel || 'A1';
    const mood = options?.userMood || estimateMood(profile);

    // Step 1: Conformal prediction of optimal session length
    const sessionPrediction = predictOptimalSession(profile, mood);

    // Step 2: Determine cognitive load level
    const cogLoad = determineCognitiveLoad(profile, mood, sessionPrediction);

    // Step 3: Generate activities using SIPP path planning
    const maxMinutes = options?.maxMinutes || sessionPrediction.predicted;
    const activities = planActivities(profile, level, cogLoad, maxMinutes, options?.focusSkills);

    // Step 4: Apply conformal safe intervals
    const scheduled = applySafeIntervals(activities, sessionPrediction);

    // Step 5: Build adaptation reason
    const reason = buildAdaptationReason(profile, mood, cogLoad, sessionPrediction);

    return {
        userId,
        date,
        cefrLevel: level,
        totalMinutes: Math.round(sessionPrediction.predicted),
        confidenceInterval: [Math.round(sessionPrediction.lower), Math.round(sessionPrediction.upper)],
        cognitiveLoadLevel: cogLoad,
        activities: scheduled,
        adaptationReason: reason,
        uncertaintyScore: Math.round((1 - sessionPrediction.confidence) * 100),
    };
}

// ─── Conformal Prediction ───

function predictOptimalSession(profile: StudentBehaviorProfile, mood: string): ConformalPrediction {
    // Base session length by level
    const baseLengths: Record<string, number> = { A1: 15, A2: 20, B1: 30, B2: 40, C1: 45, C2: 50 };
    const base = baseLengths[profile.cefrLevel] || 20;

    // Mood adjustment
    const moodMultiplier: Record<string, number> = { energized: 1.3, normal: 1.0, tired: 0.6, stressed: 0.5 };
    const predicted = base * (moodMultiplier[mood] || 1.0);

    // Uncertainty based on data points
    const dataPoints = profile.totalStatements;
    const confidence = Math.min(0.95, 0.5 + dataPoints * 0.005); // More data = more confident

    // Nonconformity score (how much this prediction deviates from history)
    const nonconformity = dataPoints < 10 ? 0.8 : dataPoints < 50 ? 0.5 : 0.2;

    // Conformal prediction bounds
    const width = predicted * nonconformity;
    const lower = Math.max(5, predicted - width);
    const upper = predicted + width * 0.5;

    return { predicted, lower, upper, confidence, nonconformityScore: nonconformity };
}

function determineCognitiveLoad(
    profile: StudentBehaviorProfile,
    mood: string,
    prediction: ConformalPrediction
): 'light' | 'moderate' | 'intensive' {
    if (mood === 'stressed' || mood === 'tired') return 'light';
    if (profile.motivationTrend === 'declining') return 'light';
    if (profile.dropoffRisk === 'high') return 'light';
    if (prediction.confidence > 0.8 && mood === 'energized') return 'intensive';
    return 'moderate';
}

// ─── SIPP Path Planning ───

function planActivities(
    profile: StudentBehaviorProfile,
    level: string,
    cogLoad: string,
    maxMinutes: number,
    focusSkills?: string[]
): ScheduledActivity[] {
    const activities: ScheduledActivity[] = [];
    let remaining = maxMinutes;
    let idCounter = 0;

    const weakSkills = focusSkills || profile.weakSkills;

    // Rule 1: Always start with review if SRS items are due
    if (remaining >= 5) {
        activities.push({
            id: `act_${++idCounter}`,
            type: 'review',
            title: 'SRS-Wiederholung',
            titleVi: 'Ôn tập SRS',
            duration: Math.min(10, remaining),
            priority: 'critical',
            difficulty: 3,
            reason: 'FSRS có từ sắp quên — ôn trước để giữ tiến độ',
            safeInterval: [0, 0],
            xpReward: 15,
            isAdaptive: false,
        });
        remaining -= activities[activities.length - 1].duration;
    }

    // Rule 2: Address weak skills
    if (weakSkills.length > 0 && remaining >= 8) {
        const skill = weakSkills[0];
        const activityMap: Record<string, { type: ScheduledActivity['type']; title: string; titleVi: string }> = {
            grammar: { type: 'grammar', title: 'Grammatik-Übungen', titleVi: 'Bài tập ngữ pháp' },
            vocabulary: { type: 'vocabulary', title: 'Wortschatz-Training', titleVi: 'Luyện từ vựng' },
            reading: { type: 'reading', title: 'Leseübung', titleVi: 'Bài đọc hiểu' },
            listening: { type: 'listening', title: 'Hörverständnis', titleVi: 'Luyện nghe' },
            speaking: { type: 'speaking', title: 'Sprechübung', titleVi: 'Luyện nói' },
            writing: { type: 'writing', title: 'Schreibübung', titleVi: 'Luyện viết' },
        };
        const act = activityMap[skill] || activityMap.vocabulary;
        const dur = cogLoad === 'light' ? 8 : cogLoad === 'intensive' ? 15 : 10;

        activities.push({
            id: `act_${++idCounter}`,
            type: act.type,
            title: act.title,
            titleVi: act.titleVi,
            duration: Math.min(dur, remaining),
            priority: 'high',
            difficulty: cogLoad === 'light' ? 3 : cogLoad === 'intensive' ? 7 : 5,
            reason: `ErrorPattern phát hiện ${skill} là điểm yếu — tập trung cải thiện`,
            safeInterval: [0, 0],
            xpReward: 20,
            isAdaptive: true,
        });
        remaining -= activities[activities.length - 1].duration;
    }

    // Rule 3: New content (if cogLoad allows)
    if (cogLoad !== 'light' && remaining >= 10) {
        const newActivities: Array<{ type: ScheduledActivity['type']; title: string; titleVi: string }> = [
            { type: 'vocabulary', title: 'Neue Vokabeln', titleVi: 'Từ vựng mới' },
            { type: 'grammar', title: 'Neues Grammatikthema', titleVi: 'Chủ đề ngữ pháp mới' },
            { type: 'conversation', title: 'NPC-Konversation', titleVi: 'Hội thoại NPC' },
        ];
        const pick = newActivities[idCounter % newActivities.length];

        activities.push({
            id: `act_${++idCounter}`,
            type: pick.type,
            title: pick.title,
            titleVi: pick.titleVi,
            duration: Math.min(10, remaining),
            priority: 'normal',
            difficulty: cogLoad === 'intensive' ? 6 : 4,
            reason: 'Nội dung mới phù hợp với trình độ hiện tại',
            safeInterval: [0, 0],
            xpReward: 25,
            isAdaptive: false,
        });
        remaining -= activities[activities.length - 1].duration;
    }

    // Rule 4: Fun/optional activity at the end
    if (remaining >= 5) {
        activities.push({
            id: `act_${++idCounter}`,
            type: 'listening',
            title: 'Entspanntes Hören',
            titleVi: 'Nghe thư giãn',
            duration: Math.min(5, remaining),
            priority: 'optional',
            difficulty: 2,
            reason: 'Hoạt động nhẹ nhàng kết thúc buổi học — giữ cảm hứng',
            safeInterval: [0, 0],
            xpReward: 10,
            isAdaptive: false,
        });
    }

    return activities;
}

function applySafeIntervals(activities: ScheduledActivity[], prediction: ConformalPrediction): ScheduledActivity[] {
    let elapsed = 0;
    return activities.map(act => {
        const earliest = elapsed;
        const latest = elapsed + Math.round(act.duration * prediction.nonconformityScore * 0.5);
        elapsed += act.duration;
        return { ...act, safeInterval: [earliest, latest] as [number, number] };
    });
}

// ─── Mood Estimation ───

function estimateMood(profile: StudentBehaviorProfile): string {
    const hour = new Date().getHours();
    if (profile.motivationTrend === 'declining') return 'tired';
    if (profile.dropoffRisk === 'high') return 'stressed';
    if (hour >= 6 && hour <= 10) return 'energized';
    if (hour >= 22 || hour <= 5) return 'tired';
    return 'normal';
}

function buildAdaptationReason(
    profile: StudentBehaviorProfile,
    mood: string,
    cogLoad: string,
    prediction: ConformalPrediction
): string {
    const parts: string[] = [];

    if (mood === 'tired' || mood === 'stressed') {
        parts.push(`Phát hiện trạng thái "${mood === 'tired' ? 'mệt mỏi' : 'căng thẳng'}" → giảm tải nhận thức`);
    }
    if (profile.weakSkills.length > 0) {
        parts.push(`Tập trung cải thiện: ${profile.weakSkills.slice(0, 2).join(', ')}`);
    }
    if (prediction.confidence < 0.7) {
        parts.push(`Độ tin cậy dự đoán thấp (${Math.round(prediction.confidence * 100)}%) → schedule linh hoạt hơn`);
    }
    if (profile.motivationTrend === 'declining') {
        parts.push('Xu hướng động lực giảm → ưu tiên hoạt động vui/nhẹ');
    }

    return parts.length > 0 ? parts.join('. ') + '.' : 'Schedule chuẩn cho trình độ hiện tại.';
}

/**
 * Adjust schedule in real-time based on mid-session signals
 */
export function adjustScheduleRealTime(
    schedule: AdaptiveSchedule,
    signal: {
        currentActivityIndex: number;
        accuracyThisSession: number;
        elapsedMinutes: number;
        userFeedback?: 'too_easy' | 'just_right' | 'too_hard' | 'bored' | 'overwhelmed';
    }
): AdaptiveSchedule {
    const adjusted = { ...schedule, activities: [...schedule.activities] };

    // If accuracy drops below 50%, switch to lighter content
    if (signal.accuracyThisSession < 50) {
        for (let i = signal.currentActivityIndex + 1; i < adjusted.activities.length; i++) {
            adjusted.activities[i] = {
                ...adjusted.activities[i],
                difficulty: Math.max(1, adjusted.activities[i].difficulty - 2),
                isAdaptive: true,
                reason: 'CP-SIPP: accuracy thấp → giảm độ khó',
            };
        }
        adjusted.cognitiveLoadLevel = 'light';
        adjusted.adaptationReason += ' | Điều chỉnh real-time: accuracy < 50%.';
    }

    // If user says "too_hard" or "overwhelmed"
    if (signal.userFeedback === 'too_hard' || signal.userFeedback === 'overwhelmed') {
        // Remove optional activities
        adjusted.activities = adjusted.activities.filter((a, i) =>
            i <= signal.currentActivityIndex || a.priority !== 'optional'
        );
        adjusted.cognitiveLoadLevel = 'light';
        adjusted.adaptationReason += ' | Người dùng phản hồi quá khó → đơn giản hóa.';
    }

    // If user says "too_easy" or "bored"
    if (signal.userFeedback === 'too_easy' || signal.userFeedback === 'bored') {
        for (let i = signal.currentActivityIndex + 1; i < adjusted.activities.length; i++) {
            adjusted.activities[i] = {
                ...adjusted.activities[i],
                difficulty: Math.min(10, adjusted.activities[i].difficulty + 2),
                isAdaptive: true,
                reason: 'CP-SIPP: user muốn thách thức hơn → tăng độ khó',
            };
        }
        adjusted.cognitiveLoadLevel = 'intensive';
    }

    return adjusted;
}
