/**
 * Learning Path Service — Sprint 2 Fix 1.2
 * Generates personalized daily learning plans based on CEFR level and weaknesses
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

interface LearningStep {
    id: string;
    type: 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar' | 'review';
    title: string;
    description: string;
    estimatedMinutes: number;
    level: CEFRLevel;
    completed: boolean;
    xpReward: number;
}

interface DailyPlan {
    date: string;
    level: CEFRLevel;
    totalMinutes: number;
    steps: LearningStep[];
    focusSkill: string;
    motivation: string;
}

// Daily motivational messages (Vietnamese + German)
const MOTIVATIONS = [
    'Jeden Tag ein bisschen besser! 💪 — Mỗi ngày một chút tiến bộ!',
    'Übung macht den Meister! 🎯 — Có công mài sắt có ngày nên kim!',
    'Du schaffst das! 🌟 — Bạn làm được!',
    'Schritt für Schritt zum Ziel! 🚶 — Từng bước đến đích!',
    'Heute ist ein guter Tag zum Lernen! 📚 — Hôm nay là ngày tốt để học!',
    'Dein Deutsch wird immer besser! 📈 — Tiếng Đức của bạn ngày càng tốt!',
    'Weiter so, du bist auf dem richtigen Weg! ✅ — Tiếp tục, bạn đang đi đúng hướng!',
];

// Step templates per level
const STEP_TEMPLATES: Record<CEFRLevel, LearningStep[]> = {
    A1: [
        { id: 'vocab-review', type: 'review', title: 'Ôn từ vựng SRS', description: 'Ôn các từ đến hạn review', estimatedMinutes: 5, level: 'A1', completed: false, xpReward: 20 },
        { id: 'vocab-new', type: 'vocabulary', title: 'Học 5 từ mới', description: 'Chủ đề: Begrüßung (Chào hỏi)', estimatedMinutes: 5, level: 'A1', completed: false, xpReward: 25 },
        { id: 'grammar', type: 'grammar', title: 'Ngữ pháp: sein/haben', description: 'Chia động từ cơ bản', estimatedMinutes: 5, level: 'A1', completed: false, xpReward: 15 },
        { id: 'reading', type: 'reading', title: 'Đọc bài ngắn A1', description: 'Bài về giới thiệu bản thân', estimatedMinutes: 5, level: 'A1', completed: false, xpReward: 25 },
    ],
    A2: [
        { id: 'vocab-review', type: 'review', title: 'Ôn từ vựng SRS', description: 'Ôn các từ đến hạn', estimatedMinutes: 5, level: 'A2', completed: false, xpReward: 20 },
        { id: 'vocab-new', type: 'vocabulary', title: 'Học 8 từ mới', description: 'Chủ đề: Einkaufen (Mua sắm)', estimatedMinutes: 5, level: 'A2', completed: false, xpReward: 30 },
        { id: 'listening', type: 'listening', title: 'Nghe hội thoại A2', description: 'Tình huống: Beim Arzt', estimatedMinutes: 5, level: 'A2', completed: false, xpReward: 25 },
        { id: 'speaking', type: 'speaking', title: 'Nói: Tự giới thiệu', description: 'Tập nói về bản thân', estimatedMinutes: 3, level: 'A2', completed: false, xpReward: 20 },
        { id: 'grammar', type: 'grammar', title: 'Ngữ pháp: Perfekt', description: 'Thì quá khứ hoàn thành', estimatedMinutes: 5, level: 'A2', completed: false, xpReward: 15 },
    ],
    B1: [
        { id: 'vocab-review', type: 'review', title: 'Ôn từ vựng SRS', description: 'Ôn theo spaced repetition', estimatedMinutes: 5, level: 'B1', completed: false, xpReward: 20 },
        { id: 'vocab-new', type: 'vocabulary', title: 'Học 10 từ mới', description: 'Chủ đề: Beruf (Nghề nghiệp)', estimatedMinutes: 5, level: 'B1', completed: false, xpReward: 35 },
        { id: 'reading', type: 'reading', title: 'Đọc bài báo B1', description: 'Tin tức đơn giản về Đức', estimatedMinutes: 7, level: 'B1', completed: false, xpReward: 30 },
        { id: 'writing', type: 'writing', title: 'Viết email ngắn', description: 'Viết email xin nghỉ phép', estimatedMinutes: 8, level: 'B1', completed: false, xpReward: 35 },
        { id: 'listening', type: 'listening', title: 'Nghe podcast B1', description: 'Chủ đề: Deutsche Kultur', estimatedMinutes: 5, level: 'B1', completed: false, xpReward: 25 },
    ],
    B2: [
        { id: 'vocab-review', type: 'review', title: 'Ôn từ vựng SRS', description: 'Ôn high-level vocabulary', estimatedMinutes: 5, level: 'B2', completed: false, xpReward: 20 },
        { id: 'vocab-new', type: 'vocabulary', title: 'Học 12 từ nâng cao', description: 'Chủ đề: Wissenschaft (Khoa học)', estimatedMinutes: 7, level: 'B2', completed: false, xpReward: 40 },
        { id: 'reading', type: 'reading', title: 'Đọc bài phân tích B2', description: 'Văn bản chuyên ngành', estimatedMinutes: 10, level: 'B2', completed: false, xpReward: 35 },
        { id: 'writing', type: 'writing', title: 'Viết luận ngắn', description: 'Viết ý kiến về chủ đề xã hội', estimatedMinutes: 10, level: 'B2', completed: false, xpReward: 40 },
        { id: 'speaking', type: 'speaking', title: 'Tranh luận B2', description: 'Thảo luận về Umweltschutz', estimatedMinutes: 5, level: 'B2', completed: false, xpReward: 30 },
        { id: 'listening', type: 'listening', title: 'Nghe bài giảng B2', description: 'Vorlesung über Geschichte', estimatedMinutes: 8, level: 'B2', completed: false, xpReward: 30 },
    ],
};

/**
 * Generate today's learning path for a user
 */
export async function getTodayPlan(userId: string): Promise<DailyPlan> {
    // Get user's CEFR level
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { cefrLevel: true, name: true },
    });

    const level = (user?.cefrLevel as CEFRLevel) || 'A1';
    const steps = STEP_TEMPLATES[level].map(s => ({ ...s }));
    const totalMinutes = steps.reduce((sum, s) => sum + s.estimatedMinutes, 0);

    // Determine focus skill (rotate daily)
    const dayOfWeek = new Date().getDay();
    const skillRotation = ['vocabulary', 'reading', 'listening', 'speaking', 'writing', 'grammar', 'review'];
    const focusSkill = skillRotation[dayOfWeek];

    return {
        date: new Date().toISOString().slice(0, 10),
        level,
        totalMinutes,
        steps,
        focusSkill,
        motivation: MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)],
    };
}

/**
 * Mark a step as completed
 */
export async function completeStep(userId: string, stepId: string): Promise<{ xpEarned: number }> {
    const plan = await getTodayPlan(userId);
    const step = plan.steps.find(s => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);
    return { xpEarned: step.xpReward };
}

/**
 * Get weekly summary
 */
export async function getWeeklySummary(userId: string) {
    // Simplified: return stats from gamification
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { cefrLevel: true, currentStreak: true, longestStreak: true },
    });

    return {
        streak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        level: user?.cefrLevel || 'A1',
        daysActive: Math.min(7, user?.currentStreak || 0),
    };
}
