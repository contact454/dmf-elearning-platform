import { Router } from 'express';
import { prisma } from '../database/connection';
import { z } from 'zod';

const router = Router();

// Validation schema
const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  topic: z.string().optional(),
});

// GET /api/prompts - List all prompts with pagination and filters
router.get('/', async (req, res) => {
  try {
    const validation = querySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { page, limit, cefr, topic } = validation.data;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (cefr) where.cefrLevel = cefr;
    if (topic) where.topic = topic;

    const [prompts, total] = await Promise.all([
      prisma.speakingPrompt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.speakingPrompt.count({ where }),
    ]);

    return res.json({
      data: prompts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/prompts/random - Get random prompt by CEFR level
router.get('/random', async (req, res) => {
  try {
    const { cefr } = req.query;

    if (!cefr || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cefr as string)) {
      return res.status(400).json({ error: 'Valid CEFR level required (A1-C2)' });
    }

    // Get count of prompts at this level
    const count = await prisma.speakingPrompt.count({
      where: { cefrLevel: cefr as string },
    });

    if (count === 0) {
      return res.status(404).json({ error: 'No prompts found for this level' });
    }

    // Random skip
    const randomSkip = Math.floor(Math.random() * count);

    const prompt = await prisma.speakingPrompt.findFirst({
      where: { cefrLevel: cefr as string },
      skip: randomSkip,
    });

    return res.json(prompt);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/prompts/:id - Get single prompt
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await prisma.speakingPrompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    return res.json(prompt);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
