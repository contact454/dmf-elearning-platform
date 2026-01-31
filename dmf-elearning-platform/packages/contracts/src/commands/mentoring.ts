/**
 * Mentoring domain commands (Lệnh miền Hướng dẫn)
 * 
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */

import { z } from 'zod';
import type { SubmissionId, FeedbackRequestId } from '@dmf/shared';
import { FeedbackAuthorRole } from '@dmf/shared';

/**
 * Command: mentoring.feedback.request
 * Handled by: mentoring-service
 */
export interface MentoringFeedbackRequestCommand {
  submissionId: SubmissionId;
  userId: string; // From auth context
  correlationId?: string;
}

export const mentoringFeedbackRequestSchema = z.object({
  submissionId: z.string().brand<'SubmissionId'>(),
  userId: z.string(),
  correlationId: z.string().optional(),
});

/**
 * Command: mentoring.feedback.publish
 * Handled by: mentoring-service
 */
export interface MentoringFeedbackPublishCommand {
  feedbackRequestId: FeedbackRequestId;
  authorId: string; // From auth context
  authorRole: FeedbackAuthorRole;
  text: string;
  rubricScores?: Record<string, number>; // Skill -> score mapping
  correlationId?: string;
}

export const mentoringFeedbackPublishSchema = z.object({
  feedbackRequestId: z.string().brand<'FeedbackRequestId'>(),
  authorId: z.string(),
  authorRole: z.nativeEnum(FeedbackAuthorRole),
  text: z.string().max(10000),
  rubricScores: z.record(z.number()).optional(),
  correlationId: z.string().optional(),
});
