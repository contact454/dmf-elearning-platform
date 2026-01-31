/**
 * Evidence Commands (Lệnh Bằng chứng)
 * 
 * Commands for evidence review workflow.
 * IDs-only payloads (Track 5 contract lock).
 */

import { z } from 'zod';

/**
 * Evidence Review Claim Command
 */
export const evidenceReviewClaimSchema = z.object({
  commandId: z.string(),
  correlationId: z.string().optional(),
  reviewId: z.string(),
  reviewerId: z.string().brand<'UserId'>(),
  reviewerRole: z.enum(['teacher', 'mentor']),
});

export type EvidenceReviewClaimCommand = z.infer<typeof evidenceReviewClaimSchema>;

/**
 * Evidence Review Approve Command
 */
export const evidenceReviewApproveSchema = z.object({
  commandId: z.string(),
  correlationId: z.string().optional(),
  reviewId: z.string(),
  reviewerId: z.string().brand<'UserId'>(),
  comment: z.string().optional(),
});

export type EvidenceReviewApproveCommand = z.infer<typeof evidenceReviewApproveSchema>;

/**
 * Evidence Review Reject Command
 */
export const evidenceReviewRejectSchema = z.object({
  commandId: z.string(),
  correlationId: z.string().optional(),
  reviewId: z.string(),
  reviewerId: z.string().brand<'UserId'>(),
  comment: z.string().optional(),
});

export type EvidenceReviewRejectCommand = z.infer<typeof evidenceReviewRejectSchema>;
