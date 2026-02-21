import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

const userIdSchema = z.string().min(6).max(128).regex(/^[A-Za-z0-9:_-]+$/)

/**
 * Check if two dates are the same day in a given timezone
 */
function isSameDay(date1: Date, date2: Date, timezone: string = 'UTC'): boolean {
  try {
    const d1 = new Date(date1.toLocaleString('en-US', { timeZone: timezone }))
    const d2 = new Date(date2.toLocaleString('en-US', { timeZone: timezone }))
    
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    console.warn('[streakService] Invalid timezone, using UTC:', timezone)
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    )
  }
}

/**
 * Check if date2 is the next day after date1 in a given timezone
 */
function isNextDay(date1: Date, date2: Date, timezone: string = 'UTC'): boolean {
  try {
    const d1 = new Date(date1.toLocaleString('en-US', { timeZone: timezone }))
    const d2 = new Date(date2.toLocaleString('en-US', { timeZone: timezone }))
    
    // Normalize to start of day
    d1.setHours(0, 0, 0, 0)
    d2.setHours(0, 0, 0, 0)
    
    // Calculate difference in days
    const diffMs = d2.getTime() - d1.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    
    return diffDays === 1
  } catch (error) {
    console.warn('[streakService] Invalid timezone in isNextDay, using UTC:', timezone)
    // Fallback to UTC
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    d1.setUTCHours(0, 0, 0, 0)
    d2.setUTCHours(0, 0, 0, 0)
    const diffMs = d2.getTime() - d1.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    return diffDays === 1
  }
}

/**
 * Update user's streak based on activity
 * Call this whenever user completes a review
 * 
 * Returns: {
 *   currentStreak: number
 *   longestStreak: number
 *   milestoneReached: number | null (7, 30, 100, 365 if hit)
 * }
 */
export async function updateStreak(userId: string) {
  try {
    // Validate userId
    userIdSchema.parse(userId)
    
    const now = new Date()
    
    // Get user with current streak data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        timezone: true
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    const timezone = user.timezone || 'UTC'
    let newStreak = user.currentStreak
    let milestoneReached: number | null = null
    
    // First activity ever
    if (!user.lastActivityDate) {
      newStreak = 1
    } 
    // Same day - no change to streak
    else if (isSameDay(user.lastActivityDate, now, timezone)) {
      // No change needed
      return {
        success: true,
        data: {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          milestoneReached: null,
          message: 'Already active today'
        }
      }
    }
    // Next day - increment streak
    else if (isNextDay(user.lastActivityDate, now, timezone)) {
      newStreak = user.currentStreak + 1
    }
    // Missed days - reset streak
    else {
      newStreak = 1
    }
    
    // Check for milestone
    const previousStreak = user.currentStreak
    const milestones = [7, 30, 100, 365]
    for (const milestone of milestones) {
      if (previousStreak < milestone && newStreak >= milestone) {
        milestoneReached = milestone
        break
      }
    }
    
    // Update longest streak if needed
    const newLongestStreak = Math.max(user.longestStreak, newStreak)
    
    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: now
      }
    })
    
    return {
      success: true,
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        milestoneReached,
        message: milestoneReached 
          ? `🎉 Milestone reached: ${milestoneReached} days!`
          : `Streak updated to ${newStreak} days`
      }
    }
  } catch (error: any) {
    console.error('[streakService] updateStreak failed:', {
      userId,
      error: error.message,
      stack: error.stack
    })
    
    throw new Error('Failed to update streak')
  }
}

/**
 * Check if a streak value hits a milestone
 * Returns the milestone if hit, null otherwise
 */
export function checkStreakMilestone(streak: number): number | null {
  const milestones = [7, 30, 100, 365]
  
  for (const milestone of milestones) {
    if (streak === milestone) {
      return milestone
    }
  }
  
  return null
}

/**
 * Get streak data for a user
 */
export async function getStreakData(userId: string) {
  try {
    // Validate userId
    userIdSchema.parse(userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        timezone: true
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    const now = new Date()
    const timezone = user.timezone || 'UTC'
    
    // Check if active today
    const isActiveToday = user.lastActivityDate 
      ? isSameDay(user.lastActivityDate, now, timezone)
      : false
    
    // Calculate next milestone
    const milestones = [7, 30, 100, 365]
    const nextMilestone = milestones.find(m => m > user.currentStreak) || null
    const daysUntilMilestone = nextMilestone ? nextMilestone - user.currentStreak : null
    
    return {
      success: true,
      data: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        isActiveToday,
        nextMilestone,
        daysUntilMilestone,
        lastActivityDate: user.lastActivityDate
      }
    }
  } catch (error: any) {
    console.error('[streakService] getStreakData failed:', {
      userId,
      error: error.message,
      stack: error.stack
    })
    
    throw new Error('Failed to fetch streak data')
  }
}
