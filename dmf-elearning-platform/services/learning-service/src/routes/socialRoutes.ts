/**
 * Social + Speech Routes — Sprint 5
 * Study groups, speech recognition scoring
 */
import { Router, Request, Response } from 'express';
import {
    createGroup, joinGroup, leaveGroup, getUserGroups, getGroupDetails,
    createChallenge, updateChallengeProgress, getGroupLeaderboard,
} from '../services/StudyGroupService';
import {
    comparePronunciation, scoreSpeakingAttempt,
    getPronunciationGuide, getDifficultSounds,
} from '../services/SpeechRecognitionService';
import {
    authMiddleware, attachAuthenticatedUserId, ensureAuthenticatedUserProfile,
} from '../middlewares/auth';

const router = Router();
const auth = [authMiddleware, attachAuthenticatedUserId, ensureAuthenticatedUserProfile];

// ═══════════════════════════════════════════════════════════════
// STUDY GROUPS
// ═══════════════════════════════════════════════════════════════

/** POST /api/social/groups — Create group */
router.post('/groups', ...auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { name, description, level } = req.body;
        if (!name) return res.status(400).json({ error: 'name required' });
        const group = createGroup(userId, name, description || '', level);
        res.json({ success: true, data: group });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** GET /api/social/groups — Get user's groups */
router.get('/groups', ...auth, async (req: Request, res: Response) => {
    try {
        const groups = getUserGroups(req.user!.id);
        res.json({ success: true, data: groups });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** GET /api/social/groups/:id — Get group details */
router.get('/groups/:id', ...auth, async (req: Request, res: Response) => {
    try {
        const details = getGroupDetails(req.params.id as string);
        if (!details) return res.status(404).json({ error: 'Group not found' });
        res.json({ success: true, data: details });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** POST /api/social/groups/join — Join by invite code */
router.post('/groups/join', ...auth, async (req: Request, res: Response) => {
    try {
        const { inviteCode } = req.body;
        if (!inviteCode) return res.status(400).json({ error: 'inviteCode required' });
        const result = joinGroup(req.user!.id, inviteCode);
        if (!result.success) return res.status(400).json({ error: result.error });
        res.json({ success: true, data: result.group });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** POST /api/social/groups/:id/leave — Leave group */
router.post('/groups/:id/leave', ...auth, async (req: Request, res: Response) => {
    try {
        const ok = leaveGroup(req.user!.id, req.params.id as string);
        res.json({ success: ok });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** GET /api/social/groups/:id/leaderboard — Group leaderboard */
router.get('/groups/:id/leaderboard', ...auth, async (req: Request, res: Response) => {
    try {
        const lb = getGroupLeaderboard(req.params.id as string);
        res.json({ success: true, data: lb });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** POST /api/social/groups/:id/challenges — Create challenge */
router.post('/groups/:id/challenges', ...auth, async (req: Request, res: Response) => {
    try {
        const { title, description, targetType, targetValue, deadlineDays } = req.body;
        if (!title || !targetType || !targetValue) return res.status(400).json({ error: 'title, targetType, targetValue required' });
        const ch = createChallenge(req.params.id as string, title, description || '', targetType, targetValue, deadlineDays);
        res.json({ success: true, data: ch });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** POST /api/social/groups/:id/challenges/:chId/progress — Update progress */
router.post('/groups/:id/challenges/:chId/progress', ...auth, async (req: Request, res: Response) => {
    try {
        const { increment } = req.body;
        const ch = updateChallengeProgress(req.params.id as string, req.params.chId as string, increment || 1);
        if (!ch) return res.status(404).json({ error: 'Challenge not found' });
        res.json({ success: true, data: ch });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// SPEECH RECOGNITION
// ═══════════════════════════════════════════════════════════════

/** POST /api/social/speech/check — Score pronunciation */
router.post('/speech/check', ...auth, async (req: Request, res: Response) => {
    try {
        const { expected, transcribed, responseTimeMs } = req.body;
        if (!expected || !transcribed) return res.status(400).json({ error: 'expected and transcribed required' });
        const result = scoreSpeakingAttempt(expected, transcribed, responseTimeMs || 5000);
        res.json({ success: true, data: result });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** GET /api/social/speech/guide?word=Entschuldigung — Get pronunciation guide */
router.get('/speech/guide', async (req: Request, res: Response) => {
    try {
        const word = req.query.word as string;
        if (!word) return res.status(400).json({ error: 'word required' });
        const guide = getPronunciationGuide(word);
        res.json({ success: true, data: guide });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** GET /api/social/speech/difficult-sounds — All difficult German sounds */
router.get('/speech/difficult-sounds', async (_req: Request, res: Response) => {
    res.json({ success: true, data: getDifficultSounds() });
});

export default router;
