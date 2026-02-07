import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { AnalyticsService } from '../services/analyticsService';
import { AuthRequest } from '../types';

const router = Router();
const analyticsService = new AnalyticsService();

// All routes require authentication
router.use(authMiddleware);

// GET /api/analytics/progress - Get user's speaking progress stats
router.get('/progress', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const progress = await analyticsService.getUserProgress(userId);

    return res.json(progress);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/weaknesses - Get pronunciation weaknesses
router.get('/weaknesses', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const weaknesses = await analyticsService.getPronunciationWeaknesses(userId, limit);

    return res.json(weaknesses);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
