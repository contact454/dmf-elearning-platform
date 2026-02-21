/**
 * Teacher API Routes — M6 S18
 * Protected routes for course authoring, student monitoring, grading
 */
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middlewares/rbac';

const prisma = new PrismaClient();
const router = Router();

// All teacher routes require teacher or admin role
router.use(requireRole('teacher', 'admin'));

// ─── COURSE AUTHORING ───

/** GET /api/teacher/courses — list courses created by this teacher */
router.get('/courses', async (req: Request, res: Response) => {
    try {
        // In a full implementation, filter by teacher ID
        const courses = await prisma.readingContent.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, level: true, topic: true, isPublished: true, createdAt: true },
        });
        res.json({ success: true, data: courses, count: courses.length });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** POST /api/teacher/content/reading — create a reading passage */
router.post('/content/reading', async (req: Request, res: Response) => {
    try {
        const { title, content, level, topic, wordCount } = req.body;
        if (!title || !content || !level) {
            return res.status(400).json({ error: 'title, content, level required' });
        }
        const entry = await prisma.readingContent.create({
            data: {
                title, content, level, topic: topic || 'General',
                wordCount: wordCount || content.split(/\s+/).length,
                difficultyScore: level === 'A1' ? 20 : level === 'A2' ? 40 : level === 'B1' ? 60 : 80,
                source: 'teacher',
                isPublished: false,
            },
        });
        res.status(201).json({ success: true, data: entry });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** POST /api/teacher/content/speaking — create a speaking prompt */
router.post('/content/speaking', async (req: Request, res: Response) => {
    try {
        const { title, level, topic, category, promptText, promptTextVi, sampleResponse } = req.body;
        if (!title || !level || !promptText) {
            return res.status(400).json({ error: 'title, level, promptText required' });
        }
        const entry = await prisma.speakingPrompt.create({
            data: {
                title, level, topic: topic || 'General', category: category || 'general',
                promptText, promptTextVi: promptTextVi || '',
                sampleResponse: sampleResponse || '',
                targetWords: [], difficulty: level === 'A1' ? 1 : level === 'A2' ? 2 : level === 'B1' ? 3 : 4,
                tags: [level, topic || 'General'],
                isPublished: false,
            },
        });
        res.status(201).json({ success: true, data: entry });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** POST /api/teacher/content/writing — create a writing prompt */
router.post('/content/writing', async (req: Request, res: Response) => {
    try {
        const { title, level, topic, promptText, promptTextVi, instructions, minWords } = req.body;
        if (!title || !level || !promptText) {
            return res.status(400).json({ error: 'title, level, promptText required' });
        }
        const entry = await prisma.writingPrompt.create({
            data: {
                title, level, topic: topic || 'General', category: 'free_writing',
                promptText, promptTextVi: promptTextVi || '',
                instructions: instructions || '', sampleResponse: '',
                grammarPoints: [], vocabularyFocus: [], keywords: [],
                minWords: minWords || 50,
                difficulty: level === 'A1' ? 1 : level === 'A2' ? 2 : level === 'B1' ? 3 : 5,
                tags: [level, topic || 'General'],
                isPublished: false,
            },
        });
        res.status(201).json({ success: true, data: entry });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── STUDENT MONITORING ───

/** GET /api/teacher/students — list students with progress summary */
router.get('/students', async (req: Request, res: Response) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'learner' },
            take: 100,
            orderBy: { lastActivityDate: 'desc' },
            select: {
                id: true, email: true, name: true,
                currentStreak: true, longestStreak: true, lastActivityDate: true,
                createdAt: true,
            },
        });
        res.json({ success: true, data: students, count: students.length });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** GET /api/teacher/students/:id/progress — detailed student progress */
router.get('/students/:id/progress', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const [user, vocabCount, readingCount, listeningCount, speakingCount, writingCount, xp] = await Promise.all([
            prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, currentStreak: true, longestStreak: true } }),
            prisma.userWordProgress.count({ where: { userId: id } }),
            prisma.userReadingProgress.count({ where: { userId: id, status: 'completed' } }),
            prisma.userListeningProgress.count({ where: { userId: id, status: 'completed' } }),
            prisma.userSpeakingProgress.count({ where: { userId: id } }),
            prisma.userWritingProgress.count({ where: { userId: id, status: 'completed' } }),
            prisma.userXP.findUnique({ where: { userId: id } }),
        ]);
        if (!user) return res.status(404).json({ error: 'Student not found' });

        res.json({
            success: true,
            data: {
                student: user,
                progress: { vocabCount, readingCount, listeningCount, speakingCount, writingCount },
                xp: { totalXP: xp?.totalXP || 0, level: xp?.currentLvl || 1 },
            },
        });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── GRADING ───

/** GET /api/teacher/pending — pending writing submissions needing review */
router.get('/pending', async (req: Request, res: Response) => {
    try {
        const pending = await prisma.userWritingProgress.findMany({
            where: { status: 'submitted' },
            take: 50,
            orderBy: { createdAt: 'desc' },
            select: { id: true, userId: true, promptId: true, status: true, createdAt: true },
        });
        res.json({ success: true, data: pending, count: pending.length });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
