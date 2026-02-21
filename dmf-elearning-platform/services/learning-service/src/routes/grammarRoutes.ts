/**
 * Grammar Exercise Routes — Sprint 3 Fix 3.6
 * Interactive grammar practice endpoints
 */
import { Router, Request, Response } from 'express';
import {
    getExercisesForClient,
    checkAnswer,
    getTopics,
    getExerciseTypes,
} from '../services/GrammarExerciseService';
import { getPronunciationPack, SPEED_OPTIONS, LISTENING_SPEED_PRESETS } from '../services/ttsService';
import {
    authMiddleware,
    attachAuthenticatedUserId,
    ensureAuthenticatedUserProfile,
} from '../middlewares/auth';

const router = Router();
const auth = [authMiddleware, attachAuthenticatedUserId, ensureAuthenticatedUserProfile];

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

// ═══════════════════════════════════════════════════════════════
// GRAMMAR EXERCISES
// ═══════════════════════════════════════════════════════════════

/** GET /api/grammar/exercises?level=A1&type=fill_blank&limit=5 */
router.get('/exercises', async (req: Request, res: Response) => {
    try {
        const level = (req.query.level as CEFRLevel) || 'A1';
        const type = req.query.type as any;
        const limit = parseInt(req.query.limit as string) || 5;
        const exercises = getExercisesForClient(level, type, limit);
        res.json({ success: true, data: exercises });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** POST /api/grammar/check — Check answer */
router.post('/check', ...auth, async (req: Request, res: Response) => {
    try {
        const { exerciseId, answer } = req.body;
        if (!exerciseId || answer === undefined) {
            return res.status(400).json({ error: 'exerciseId and answer required' });
        }
        const result = checkAnswer(exerciseId, answer);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** GET /api/grammar/topics?level=A1 */
router.get('/topics', async (req: Request, res: Response) => {
    try {
        const level = req.query.level as CEFRLevel | undefined;
        const topics = getTopics(level);
        res.json({ success: true, data: topics });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** GET /api/grammar/types */
router.get('/types', async (_req: Request, res: Response) => {
    try {
        const types = getExerciseTypes();
        res.json({ success: true, data: types });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// TTS / PRONUNCIATION
// ═══════════════════════════════════════════════════════════════

/** GET /api/grammar/pronunciation?word=Hund&sentence=Der Hund ist groß */
router.get('/pronunciation', async (req: Request, res: Response) => {
    try {
        const word = req.query.word as string;
        if (!word) return res.status(400).json({ error: 'word required' });
        const sentence = req.query.sentence as string | undefined;
        const pack = getPronunciationPack(word, sentence);
        res.json({ success: true, data: pack });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** GET /api/grammar/listening-speeds — Available speed options */
router.get('/listening-speeds', async (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            options: SPEED_OPTIONS,
            presetsByLevel: LISTENING_SPEED_PRESETS,
        },
    });
});

export default router;
