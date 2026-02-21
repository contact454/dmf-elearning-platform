/**
 * Adaptive Learning Routes — Phase 3
 * xAPI tracking, CP-SIPP scheduling, student profiles
 */
import { Router, Request, Response } from 'express';
import {
    trackLearningEvent,
    getStatements,
    getStudentProfile,
    exportStatements,
    VERBS,
} from '../services/LRSService';
import {
    generateAdaptiveSchedule,
    adjustScheduleRealTime,
} from '../services/CPSIPPService';

const router = Router();

// ═══════════════ xAPI / LRS ═══════════════

/**
 * POST /api/adaptive/xapi/track
 * Track a learning event in xAPI format
 */
router.post('/xapi/track', (req: Request, res: Response) => {
    try {
        const { userId, verb, activityId, activityName, activityType, score, success, duration, cefrLevel, module, extras } = req.body;
        if (!userId || !verb || !activityId) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId, verb, and activityId are required' },
            });
        }
        if (!(verb in VERBS)) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: `Invalid verb. Valid: ${Object.keys(VERBS).join(', ')}` },
            });
        }
        const stmt = trackLearningEvent({ userId, verb, activityId, activityName: activityName || activityId, activityType: activityType || 'general', score, success, duration, cefrLevel, module, extras });
        res.json({ success: true, data: { statementId: stmt.id } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'LRS_ERROR', message: error.message } });
    }
});

/**
 * GET /api/adaptive/xapi/statements
 * Query xAPI statements
 */
router.get('/xapi/statements', (req: Request, res: Response) => {
    try {
        const { userId, verb, since, limit } = req.query;
        const stmts = getStatements({
            userId: userId as string,
            verb: verb as string,
            since: since as string,
            limit: limit ? parseInt(limit as string) : undefined,
        });
        res.json({ success: true, data: { count: stmts.length, statements: stmts } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'LRS_ERROR', message: error.message } });
    }
});

/**
 * GET /api/adaptive/xapi/export
 * Export xAPI statements for BigQuery
 */
router.get('/xapi/export', (req: Request, res: Response) => {
    try {
        const since = req.query.since as string | undefined;
        const data = exportStatements(since);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'LRS_ERROR', message: error.message } });
    }
});

/**
 * GET /api/adaptive/xapi/verbs
 * List available xAPI verbs
 */
router.get('/xapi/verbs', (_req: Request, res: Response) => {
    res.json({ success: true, data: VERBS });
});

// ═══════════════ STUDENT PROFILES ═══════════════

/**
 * GET /api/adaptive/profile/:userId
 * Get student behavior profile
 */
router.get('/profile/:userId', (req: Request, res: Response) => {
    try {
        const userId = String(req.params.userId);
        const profile = getStudentProfile(userId);
        res.json({ success: true, data: profile });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'PROFILE_ERROR', message: error.message } });
    }
});

// ═══════════════ CP-SIPP SCHEDULING ═══════════════

/**
 * POST /api/adaptive/schedule/generate
 * Generate adaptive daily schedule
 */
router.post('/schedule/generate', (req: Request, res: Response) => {
    try {
        const { userId, date, overrideLevel, maxMinutes, focusSkills, userMood } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId is required' },
            });
        }
        const schedule = generateAdaptiveSchedule(userId, { date, overrideLevel, maxMinutes, focusSkills, userMood });
        res.json({ success: true, data: schedule });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'SCHEDULER_ERROR', message: error.message } });
    }
});

/**
 * POST /api/adaptive/schedule/adjust
 * Real-time mid-session schedule adjustment
 */
router.post('/schedule/adjust', (req: Request, res: Response) => {
    try {
        const { schedule, signal } = req.body;
        if (!schedule || !signal) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'schedule and signal are required' },
            });
        }
        const adjusted = adjustScheduleRealTime(schedule, signal);
        res.json({ success: true, data: adjusted });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'SCHEDULER_ERROR', message: error.message } });
    }
});

export default router;
