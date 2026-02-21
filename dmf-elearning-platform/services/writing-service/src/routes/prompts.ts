import { Router } from 'express';
import { prisma } from '../database/connection';
import { z } from 'zod';

const router = Router();

// Validation schemas
const listPromptsSchema = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  category: z.string().optional(),
});

// GET /api/prompts - List prompts (no auth required for browsing)
router.get('/', async (req, res) => {
  try {
    const validation = listPromptsSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { level, category } = validation.data;

    const prompts = await prisma.prompt.findMany({
      where: {
        ...(level && { cefrLevel: level }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({ prompts });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/prompts/:id - Get single prompt
router.get('/:id', async (req, res) => {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: req.params.id },
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    return res.status(200).json({ prompt });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
