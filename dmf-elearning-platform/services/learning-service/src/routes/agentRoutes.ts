/**
 * Agent Routes — Phase 5
 * Socratic Tutor + Early Warning + Admin Concierge
 */
import { Router, Request, Response } from 'express';
import {
    startTutorSession,
    respondToTutor,
    resolveSession,
    getTutorSession,
    getUserTutorHistory,
} from '../services/SocraticTutorService';
import {
    analyzeUser,
    analyzeAllUsers,
    executeIntervention,
    getAlerts,
    dismissAlert,
} from '../services/EarlyWarningService';
import {
    processQuery,
} from '../services/AdminConciergeService';

const router = Router();

// ═══════════════ SOCRATIC TUTOR ═══════════════

/**
 * POST /api/agents/tutor/start
 * Start a tutoring session when student is stuck
 */
router.post('/tutor/start', (req: Request, res: Response) => {
    try {
        const { userId, module, exerciseId, question, userAnswer, correctAnswer, difficulty } = req.body;
        if (!userId || !module) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'userId and module are required' } });
        }
        const session = startTutorSession(userId, module, { exerciseId, question, userAnswer, correctAnswer, difficulty });
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'TUTOR_ERROR', message: error.message } });
    }
});

/**
 * POST /api/agents/tutor/:sessionId/respond
 * Student responds to tutor guidance
 */
router.post('/tutor/:sessionId/respond', (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'message is required' } });
        }
        const response = respondToTutor(String(req.params.sessionId), message);
        res.json({ success: true, data: response });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'TUTOR_ERROR', message: error.message } });
    }
});

/**
 * POST /api/agents/tutor/:sessionId/resolve
 * Mark session as resolved
 */
router.post('/tutor/:sessionId/resolve', (req: Request, res: Response) => {
    try {
        const session = resolveSession(String(req.params.sessionId));
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'TUTOR_ERROR', message: error.message } });
    }
});

/**
 * GET /api/agents/tutor/:sessionId
 * Get tutor session
 */
router.get('/tutor/:sessionId', (req: Request, res: Response) => {
    try {
        const session = getTutorSession(String(req.params.sessionId));
        if (!session) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'TUTOR_ERROR', message: error.message } });
    }
});

/**
 * GET /api/agents/tutor/user/:userId/history
 * Get tutor history for user
 */
router.get('/tutor/user/:userId/history', (req: Request, res: Response) => {
    try {
        const sessions = getUserTutorHistory(String(req.params.userId));
        res.json({ success: true, data: { count: sessions.length, sessions } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'TUTOR_ERROR', message: error.message } });
    }
});

// ═══════════════ EARLY WARNING ═══════════════

/**
 * POST /api/agents/warnings/analyze
 * Analyze a specific user for warning signals
 */
router.post('/warnings/analyze', (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'userId is required' } });
        const alerts = analyzeUser(userId);
        res.json({ success: true, data: { userId, alertCount: alerts.length, alerts } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'WARNING_ERROR', message: error.message } });
    }
});

/**
 * POST /api/agents/warnings/analyze-batch
 * Batch analyze multiple users
 */
router.post('/warnings/analyze-batch', (req: Request, res: Response) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'userIds array required' } });
        const result = analyzeAllUsers(userIds);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'WARNING_ERROR', message: error.message } });
    }
});

/**
 * GET /api/agents/warnings
 * Get all warning alerts
 */
router.get('/warnings', (req: Request, res: Response) => {
    try {
        const { userId, severity, status, type } = req.query;
        const alerts = getAlerts({ userId: userId as string, severity: severity as string, status: status as string, type: type as string });
        res.json({ success: true, data: { count: alerts.length, alerts } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'WARNING_ERROR', message: error.message } });
    }
});

/**
 * POST /api/agents/warnings/:alertId/execute
 * Execute auto-interventions for an alert
 */
router.post('/warnings/:alertId/execute', (req: Request, res: Response) => {
    try {
        const result = executeIntervention(String(req.params.alertId));
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'WARNING_ERROR', message: error.message } });
    }
});

/**
 * POST /api/agents/warnings/:alertId/dismiss
 * Dismiss an alert
 */
router.post('/warnings/:alertId/dismiss', (req: Request, res: Response) => {
    try {
        dismissAlert(String(req.params.alertId));
        res.json({ success: true, data: { dismissed: true } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'WARNING_ERROR', message: error.message } });
    }
});

// ═══════════════ ADMIN CONCIERGE ═══════════════

/**
 * POST /api/agents/concierge
 * Ask the admin concierge bot
 */
router.post('/concierge', (req: Request, res: Response) => {
    try {
        const { question, adminId, language } = req.body;
        if (!question) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'question is required' } });
        const response = processQuery({ question, adminId: adminId || 'admin', language });
        res.json({ success: true, data: response });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'CONCIERGE_ERROR', message: error.message } });
    }
});

export default router;
