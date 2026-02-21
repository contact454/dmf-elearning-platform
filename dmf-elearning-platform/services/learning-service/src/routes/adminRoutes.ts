/**
 * Admin API Routes — M6 S19
 * User management, system health, content moderation
 */
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middlewares/rbac';

const prisma = new PrismaClient();
const router = Router();

router.use(requireRole('admin'));

// ─── USER MANAGEMENT ───

/** GET /api/admin/users — list all users with pagination */
router.get('/users', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const role = req.query.role as string | undefined;

        const where = role ? { role } : {};
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where, take: limit, skip: (page - 1) * limit,
                orderBy: { createdAt: 'desc' },
                select: { id: true, email: true, name: true, role: true, currentStreak: true, createdAt: true, lastActivityDate: true },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({ success: true, data: users, total, page, totalPages: Math.ceil(total / limit) });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** PATCH /api/admin/users/:id/role — update user role */
router.patch('/users/:id/role', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { role } = req.body;
        if (!['learner', 'teacher', 'mentor', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be: learner, teacher, mentor, admin' });
        }
        const user = await prisma.user.update({
            where: { id }, data: { role },
            select: { id: true, email: true, name: true, role: true },
        });
        res.json({ success: true, data: user });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/** DELETE /api/admin/users/:id — soft-deactivate (or delete) user */
router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.user.delete({ where: { id } });
        res.json({ success: true, message: 'User deleted' });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── SYSTEM HEALTH ───

/** GET /api/admin/stats — system dashboard stats */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const [
            totalUsers, totalTeachers, totalContent,
            totalVocab, totalAchievements,
            activeToday,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'teacher' } }),
            prisma.readingContent.count({ where: { isPublished: true } }),
            prisma.readingContent.count(),
            prisma.achievement.count({ where: { isActive: true } }),
            prisma.user.count({
                where: { lastActivityDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
            }),
        ]);

        res.json({
            success: true,
            data: {
                users: { total: totalUsers, teachers: totalTeachers, activeToday },
                content: { reading: totalContent, vocabulary: totalVocab, achievements: totalAchievements },
                health: { status: 'healthy', uptime: process.uptime(), memory: process.memoryUsage() },
            },
        });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── CONTENT MODERATION ───

/** PATCH /api/admin/content/:type/:id/publish — publish/unpublish content */
router.patch('/content/:type/:id/publish', async (req: Request, res: Response) => {
    try {
        const type = req.params.type as string;
        const id = req.params.id as string;
        const { isPublished } = req.body;

        const modelMap: Record<string, any> = {
            reading: prisma.readingContent,
            speaking: prisma.speakingPrompt,
            writing: prisma.writingPrompt,
            listening: prisma.listeningContent,
        };

        const model = modelMap[type];
        if (!model) return res.status(400).json({ error: 'Invalid type: reading, speaking, writing, listening' });

        const result = await model.update({ where: { id }, data: { isPublished: !!isPublished } });
        res.json({ success: true, data: result });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
