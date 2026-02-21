/**
 * Notification Routes — Phase 1, Sprint 1.2
 * Push notification management + nudge configuration
 */
import { Router, Request, Response } from 'express';
import {
    registerPushToken,
    getUserPrefs,
    updateUserPrefs,
    sendNotification,
    processPendingNudges,
    scheduleSRSNudge,
    scheduleStreakWarning,
    getNotificationHistory,
    getPendingNudgesCount,
} from '../services/NotificationService';

const router = Router();

// ─── Push Token Registration ───

/**
 * POST /api/notifications/register
 * Register push token for current user
 */
router.post('/register', (req: Request, res: Response) => {
    try {
        const { userId, pushToken } = req.body;
        if (!userId || !pushToken) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId and pushToken are required' },
            });
        }
        registerPushToken(userId, pushToken);
        res.json({ success: true, data: { registered: true } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

// ─── Preferences ───

/**
 * GET /api/notifications/preferences/:userId
 * Get notification preferences
 */
router.get('/preferences/:userId', (req: Request, res: Response) => {
    try {
        const userId = String(req.params.userId);
        const prefs = getUserPrefs(userId);
        res.json({ success: true, data: prefs });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

/**
 * PUT /api/notifications/preferences/:userId
 * Update notification preferences
 */
router.put('/preferences/:userId', (req: Request, res: Response) => {
    try {
        const userId = String(req.params.userId);
        const updates = req.body;
        const prefs = updateUserPrefs(userId, updates);
        res.json({ success: true, data: prefs });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

// ─── Send / Test ───

/**
 * POST /api/notifications/send
 * Send a notification (admin/test)
 */
router.post('/send', async (req: Request, res: Response) => {
    try {
        const { userId, title, body, data } = req.body;
        if (!userId || !title || !body) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId, title, and body are required' },
            });
        }
        const result = await sendNotification({ userId, title, body, data });
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

// ─── Nudges ───

/**
 * POST /api/notifications/nudge/srs
 * Schedule SRS review nudge
 */
router.post('/nudge/srs', (req: Request, res: Response) => {
    try {
        const { userId, dueCount, nextDueAt } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId is required' },
            });
        }
        scheduleSRSNudge(userId, dueCount || 1, nextDueAt ? new Date(nextDueAt) : new Date());
        res.json({ success: true, data: { scheduled: true } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

/**
 * POST /api/notifications/nudge/streak
 * Schedule streak warning nudge
 */
router.post('/nudge/streak', (req: Request, res: Response) => {
    try {
        const { userId, currentStreak } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId is required' },
            });
        }
        scheduleStreakWarning(userId, currentStreak || 0);
        res.json({ success: true, data: { scheduled: true } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

/**
 * POST /api/notifications/nudge/process
 * Process all pending nudges (called by Cloud Scheduler job)
 */
router.post('/nudge/process', async (req: Request, res: Response) => {
    try {
        const result = await processPendingNudges();
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

// ─── History ───

/**
 * GET /api/notifications/history/:userId
 * Get notification history
 */
router.get('/history/:userId', (req: Request, res: Response) => {
    try {
        const userId = String(req.params.userId);
        const history = getNotificationHistory(userId);
        res.json({ success: true, data: { count: history.length, notifications: history } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

/**
 * GET /api/notifications/pending
 * Get count of pending nudges (admin)
 */
router.get('/pending', (req: Request, res: Response) => {
    try {
        const count = getPendingNudgesCount();
        res.json({ success: true, data: { pending: count } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
    }
});

export default router;
