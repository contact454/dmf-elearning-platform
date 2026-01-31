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
    userId: string;
    correlationId?: string;
}
export declare const mentoringFeedbackRequestSchema: z.ZodObject<{
    submissionId: z.ZodBranded<z.ZodString, "SubmissionId">;
    userId: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    submissionId: string & z.BRAND<"SubmissionId">;
    correlationId?: string | undefined;
}, {
    userId: string;
    submissionId: string;
    correlationId?: string | undefined;
}>;
/**
 * Command: mentoring.feedback.publish
 * Handled by: mentoring-service
 */
export interface MentoringFeedbackPublishCommand {
    feedbackRequestId: FeedbackRequestId;
    authorId: string;
    authorRole: FeedbackAuthorRole;
    text: string;
    rubricScores?: Record<string, number>;
    correlationId?: string;
}
export declare const mentoringFeedbackPublishSchema: z.ZodObject<{
    feedbackRequestId: z.ZodBranded<z.ZodString, "FeedbackRequestId">;
    authorId: z.ZodString;
    authorRole: z.ZodNativeEnum<typeof FeedbackAuthorRole>;
    text: z.ZodString;
    rubricScores: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    feedbackRequestId: string & z.BRAND<"FeedbackRequestId">;
    authorId: string;
    authorRole: FeedbackAuthorRole;
    text: string;
    correlationId?: string | undefined;
    rubricScores?: Record<string, number> | undefined;
}, {
    feedbackRequestId: string;
    authorId: string;
    authorRole: FeedbackAuthorRole;
    text: string;
    correlationId?: string | undefined;
    rubricScores?: Record<string, number> | undefined;
}>;
//# sourceMappingURL=mentoring.d.ts.map