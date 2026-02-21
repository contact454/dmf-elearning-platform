import { Router } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();
const analyticsService = new AnalyticsService();

router.use(authMiddleware);

// Validation schema
const analyticsSchema = z.object({
  period: z.enum(['week', 'month', 'all']).default('month'),
});

// GET /api/analytics/:userId
router.get('/:userId', async (req: AuthRequest, res) => {
  try {
    // Verify user can only access their own analytics
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const validation = analyticsSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { period } = validation.data;
    const stats = await analyticsService.getUserStats(req.userId!, period);

    return res.status(200).json({ stats });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
