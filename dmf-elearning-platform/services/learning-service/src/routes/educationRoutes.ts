/**
 * Education & AI API Routes — M4
 * /api/education/* and /api/ai/*
 */
import { Router, Request, Response } from 'express';
import { assessCEFRLevel, getCEFRProgress, SkillMastery } from '../education/cefr-engine';
import { checkReadiness, ReadinessEvidence } from '../education/readiness-model';
import { scoreWriting, WritingRubricScores, scoreSpeaking, SpeakingRubricScores } from '../education/rubric';
import { gradeWriting } from '../ai/skill-mastery/writingFeedback';

const router = Router();

// ─── CEFR ───

/** POST /api/education/cefr/assess */
router.post('/cefr/assess', (req: Request, res: Response) => {
    try {
        const mastery = req.body.mastery as SkillMastery;
        if (!mastery) return res.status(400).json({ error: 'mastery object required' });
        const level = assessCEFRLevel(mastery);
        const progress = getCEFRProgress(mastery);
        res.json({ success: true, data: { level, progress } });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── READINESS ───

/** POST /api/education/readiness/check */
router.post('/readiness/check', (req: Request, res: Response) => {
    try {
        const { currentLevel, mastery, evidence } = req.body;
        if (!currentLevel || !mastery || !evidence) {
            return res.status(400).json({ error: 'currentLevel, mastery, and evidence required' });
        }
        const result = checkReadiness(currentLevel, mastery as SkillMastery, evidence as ReadinessEvidence);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── RUBRIC SCORING ───

/** POST /api/education/rubric/writing */
router.post('/rubric/writing', (req: Request, res: Response) => {
    try {
        const scores = req.body.scores as WritingRubricScores;
        if (!scores) return res.status(400).json({ error: 'scores object required' });
        const result = scoreWriting(scores);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/** POST /api/education/rubric/speaking */
router.post('/rubric/speaking', (req: Request, res: Response) => {
    try {
        const scores = req.body.scores as SpeakingRubricScores;
        if (!scores) return res.status(400).json({ error: 'scores object required' });
        const result = scoreSpeaking(scores);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── AI GRADING ───

/** POST /api/ai/grade-writing */
router.post('/grade-writing', async (req: Request, res: Response) => {
    try {
        const { submission, promptText, level } = req.body;
        if (!submission || !promptText || !level) {
            return res.status(400).json({ error: 'submission, promptText, and level required' });
        }
        const feedback = await gradeWriting(submission, promptText, level);
        const rubric = scoreWriting({
            grammar: feedback.grammar,
            vocabulary: feedback.vocabulary,
            coherence: feedback.coherence,
            taskCompletion: feedback.taskCompletion,
        });
        res.json({ success: true, data: { feedback, rubric } });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
