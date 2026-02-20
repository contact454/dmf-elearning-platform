import { PrismaClient } from '@prisma/client'
import { calculateNextReview, type QualityScore } from '../lib/srs-algorithm'
import { z } from 'zod'

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

const userIdSchema = z.string().min(6).max(128).regex(/^[A-Za-z0-9:_-]+$/)

/**
 * Get words due for review for a user
 * Returns max 20 words sorted by next_review ASC (oldest first)
 */
export async function getReviewQueue(userId: string) {
  try {
    // Validate userId
    userIdSchema.parse(userId)
    
    const now = new Date()
    
    const words = await prisma.userWordProgress.findMany({
      where: {
        userId,
        nextReview: {
          lte: now // Due now or overdue
        }
      },
      include: {
        word: {
          select: {
            id: true,
            word: true,
            meaning_vi: true,
            level: true,
            pos: true,
            artikel: true,
            plural: true,
            example_de: true,
            example_vi: true,
            audioUrl: true,
            phoneticIpa: true
          }
        }
      },
      orderBy: {
        nextReview: 'asc' // Oldest first
      },
      take: 20 // Hard limit
    })
    
    return {
      success: true,
      data: {
        words,
        count: words.length,
        hasMore: words.length === 20 // Might have more
      }
    }
  } catch (error: any) {
    console.error('[reviewService] getReviewQueue failed:', {
      userId,
      error: error.message,
      stack: error.stack
    })
    
    throw new Error('Failed to fetch review queue')
  }
}

/**
 * Submit a review result and update progress
 */
export async function submitReview(
  userId: string,
  wordId: string,
  quality: QualityScore
) {
  try {
    // Validate inputs
    const schema = z.object({
      userId: userIdSchema,
      wordId: z.string().cuid(),
      quality: z.number().int().min(0).max(5)
    })
    
    schema.parse({ userId, wordId, quality })
    
    // Get current progress
    const progress = await prisma.userWordProgress.findUnique({
      where: {
        user_word_unique: {
          userId,
          wordId
        }
      }
    })
    
    if (!progress) {
      throw new Error('Progress not found')
    }
    
    // Calculate next review using SM-2 algorithm
    const nextReview = calculateNextReview(
      {
        easeFactor: progress.easeFactor,
        intervalDays: progress.intervalDays,
        repetitions: progress.repetitions,
        lastReview: new Date()
      },
      quality
    )
    
    // Update progress and persist attempt in a single transaction
    const [updated] = await prisma.$transaction([
      prisma.userWordProgress.update({
        where: {
          user_word_unique: {
            userId,
            wordId
          }
        },
        data: {
          easeFactor: nextReview.easeFactor,
          intervalDays: nextReview.intervalDays,
          repetitions: nextReview.repetitions,
          nextReview: nextReview.nextReviewDate,
          status: nextReview.status,
          lastResult: quality >= 3, // true if correct
          totalReviews: {
            increment: 1
          },
          correctReviews: quality >= 3 ? {
            increment: 1
          } : undefined
        },
        include: {
          word: {
            select: {
              word: true,
              meaning_vi: true
            }
          }
        }
      }),
      prisma.vocabularyReviewAttempt.create({
        data: {
          userId,
          wordId,
          quality,
          source: 'review'
        }
      })
    ])
    
    return {
      success: true,
      data: {
        progress: updated,
        nextReview: nextReview.nextReviewDate,
        status: nextReview.status,
        intervalDays: nextReview.intervalDays
      }
    }
  } catch (error: any) {
    console.error('[reviewService] submitReview failed:', {
      userId,
      wordId,
      quality,
      error: error.message,
      stack: error.stack
    })
    
    throw new Error('Failed to submit review')
  }
}

/**
 * Get progress statistics for a user
 */
export async function getProgressStats(userId: string) {
  try {
    // Validate userId
    userIdSchema.parse(userId)
    
    // Get all progress records
    const allProgress = await prisma.userWordProgress.findMany({
      where: {
        userId
      },
      select: {
        status: true,
        totalReviews: true,
        correctReviews: true
      }
    })
    
    // Aggregate by status
    const stats = {
      NEW: 0,
      LEARNING: 0,
      REVIEW: 0,
      MASTERED: 0
    }
    
    let totalReviews = 0
    let correctReviews = 0
    
    for (const progress of allProgress) {
      stats[progress.status] = (stats[progress.status] || 0) + 1
      totalReviews += progress.totalReviews
      correctReviews += progress.correctReviews
    }
    
    // Calculate accuracy
    const accuracy = totalReviews > 0 
      ? Math.round((correctReviews / totalReviews) * 100) 
      : 0
    
    // Count due today
    const now = new Date()
    const dueCount = await prisma.userWordProgress.count({
      where: {
        userId,
        nextReview: {
          lte: now
        }
      }
    })
    
    return {
      success: true,
      data: {
        total: allProgress.length,
        byStatus: stats,
        dueToday: dueCount,
        totalReviews,
        correctReviews,
        accuracy
      }
    }
  } catch (error: any) {
    console.error('[reviewService] getProgressStats failed:', {
      userId,
      error: error.message,
      stack: error.stack
    })
    
    throw new Error('Failed to fetch progress stats')
  }
}
