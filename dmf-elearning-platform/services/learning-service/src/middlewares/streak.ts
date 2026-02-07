import { Request, Response, NextFunction } from 'express'
import * as streakService from '../services/streakService'

/**
 * Middleware to auto-update streaks after successful activity
 * Should be placed AFTER auth middleware but BEFORE route handler
 * Updates streak in background after response is sent
 */
export async function updateStreakOnActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Set up listener for when response finishes
  res.on('finish', async () => {
    // Only update streak if response was successful (2xx status)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const userId = req.user?.id
        
        if (userId) {
          // Update streak in background (don't block response)
          const result = await streakService.updateStreak(userId)
          
          if (result.data.milestoneReached) {
            // Log milestone achievement
            console.log(`[Streak] 🎉 User ${userId} reached ${result.data.milestoneReached} days!`)
            
            // TODO: Emit event for achievements system (Phase 2)
            // eventEmitter.emit('streak.milestone', {
            //   userId,
            //   milestone: result.data.milestoneReached
            // })
          }
          
          console.log(`[Streak] Updated for user ${userId}: ${result.data.currentStreak} days`)
        }
      } catch (error: any) {
        // Log error but don't fail the request
        console.error('[Streak Middleware] Failed to update streak:', {
          userId: req.user?.id,
          error: error.message
        })
      }
    }
  })
  
  // Continue to next middleware/handler
  next()
}
