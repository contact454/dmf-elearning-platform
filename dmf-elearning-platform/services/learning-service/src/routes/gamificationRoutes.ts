/**
 * Gamification API Routes — M3 + S1 Security Fix
 * /api/gamification/*
 * 
 * FIX 5.4: All routes now require authentication
 * FIX 4.1: XP award requires quality parameter
 */
import { Router, Request, Response } from 'express';
import {
    getUserXP,
    awardXP,
    getLeaderboard,
    updateStreak,
    checkAndUnlockAchievements,
    getUserAchievements,
    getDailyChallenge,
    updateDailyChallengeProgress,
} from '../services/GamificationService';
import {
    authMiddleware,
    attachAuthenticatedUserId,
    ensureAuthenticatedUserProfile,
} from '../middlewares/auth';

const router = Router();

// Auth middleware stack — applied to all authenticated routes
const auth = [authMiddleware, attachAuthenticatedUserId, ensureAuthenticatedUserProfile];

// ─── XP ───

/** GET /api/gamification/xp — Get authenticated user's XP */
router.get('/xp', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const xp = await getUserXP(userId);
        res.json({ success: true, data: xp });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/gamification/xp/award
 * FIX 4.1: Requires quality (0-5). quality < 3 = 0 XP.
 * Body: { source, quality?, multiplier? }
 */
router.post('/xp/award', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { source, quality, multiplier } = req.body;
        if (!source) return res.status(400).json({ error: 'source required' });

        // FIX 4.1: Quality gating — failed reviews earn 0 XP
        const qualityScore = typeof quality === 'number' ? quality : 5;
        if (qualityScore < 3) {
            return res.json({
                success: true,
                data: { xpAwarded: 0, reason: 'Quality too low (< 3)', source },
            });
        }

        // Scale XP by quality: base * (quality / 5)
        const qualityMultiplier = qualityScore / 5;
        const effectiveMultiplier = (multiplier || 1) * qualityMultiplier;

        const result = await awardXP(userId, source, effectiveMultiplier);

        // Check achievements after XP award
        const achievements = await checkAndUnlockAchievements(userId);
        res.json({ success: true, data: { ...result, newAchievements: achievements } });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── LEADERBOARD ───
// Leaderboard stays public (read-only, no user data mutation)

/** GET /api/gamification/leaderboard?period=alltime&limit=20 */
router.get('/leaderboard', async (req: Request, res: Response) => {
    try {
        const period = (req.query.period as any) || 'alltime';
        const limit = parseInt(req.query.limit as string) || 20;
        const data = await getLeaderboard(period, limit);
        res.json({ success: true, data });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── STREAKS ───

/** POST /api/gamification/streak — Update authenticated user's streak */
router.post('/streak', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const result = await updateStreak(userId);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── ACHIEVEMENTS ───

/** GET /api/gamification/achievements — Get authenticated user's achievements */
router.get('/achievements', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const data = await getUserAchievements(userId);
        res.json({ success: true, data });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** POST /api/gamification/achievements/check — Check for new unlocks */
router.post('/achievements/check', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const unlocked = await checkAndUnlockAchievements(userId);
        res.json({ success: true, data: { unlocked } });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── DAILY CHALLENGES ───

/** GET /api/gamification/daily-challenge — Get authenticated user's challenge */
router.get('/daily-challenge', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const data = await getDailyChallenge(userId);
        res.json({ success: true, data });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** POST /api/gamification/daily-challenge/progress — Update challenge progress */
router.post('/daily-challenge/progress', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { challengeType } = req.body;
        if (!challengeType) return res.status(400).json({ error: 'challengeType required' });
        const data = await updateDailyChallengeProgress(userId, challengeType);
        res.json({ success: true, data });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
