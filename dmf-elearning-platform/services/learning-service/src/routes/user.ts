import express from 'express'
import * as streakService from '../services/streakService'
import { authMiddleware } from '../middlewares/auth'

const router = express.Router()

/**
 * GET /api/user/streak
 * Get streak data for authenticated user
 */
router.get('/streak', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id
    const result = await streakService.getStreakData(userId)
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error: any) {
    console.error('[API] /user/streak failed:', error.message)
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      })
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch streak data'
      }
    })
  }
})

export default router
