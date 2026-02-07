import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { SubmissionService } from '../services/submissionService';
import { AuthRequest } from '../types';
import { z } from 'zod';

const router = Router();
const submissionService = new SubmissionService();

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const createSubmissionSchema = z.object({
  promptId: z.string().uuid(),
  audioUrl: z.string().url(),
  durationSeconds: z.number().positive(),
});

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['pending', 'analyzing', 'analyzed', 'reviewed']).optional(),
});

// POST /api/submissions - Create new submission
router.post('/', async (req: AuthRequest, res) => {
  try {
    const validation = createSubmissionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { promptId, audioUrl, durationSeconds } = validation.data;
    const userId = req.userId!;

    const submission = await submissionService.createSubmission(
      userId,
      promptId,
      audioUrl,
      durationSeconds
    );

    return res.status(201).json(submission);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// GET /api/submissions - List user's submissions
router.get('/', async (req: AuthRequest, res) => {
  try {
    const validation = querySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { page, limit, status } = validation.data;
    const userId = req.userId!;

    const result = await submissionService.getUserSubmissions(userId, {
      page,
      limit,
      status,
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/submissions/:id - Get single submission with feedback
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.userId!;

    const submission = await submissionService.getSubmission(id, userId);

    return res.json(submission);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/submissions/:id - Delete submission
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.userId!;

    const result = await submissionService.deleteSubmission(id, userId);

    return res.json(result);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;
