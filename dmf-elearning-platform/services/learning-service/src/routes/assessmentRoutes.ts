/**
 * Prosody + Conversation Routes — Phase 2
 * Advanced pronunciation assessment + AI NPC roleplay
 */
import { Router, Request, Response } from 'express';
import { analyzeProsody, getFullPronunciationGuide } from '../services/ProsodyAnalysisService';
import {
    getScenarios,
    getScenarioById,
    startConversation,
    submitUserMessage,
    completeConversation,
    getSession,
    getUserSessions,
    buildGeminiSystemPrompt,
} from '../services/ConversationNPCService';

const router = Router();

// ═══════════════ PROSODY ANALYSIS ═══════════════

/**
 * POST /api/assessment/prosody/analyze
 * Full prosody analysis of a speaking attempt
 */
router.post('/prosody/analyze', (req: Request, res: Response) => {
    try {
        const { targetText, spokenText, durationMs, cefrLevel, sentenceType } = req.body;
        if (!targetText || !spokenText) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'targetText and spokenText are required' },
            });
        }
        const result = analyzeProsody(targetText, spokenText, durationMs || 5000, { cefrLevel, sentenceType });
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'PROSODY_ERROR', message: error.message } });
    }
});

/**
 * POST /api/assessment/prosody/guide
 * Get pronunciation guide for German text
 */
router.post('/prosody/guide', (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'text is required' },
            });
        }
        const guide = getFullPronunciationGuide(text);
        res.json({ success: true, data: guide });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'PROSODY_ERROR', message: error.message } });
    }
});

// ═══════════════ NPC CONVERSATIONS ═══════════════

/**
 * GET /api/assessment/conversation/scenarios
 * List available roleplay scenarios
 */
router.get('/conversation/scenarios', (req: Request, res: Response) => {
    try {
        const level = req.query.level as string | undefined;
        const scenarios = getScenarios(level);
        res.json({
            success: true,
            data: scenarios.map(s => ({
                id: s.id, title: s.title, titleVi: s.titleVi,
                description: s.description, difficulty: s.difficulty,
                npcName: s.npcName, npcRole: s.npcRole,
                objectives: s.objectives,
            })),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NPC_ERROR', message: error.message } });
    }
});

/**
 * GET /api/assessment/conversation/scenarios/:id
 * Get scenario details
 */
router.get('/conversation/scenarios/:id', (req: Request, res: Response) => {
    try {
        const scenario = getScenarioById(String(req.params.id));
        if (!scenario) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scenario not found' } });
        }
        res.json({ success: true, data: { ...scenario, systemPrompt: buildGeminiSystemPrompt(scenario) } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NPC_ERROR', message: error.message } });
    }
});

/**
 * POST /api/assessment/conversation/start
 * Start a new conversation session
 */
router.post('/conversation/start', (req: Request, res: Response) => {
    try {
        const { userId, scenarioId } = req.body;
        if (!userId || !scenarioId) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId and scenarioId are required' },
            });
        }
        const session = startConversation(userId, scenarioId);
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NPC_ERROR', message: error.message } });
    }
});

/**
 * POST /api/assessment/conversation/:sessionId/message
 * Send a message in an active conversation
 */
router.post('/conversation/:sessionId/message', async (req: Request, res: Response) => {
    try {
        const sessionId = String(req.params.sessionId);
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'message is required' },
            });
        }
        const result = await submitUserMessage(sessionId, message);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NPC_ERROR', message: error.message } });
    }
});

/**
 * POST /api/assessment/conversation/:sessionId/complete
 * End a conversation and get summary
 */
router.post('/conversation/:sessionId/complete', (req: Request, res: Response) => {
    try {
        const sessionId = String(req.params.sessionId);
        const summary = completeConversation(sessionId);
        res.json({ success: true, data: summary });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NPC_ERROR', message: error.message } });
    }
});

/**
 * GET /api/assessment/conversation/:sessionId
 * Get conversation session details
 */
router.get('/conversation/:sessionId', (req: Request, res: Response) => {
    try {
        const session = getSession(String(req.params.sessionId));
        if (!session) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
        }
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NPC_ERROR', message: error.message } });
    }
});

/**
 * GET /api/assessment/conversation/user/:userId/history
 * Get conversation history for a user
 */
router.get('/conversation/user/:userId/history', (req: Request, res: Response) => {
    try {
        const userId = String(req.params.userId);
        const sessions = getUserSessions(userId);
        res.json({
            success: true,
            data: sessions.map(s => ({
                id: s.id, scenarioTitle: s.scenario.title, scenarioTitleVi: s.scenario.titleVi,
                difficulty: s.scenario.difficulty, turns: s.turns.length, status: s.status,
                startedAt: s.startedAt, summary: s.summary,
            })),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'NPC_ERROR', message: error.message } });
    }
});

export default router;
