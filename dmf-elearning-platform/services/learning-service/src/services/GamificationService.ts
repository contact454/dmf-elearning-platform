/**
 * GamificationService — M3 Sprint S11
 * XP, Levels, Streaks, Achievements, Daily Challenges, Leaderboard
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── XP CONSTANTS ───
const XP_PER_LEVEL = 500; // 500 XP per level
const XP_REWARDS = {
    vocab_review: 10,
    reading_complete: 25,
    listening_complete: 25,
    speaking_attempt: 20,
    writing_submit: 30,
    daily_challenge: 50,
    streak_bonus: 5, // per day of streak
};

type XPSource = keyof typeof XP_REWARDS;

// ─── XP SERVICE ───

export async function awardXP(userId: string, source: XPSource, multiplier = 1) {
    const xp = Math.round(XP_REWARDS[source] * multiplier);

    const fieldMap: Record<string, string> = {
        vocab_review: 'vocabXP',
        reading_complete: 'readingXP',
        listening_complete: 'listeningXP',
        speaking_attempt: 'speakingXP',
        writing_submit: 'writingXP',
        daily_challenge: 'vocabXP', // general pool
        streak_bonus: 'vocabXP',
    };

    const sourceField = fieldMap[source] || 'vocabXP';

    const record = await prisma.userXP.upsert({
        where: { userId },
        update: {
            totalXP: { increment: xp },
            [sourceField]: { increment: xp },
        },
        create: {
            userId,
            totalXP: xp,
            [sourceField]: xp,
        },
    });

    // Recalculate level
    const newLevel = Math.floor(record.totalXP / XP_PER_LEVEL) + 1;
    if (newLevel !== record.currentLvl) {
        await prisma.userXP.update({
            where: { userId },
            data: { currentLvl: newLevel },
        });
    }

    return { xpAwarded: xp, totalXP: record.totalXP + xp, level: newLevel, source };
}

export async function getUserXP(userId: string) {
    const xp = await prisma.userXP.findUnique({ where: { userId } });
    if (!xp) {
        return { totalXP: 0, currentLvl: 1, vocabXP: 0, readingXP: 0, listeningXP: 0, speakingXP: 0, writingXP: 0, nextLevelXP: XP_PER_LEVEL, progressPercent: 0 };
    }
    const nextLevelXP = xp.currentLvl * XP_PER_LEVEL;
    const prevLevelXP = (xp.currentLvl - 1) * XP_PER_LEVEL;
    const progressPercent = Math.round(((xp.totalXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100);
    return { ...xp, nextLevelXP, progressPercent };
}

// ─── LEADERBOARD ───

export async function getLeaderboard(period: 'daily' | 'weekly' | 'alltime' = 'alltime', limit = 20) {
    const records = await prisma.userXP.findMany({
        orderBy: { totalXP: 'desc' },
        take: limit,
        select: { userId: true, totalXP: true, currentLvl: true },
    });

    return records.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        totalXP: r.totalXP,
        level: r.currentLvl,
    }));
}

// ─── STREAK SERVICE ───

export async function updateStreak(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, longestStreak: true, lastActivityDate: true, timezone: true },
    });
    if (!user) return null;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastDate = user.lastActivityDate?.toISOString().split('T')[0];

    let newStreak = user.currentStreak;

    if (lastDate === today) {
        // Already active today — no change
        return { currentStreak: newStreak, longestStreak: user.longestStreak, isNewDay: false };
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
        newStreak += 1; // consecutive day
    } else {
        newStreak = 1; // streak broken, restart
    }

    const longestStreak = Math.max(newStreak, user.longestStreak);

    await prisma.user.update({
        where: { id: userId },
        data: { currentStreak: newStreak, longestStreak, lastActivityDate: now },
    });

    // Award streak bonus XP
    if (newStreak > 1) {
        await awardXP(userId, 'streak_bonus', newStreak);
    }

    return { currentStreak: newStreak, longestStreak, isNewDay: true };
}

// ─── ACHIEVEMENTS ───

export async function checkAndUnlockAchievements(userId: string) {
    const achievements = await prisma.achievement.findMany({ where: { isActive: true } });
    const existing = await prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } });
    const existingIds = new Set(existing.map(e => e.achievementId));

    // Get user stats
    const [xp, user, vocabCount, readingCount, listeningCount, speakingCount, writingCount] = await Promise.all([
        prisma.userXP.findUnique({ where: { userId } }),
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.userWordProgress.count({ where: { userId } }),
        prisma.userReadingProgress.count({ where: { userId, status: 'completed' } }),
        prisma.userListeningProgress.count({ where: { userId, status: 'completed' } }),
        prisma.userSpeakingProgress.count({ where: { userId, status: 'mastered' } }),
        prisma.userWritingProgress.count({ where: { userId, status: 'completed' } }),
    ]);

    const stats: Record<string, number> = {
        totalXP: xp?.totalXP || 0,
        currentLevel: xp?.currentLvl || 1,
        vocabReviewed: vocabCount,
        readingCompleted: readingCount,
        listeningCompleted: listeningCount,
        speakingMastered: speakingCount,
        writingCompleted: writingCount,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
    };

    const unlocked: Array<{ achievementId: string; code: string; title: string; icon: string; xpReward: number }> = [];

    for (const ach of achievements) {
        if (existingIds.has(ach.id)) continue;
        const val = stats[ach.triggerField] || 0;
        if (val >= ach.triggerValue) {
            await prisma.userAchievement.create({
                data: { userId, achievementId: ach.id },
            });
            await awardXP(userId, 'daily_challenge', ach.xpReward / XP_REWARDS.daily_challenge);
            unlocked.push({ achievementId: ach.id, code: ach.code, title: ach.title, icon: ach.icon, xpReward: ach.xpReward });
        }
    }

    return unlocked;
}

export async function getUserAchievements(userId: string) {
    return prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
    });
}

// ─── DAILY CHALLENGES ───

export async function getDailyChallenge(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    let challenge = await prisma.dailyChallenge.findUnique({
        where: { userId_date: { userId, date: today } },
    });

    if (!challenge) {
        const types: string[] = ['vocab_review', 'reading', 'listening', 'writing', 'speaking'];
        const type = types[Math.floor(Math.random() * types.length)];
        const targets: Record<string, number> = { vocab_review: 10, reading: 2, listening: 3, writing: 1, speaking: 3 };

        challenge = await prisma.dailyChallenge.create({
            data: { userId, date: today, challengeType: type, targetCount: targets[type] || 5 },
        });
    }

    return challenge;
}

export async function updateDailyChallengeProgress(userId: string, challengeType: string) {
    const today = new Date().toISOString().split('T')[0];

    const challenge = await prisma.dailyChallenge.findUnique({
        where: { userId_date: { userId, date: today } },
    });

    if (!challenge || challenge.completed || challenge.challengeType !== challengeType) return null;

    const updated = await prisma.dailyChallenge.update({
        where: { id: challenge.id },
        data: {
            currentCount: { increment: 1 },
            ...(challenge.currentCount + 1 >= challenge.targetCount ? {
                completed: true,
                completedAt: new Date(),
                xpAwarded: XP_REWARDS.daily_challenge,
            } : {}),
        },
    });

    if (updated.completed && !challenge.completed) {
        await awardXP(userId, 'daily_challenge');
    }

    return updated;
}
