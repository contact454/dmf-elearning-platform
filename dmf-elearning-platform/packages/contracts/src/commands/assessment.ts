/**
 * Assessment domain commands (Lệnh miền Đánh giá)
 * 
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */

import { z } from 'zod';
import type { UserId, AssessmentId, QuizId } from '@dmf/shared';

/**
 * Command: assessment.quiz.start
 * Handled by: assessment-service
 */
export interface AssessmentQuizStartCommand {
  userId: UserId;
  quizId: QuizId;
  correlationId?: string;
}

export const assessmentQuizStartSchema = z.object({
  userId: z.string().brand<'UserId'>(),
  quizId: z.string().brand<'QuizId'>(),
  correlationId: z.string().optional(),
});

/**
 * Command: assessment.quiz.submit
 * Handled by: assessment-service
 */
export interface AssessmentQuizSubmitCommand {
  assessmentId: AssessmentId;
  answers: Record<string, unknown>; // Quiz-specific answer format
  correlationId?: string;
}

export const assessmentQuizSubmitSchema = z.object({
  assessmentId: z.string().brand<'AssessmentId'>(),
  answers: z.record(z.unknown()),
  correlationId: z.string().optional(),
});

/**
 * Command: assessment.placement.take
 * Handled by: assessment-service
 */
export interface AssessmentPlacementTakeCommand {
  userId: UserId;
  correlationId?: string;
}

export const assessmentPlacementTakeSchema = z.object({
  userId: z.string().brand<'UserId'>(),
  correlationId: z.string().optional(),
});
