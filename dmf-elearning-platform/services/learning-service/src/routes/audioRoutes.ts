/**
 * Audio API Routes
 * Endpoints for audio generation and playback
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import * as ttsService from '../services/ttsService';

const router = express.Router();
const prisma = new PrismaClient();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function errorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

/**
 * GET /api/audio/status
 * Returns current TTS runtime/provider readiness.
 */
router.get('/status', async (_req: Request, res: Response) => {
  const status = ttsService.getTtsRuntimeStatus();
  return res.status(200).json({
    success: true,
    data: status,
  });
});

/**
 * GET /api/audio/:wordId
 * Get audio URL for a specific word
 * Generates and caches if not exists
 */
router.get('/:wordId', async (req: Request, res: Response) => {
  try {
    const { wordId } = req.params;

    // Validate wordId format
    const wordIdSchema = z.string().cuid();
    const validatedWordId = wordIdSchema.parse(wordId);

    // Get word from database
    const word = await prisma.vocabularyItem.findUnique({
      where: { id: validatedWordId },
      select: {
        id: true,
        word: true,
        audioUrl: true
      }
    });

    if (!word) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WORD_NOT_FOUND',
          message: 'Word not found'
        }
      });
    }

    // Generate/fetch audio URL
    const audioResult = await ttsService.generateAudio(
      word.id,
      word.word,
      'de-DE'
    );

    res.json({
      success: true,
      data: {
        wordId: word.id,
        word: word.word,
        audioUrl: audioResult.audioUrl,
        cached: audioResult.cached,
        source: audioResult.source,
        provider: audioResult.provider,
        fallbackRequired: audioResult.source === 'fallback',
        fallbackReason: audioResult.fallbackReason ?? null,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid word ID format',
          details: error.issues
        }
      });
    }

    console.error('[API] /audio/:wordId failed:', {
      wordId: req.params.wordId,
      error: errorMessage(error),
      stack: errorStack(error)
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate audio'
      }
    });
  }
});

/**
 * POST /api/audio/batch
 * Generate audio for multiple words (batch processing)
 * Requires admin authentication (TODO: add auth middleware)
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const schema = z.object({
      wordIds: z.array(z.string().cuid()).min(1).max(100), // Limit to 100 words per batch
      force: z.boolean().optional().default(false) // Force regeneration even if exists
    });

    const { wordIds, force } = schema.parse(req.body);

    console.log(`[API] Batch audio generation requested for ${wordIds.length} words (force: ${force})`);

    // If force regeneration, clear cache first
    if (force) {
      for (const wordId of wordIds) {
        try {
          await ttsService.clearAudioCache(wordId);
        } catch (error) {
          console.warn(`[API] Failed to clear cache for ${wordId}:`, errorMessage(error));
        }
      }
    }

    // Start batch generation
    const results = await ttsService.batchGenerateAudio(wordIds);

    res.json({
      success: true,
      data: {
        total: wordIds.length,
        successful: results.success,
        failed: results.failed,
        errors: results.errors
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: error.issues
        }
      });
    }

    console.error('[API] /audio/batch failed:', {
      error: errorMessage(error),
      stack: errorStack(error)
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Batch audio generation failed'
      }
    });
  }
});

/**
 * DELETE /api/audio/:wordId
 * Clear audio cache for a word (force regeneration on next request)
 * Requires admin authentication (TODO: add auth middleware)
 */
router.delete('/:wordId', async (req: Request, res: Response) => {
  try {
    const { wordId } = req.params;

    // Validate wordId format
    const wordIdSchema = z.string().cuid();
    const validatedWordId = wordIdSchema.parse(wordId);

    // Clear cache
    await ttsService.clearAudioCache(validatedWordId);

    res.json({
      success: true,
      data: {
        wordId: validatedWordId,
        message: 'Audio cache cleared successfully'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid word ID format',
          details: error.issues
        }
      });
    }

    console.error('[API] DELETE /audio/:wordId failed:', {
      wordId: req.params.wordId,
      error: errorMessage(error),
      stack: errorStack(error)
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to clear audio cache'
      }
    });
  }
});

export default router;
