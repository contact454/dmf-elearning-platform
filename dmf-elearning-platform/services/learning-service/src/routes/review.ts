import express from 'express'
import { z } from 'zod'
import * as reviewService from '../services/reviewService'
import { authMiddleware } from '../middlewares/auth'
import { updateStreakOnActivity } from '../middlewares/streak'

const router = express.Router()

/**
 * GET /api/review/queue
 * Get review queue for authenticated user
 */
router.get('/queue', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id
    const result = await reviewService.getReviewQueue(userId)
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error: any) {
    console.error('[API] /review/queue failed:', error.message)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch review queue'
      }
    })
  }
})

/**
 * POST /api/review/submit
 * Submit a review result
 * Body: { wordId: string, quality: number (0-5) }
 * 
 * Note: Streak middleware auto-updates user streak after successful submission
 */
router.post('/submit', authMiddleware, updateStreakOnActivity, async (req, res) => {
  try {
    const schema = z.object({
      wordId: z.string().cuid(),
      quality: z.number().int().min(0).max(5)
    })
    
    const { wordId, quality } = schema.parse(req.body)
    const userId = req.user!.id
    
    const result = await reviewService.submitReview(userId, wordId, quality as 0 | 1 | 2 | 3 | 4 | 5)
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        }
      })
    }
    
    console.error('[API] /review/submit failed:', error.message)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to submit review'
      }
    })
  }
})

/**
 * GET /api/review/stats
 * Get progress statistics for authenticated user
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id
    const result = await reviewService.getProgressStats(userId)
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error: any) {
    console.error('[API] /review/stats failed:', error.message)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch statistics'
      }
    })
  }
})

export default router
