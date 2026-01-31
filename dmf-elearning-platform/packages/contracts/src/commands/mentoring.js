/**
 * Mentoring domain commands (Lệnh miền Hướng dẫn)
 *
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */
import { z } from 'zod';
import { FeedbackAuthorRole } from '@dmf/shared';
export const mentoringFeedbackRequestSchema = z.object({
    submissionId: z.string().brand(),
    userId: z.string(),
    correlationId: z.string().optional(),
});
export const mentoringFeedbackPublishSchema = z.object({
    feedbackRequestId: z.string().brand(),
    authorId: z.string(),
    authorRole: z.nativeEnum(FeedbackAuthorRole),
    text: z.string().max(10000),
    rubricScores: z.record(z.number()).optional(),
    correlationId: z.string().optional(),
});
//# sourceMappingURL=mentoring.js.map