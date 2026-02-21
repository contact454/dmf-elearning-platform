/**
 * Onboarding API Routes — Sprint 2
 * Placement test + Learning path + Session tracking
 */
import { Router, Request, Response } from 'express';
import {
    generatePlacementTest,
    calculatePlacementResult,
    savePlacementResult,
} from '../services/PlacementTestService';
import {
    getTodayPlan,
    completeStep,
    getWeeklySummary,
} from '../services/LearningPathService';
import {
    authMiddleware,
    attachAuthenticatedUserId,
    ensureAuthenticatedUserProfile,
} from '../middlewares/auth';

const router = Router();
const auth = [authMiddleware, attachAuthenticatedUserId, ensureAuthenticatedUserProfile];

// ═══════════════════════════════════════════════════════════════
// PLACEMENT TEST
// ═══════════════════════════════════════════════════════════════

/** GET /api/onboarding/placement/start — Generate placement test */
router.get('/placement/start', async (_req: Request, res: Response) => {
    try {
        const questions = generatePlacementTest();
        // Send questions without correct answers
        const safeQuestions = questions.map(q => ({
            id: q.id,
            level: q.level,
            type: q.type,
            question: q.question,
            options: q.options,
        }));
        res.json({ success: true, data: { questions: safeQuestions, totalQuestions: safeQuestions.length } });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** POST /api/onboarding/placement/submit — Submit all answers */
router.post('/placement/submit', async (req: Request, res: Response) => {
    try {
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'answers array required' });
        }
        const questions = generatePlacementTest(); // Regenerate to get correct answers
        const result = calculatePlacementResult(questions, answers);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** POST /api/onboarding/placement/save — Save result to user profile */
router.post('/placement/save', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { answers } = req.body;
        const questions = generatePlacementTest();
        const result = calculatePlacementResult(questions, answers);
        await savePlacementResult(userId, result);
        res.json({ success: true, data: { ...result, saved: true } });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// LEARNING PATH
// ═══════════════════════════════════════════════════════════════

/** GET /api/onboarding/learning-path/today — Today's plan */
router.get('/learning-path/today', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const plan = await getTodayPlan(userId);
        res.json({ success: true, data: plan });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** POST /api/onboarding/learning-path/complete-step — Mark step done */
router.post('/learning-path/complete-step', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { stepId } = req.body;
        if (!stepId) return res.status(400).json({ error: 'stepId required' });
        const result = await completeStep(userId, stepId);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** GET /api/onboarding/learning-path/weekly — Week summary */
router.get('/learning-path/weekly', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const summary = await getWeeklySummary(userId);
        res.json({ success: true, data: summary });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
