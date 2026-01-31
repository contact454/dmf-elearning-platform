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
export declare const evidenceReviewClaimSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
    reviewId: z.ZodString;
    reviewerId: z.ZodBranded<z.ZodString, "UserId">;
    reviewerRole: z.ZodEnum<["teacher", "mentor"]>;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    reviewId: string;
    reviewerId: string & z.BRAND<"UserId">;
    reviewerRole: "teacher" | "mentor";
    correlationId?: string | undefined;
}, {
    commandId: string;
    reviewId: string;
    reviewerId: string;
    reviewerRole: "teacher" | "mentor";
    correlationId?: string | undefined;
}>;
export type EvidenceReviewClaimCommand = z.infer<typeof evidenceReviewClaimSchema>;
/**
 * Evidence Review Approve Command
 */
export declare const evidenceReviewApproveSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
    reviewId: z.ZodString;
    reviewerId: z.ZodBranded<z.ZodString, "UserId">;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    reviewId: string;
    reviewerId: string & z.BRAND<"UserId">;
    correlationId?: string | undefined;
    comment?: string | undefined;
}, {
    commandId: string;
    reviewId: string;
    reviewerId: string;
    correlationId?: string | undefined;
    comment?: string | undefined;
}>;
export type EvidenceReviewApproveCommand = z.infer<typeof evidenceReviewApproveSchema>;
/**
 * Evidence Review Reject Command
 */
export declare const evidenceReviewRejectSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
    reviewId: z.ZodString;
    reviewerId: z.ZodBranded<z.ZodString, "UserId">;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    reviewId: string;
    reviewerId: string & z.BRAND<"UserId">;
    correlationId?: string | undefined;
    comment?: string | undefined;
}, {
    commandId: string;
    reviewId: string;
    reviewerId: string;
    correlationId?: string | undefined;
    comment?: string | undefined;
}>;
export type EvidenceReviewRejectCommand = z.infer<typeof evidenceReviewRejectSchema>;
//# sourceMappingURL=evidence.d.ts.map