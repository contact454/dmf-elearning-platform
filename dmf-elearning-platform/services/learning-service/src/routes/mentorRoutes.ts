/**
 * Mentor API Routes — M6 S19-04
 * Feedback queue, mentee progress, feedback submission
 */
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middlewares/rbac';

const prisma = new PrismaClient();
const router = Router();

router.use(requireRole('mentor', 'teacher', 'admin'));

// ─── FEEDBACK QUEUE ───

/** GET /api/mentor/queue — get pending feedback queue */
router.get('/queue', async (req: Request, res: Response) => {
    try {
        const [writingQueue, speakingQueue] = await Promise.all([
            prisma.userWritingProgress.findMany({
                where: { status: 'submitted' },
                take: 30, orderBy: { createdAt: 'asc' },
                select: { id: true, userId: true, promptId: true, createdAt: true },
            }),
            prisma.userSpeakingProgress.findMany({
                where: { status: 'in_progress' },
                take: 30, orderBy: { createdAt: 'asc' },
                select: { id: true, userId: true, promptId: true, createdAt: true },
            }),
        ]);

        res.json({
            success: true,
            data: {
                writing: { items: writingQueue, count: writingQueue.length },
                speaking: { items: speakingQueue, count: speakingQueue.length },
                total: writingQueue.length + speakingQueue.length,
            },
        });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── MENTEE PROGRESS ───

/** GET /api/mentor/mentees — list assigned mentees */
router.get('/mentees', async (req: Request, res: Response) => {
    try {
        const mentees = await prisma.user.findMany({
            where: { role: 'learner' },
            take: 50, orderBy: { lastActivityDate: 'desc' },
            select: {
                id: true, name: true, email: true,
                currentStreak: true, longestStreak: true, lastActivityDate: true,
            },
        });
        res.json({ success: true, data: mentees });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** GET /api/mentor/mentees/:id — mentee detail */
router.get('/mentees/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const [user, xp, vocabCount] = await Promise.all([
            prisma.user.findUnique({ where: { id } }),
            prisma.userXP.findUnique({ where: { userId: id } }),
            prisma.userWordProgress.count({ where: { userId: id } }),
        ]);
        if (!user) return res.status(404).json({ error: 'Mentee not found' });
        res.json({ success: true, data: { user, xp, vocabCount } });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── FEEDBACK SUBMISSION ───

/** POST /api/mentor/feedback/writing/:progressId — submit writing feedback */
router.post('/feedback/writing/:progressId', async (req: Request, res: Response) => {
    try {
        const progressId = req.params.progressId as string;
        const { feedback } = req.body;
        if (!feedback) return res.status(400).json({ error: 'feedback required' });

        const updated = await prisma.userWritingProgress.update({
            where: { id: progressId },
            data: {
                status: 'completed',
            },
        });
        res.json({ success: true, data: updated });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
