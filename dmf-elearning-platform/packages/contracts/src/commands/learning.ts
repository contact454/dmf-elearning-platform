/**
 * Learning domain commands (Lệnh miền Học tập)
 * 
 * From STEP 4.2 (command-contracts.md)
 * 🔒 CONTRACT FROZEN — Track 5
 * 
 * Rules:
 * ❌ Do NOT change field names
 * ❌ Do NOT rename fields
 * ❌ Do NOT reorder payload fields
 * ✅ Only add optional fields if absolutely necessary (with architecture approval)
 */

import { z } from 'zod';
import type { UserId, LessonId, AttemptId, ActivityId } from '@dmf/shared';

/**
 * Command: learning.lesson.start
 * Handled by: practice-service
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonStartCommand {
  userId: UserId;
  lessonId: LessonId;
  correlationId?: string;
}

export const learningLessonStartSchema = z.object({
  userId: z.string().brand<'UserId'>(),
  lessonId: z.string().brand<'LessonId'>(),
  correlationId: z.string().optional(),
});

/**
 * Command: learning.lesson.complete
 * Handled by: practice-service
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonCompleteCommand {
  attemptId: AttemptId;
  status: 'completed' | 'abandoned';
  correlationId?: string;
}

export const learningLessonCompleteSchema = z.object({
  attemptId: z.string().brand<'AttemptId'>(),
  status: z.enum(['completed', 'abandoned']),
  correlationId: z.string().optional(),
});

/**
 * Command: learning.lesson.abandon
 * Handled by: practice-service
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonAbandonCommand {
  attemptId: AttemptId;
}

export const learningLessonAbandonSchema = z.object({
  attemptId: z.string().brand<'AttemptId'>(),
});

/**
 * Command: learning.activity.submit
 * Handled by: practice-service
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningActivitySubmitCommand {
  attemptId: AttemptId;
  activityId: ActivityId;
  type: 'quiz' | 'listening' | 'speaking' | 'writing';
  answer?: string; // For quiz/listening/writing
  audioUrl?: string; // For speaking (uploaded separately)
  correlationId?: string;
}

export const learningActivitySubmitSchema = z.object({
  attemptId: z.string().brand<'AttemptId'>(),
  activityId: z.string().brand<'ActivityId'>(),
  type: z.enum(['quiz', 'listening', 'speaking', 'writing']),
  answer: z.string().optional(),
  audioUrl: z.string().url().optional(),
  correlationId: z.string().optional(),
});
