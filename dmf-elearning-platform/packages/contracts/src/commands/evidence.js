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
    reviewerId: z.string().brand(),
    reviewerRole: z.enum(['teacher', 'mentor']),
});
/**
 * Evidence Review Approve Command
 */
export const evidenceReviewApproveSchema = z.object({
    commandId: z.string(),
    correlationId: z.string().optional(),
    reviewId: z.string(),
    reviewerId: z.string().brand(),
    comment: z.string().optional(),
});
/**
 * Evidence Review Reject Command
 */
export const evidenceReviewRejectSchema = z.object({
    commandId: z.string(),
    correlationId: z.string().optional(),
    reviewId: z.string(),
    reviewerId: z.string().brand(),
    comment: z.string().optional(),
});
//# sourceMappingURL=evidence.js.map