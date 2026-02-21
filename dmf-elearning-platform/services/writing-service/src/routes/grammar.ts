import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { LanguageToolService } from '../services/languageToolService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();
const languageToolService = new LanguageToolService();

// Rate limiting: max 60 requests per minute per user
const grammarCheckLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many grammar check requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema
const checkSchema = z.object({
  text: z.string().min(1).max(100000, 'Text too long (max 100,000 characters)'),
  language: z.string().default('de-DE'),
});

// POST /api/grammar/check
router.post('/check', authMiddleware, grammarCheckLimiter, async (req: AuthRequest, res) => {
  try {
    const validation = checkSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { text, language } = validation.data;

    // Check grammar
    const result = await languageToolService.checkGrammar(text, language);

    return res.status(200).json({
      errors: result.errors,
      language,
      processingTimeMs: result.processingTimeMs,
    });
  } catch (error: any) {
    console.error('Grammar check error:', error);
    return res.status(500).json({ error: 'Grammar check failed' });
  }
});

export default router;
