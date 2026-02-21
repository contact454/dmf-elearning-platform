/**
 * Analytics Routes — Phase 1, Sprint 1.1
 * Admin dashboard API endpoints
 */
import { Router, Request, Response } from 'express';
import {
    getDashboardMetrics,
    getUserMetrics,
    getTrendingAlerts,
    trackEvent,
    exportForBigQuery,
} from '../services/AnalyticsService';

const router = Router();

// ─── Dashboard ───

/**
 * GET /api/analytics/dashboard
 * Full dashboard metrics for admin panel
 */
router.get('/dashboard', (req: Request, res: Response) => {
    try {
        const metrics = getDashboardMetrics();
        res.json({ success: true, data: metrics });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ANALYTICS_ERROR', message: error.message } });
    }
});

/**
 * GET /api/analytics/alerts
 * Trending alerts for admin attention
 */
router.get('/alerts', (req: Request, res: Response) => {
    try {
        const alerts = getTrendingAlerts();
        res.json({ success: true, data: alerts });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ANALYTICS_ERROR', message: error.message } });
    }
});

/**
 * GET /api/analytics/user/:userId
 * Analytics for a specific user
 */
router.get('/user/:userId', (req: Request, res: Response) => {
    try {
        const userId = String(req.params.userId);
        const metrics = getUserMetrics(userId);
        res.json({ success: true, data: metrics });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ANALYTICS_ERROR', message: error.message } });
    }
});

/**
 * POST /api/analytics/track
 * Track an analytics event
 */
router.post('/track', (req: Request, res: Response) => {
    try {
        const { userId, event, module, properties, sessionId } = req.body;
        if (!userId || !event) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId and event are required' },
            });
        }
        trackEvent({ userId, event, module: module || 'general', properties: properties || {}, timestamp: new Date(), sessionId });
        res.json({ success: true, data: { tracked: true } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ANALYTICS_ERROR', message: error.message } });
    }
});

/**
 * GET /api/analytics/export
 * Export events for BigQuery upload
 */
router.get('/export', (req: Request, res: Response) => {
    try {
        const since = req.query.since ? new Date(String(req.query.since)) : undefined;
        const events = exportForBigQuery(since);
        res.json({ success: true, data: { count: events.length, events } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ANALYTICS_ERROR', message: error.message } });
    }
});

export default router;
