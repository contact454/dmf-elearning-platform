import { Router } from 'express';
import { EssayService } from '../services/essayService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();
const essayService = new EssayService();

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const createEssaySchema = z.object({
  promptId: z.string().uuid().optional().nullable(),
  content: z.string().min(1, 'Content is required'),
});

const updateEssaySchema = z.object({
  content: z.string().optional(),
  errorCount: z.number().int().min(0).optional(),
  writingTimeSeconds: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'submitted', 'reviewed']).optional(),
});

// POST /api/essays - Create new essay
router.post('/', async (req: AuthRequest, res) => {
  try {
    const validation = createEssaySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { promptId, content } = validation.data;
    const essay = await essayService.createEssay(req.userId!, promptId || null, content);
    return res.status(201).json({ essay });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/essays - List user's essays
router.get('/', async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit || '20')), 100);
    const offset = parseInt(String(req.query.offset || '0'));

    const result = await essayService.listEssays(req.userId!, limit, offset);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/essays/:id - Get essay with errors
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const essay = await essayService.getEssay(req.params.id, req.userId!);
    return res.status(200).json({ essay });
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

// PUT /api/essays/:id - Update essay
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const validation = updateEssaySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const essay = await essayService.updateEssay(req.params.id, req.userId!, validation.data);
    return res.status(200).json({ essay });
  } catch (error: any) {
    if (error.message === 'Essay not found or access denied') {
      return res.status(403).json({ error: 'Not authorized to update this essay' });
    }
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/essays/:id - Delete essay
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await essayService.deleteEssay(req.params.id, req.userId!);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

export default router;
