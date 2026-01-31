/**
 * Evidence Events (Sự kiện Bằng chứng)
 *
 * Events for evidence creation and validation.
 * IDs-only payloads (Track 5 contract lock).
 */
import { z } from 'zod';
/**
 * Evidence Created Event
 */
export declare const evidenceCreatedSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    evidenceId: z.ZodString;
    type: z.ZodEnum<["attendance", "speaking", "writing", "activity_submission", "teacher_validation", "mentor_validation"]>;
    userId: z.ZodString;
    lessonId: z.ZodOptional<z.ZodString>;
    courseId: z.ZodOptional<z.ZodString>;
    attemptId: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<["system", "teacher", "mentor"]>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    type: "speaking" | "writing" | "attendance" | "activity_submission" | "teacher_validation" | "mentor_validation";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    source: "teacher" | "mentor" | "system";
    lessonId?: string | undefined;
    attemptId?: string | undefined;
    courseId?: string | undefined;
}, {
    userId: string;
    type: "speaking" | "writing" | "attendance" | "activity_submission" | "teacher_validation" | "mentor_validation";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    source: "teacher" | "mentor" | "system";
    lessonId?: string | undefined;
    attemptId?: string | undefined;
    courseId?: string | undefined;
}>;
export type EvidenceCreatedEvent = z.infer<typeof evidenceCreatedSchema>;
/**
 * Evidence Validated Event (manual validation)
 */
export declare const evidenceValidatedSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    evidenceId: z.ZodString;
    validatorUserId: z.ZodString;
    validatorRole: z.ZodEnum<["teacher", "mentor"]>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    validatorUserId: string;
    validatorRole: "teacher" | "mentor";
}, {
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    validatorUserId: string;
    validatorRole: "teacher" | "mentor";
}>;
export type EvidenceValidatedEvent = z.infer<typeof evidenceValidatedSchema>;
/**
 * Evidence Revoked Event (rare, admin only)
 */
export declare const evidenceRevokedSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    evidenceId: z.ZodString;
    revokedBy: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    revokedBy: string;
    reason?: string | undefined;
}, {
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    revokedBy: string;
    reason?: string | undefined;
}>;
export type EvidenceRevokedEvent = z.infer<typeof evidenceRevokedSchema>;
/**
 * Evidence Soft Gate Triggered Event
 */
export declare const evidenceSoftGateTriggeredSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    userId: z.ZodString;
    lessonId: z.ZodOptional<z.ZodString>;
    courseId: z.ZodOptional<z.ZodString>;
    action: z.ZodEnum<["start", "complete", "unlock_next"]>;
    policyId: z.ZodString;
    missingEvidence: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        minCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: string;
        minCount: number;
    }, {
        type: string;
        minCount: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    userId: string;
    eventId: string;
    occurredAt: string;
    policyId: string;
    action: "start" | "complete" | "unlock_next";
    missingEvidence: {
        type: string;
        minCount: number;
    }[];
    lessonId?: string | undefined;
    courseId?: string | undefined;
}, {
    userId: string;
    eventId: string;
    occurredAt: string;
    policyId: string;
    action: "start" | "complete" | "unlock_next";
    missingEvidence: {
        type: string;
        minCount: number;
    }[];
    lessonId?: string | undefined;
    courseId?: string | undefined;
}>;
export type EvidenceSoftGateTriggeredEvent = z.infer<typeof evidenceSoftGateTriggeredSchema>;
/**
 * Evidence Hard Gate Blocked Event
 */
export declare const evidenceHardGateBlockedSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    userId: z.ZodString;
    lessonId: z.ZodOptional<z.ZodString>;
    courseId: z.ZodOptional<z.ZodString>;
    action: z.ZodEnum<["start", "complete", "unlock_next"]>;
    policyId: z.ZodString;
    missingEvidence: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        minCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: string;
        minCount: number;
    }, {
        type: string;
        minCount: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    userId: string;
    eventId: string;
    occurredAt: string;
    policyId: string;
    action: "start" | "complete" | "unlock_next";
    missingEvidence: {
        type: string;
        minCount: number;
    }[];
    lessonId?: string | undefined;
    courseId?: string | undefined;
}, {
    userId: string;
    eventId: string;
    occurredAt: string;
    policyId: string;
    action: "start" | "complete" | "unlock_next";
    missingEvidence: {
        type: string;
        minCount: number;
    }[];
    lessonId?: string | undefined;
    courseId?: string | undefined;
}>;
export type EvidenceHardGateBlockedEvent = z.infer<typeof evidenceHardGateBlockedSchema>;
/**
 * Evidence Policy Violation Detected Event
 */
export declare const evidencePolicyViolationDetectedSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    userId: z.ZodString;
    lessonId: z.ZodOptional<z.ZodString>;
    courseId: z.ZodOptional<z.ZodString>;
    action: z.ZodEnum<["start", "complete", "unlock_next"]>;
    policyId: z.ZodString;
    missingEvidence: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        minCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: string;
        minCount: number;
    }, {
        type: string;
        minCount: number;
    }>, "many">;
    enforcementLevel: z.ZodEnum<["observe", "soft_gate", "hard_gate"]>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    eventId: string;
    occurredAt: string;
    policyId: string;
    action: "start" | "complete" | "unlock_next";
    missingEvidence: {
        type: string;
        minCount: number;
    }[];
    enforcementLevel: "observe" | "soft_gate" | "hard_gate";
    lessonId?: string | undefined;
    courseId?: string | undefined;
}, {
    userId: string;
    eventId: string;
    occurredAt: string;
    policyId: string;
    action: "start" | "complete" | "unlock_next";
    missingEvidence: {
        type: string;
        minCount: number;
    }[];
    enforcementLevel: "observe" | "soft_gate" | "hard_gate";
    lessonId?: string | undefined;
    courseId?: string | undefined;
}>;
export type EvidencePolicyViolationDetectedEvent = z.infer<typeof evidencePolicyViolationDetectedSchema>;
/**
 * Evidence Review Approved Event
 */
export declare const evidenceReviewApprovedSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    reviewId: z.ZodString;
    evidenceId: z.ZodString;
    reviewerId: z.ZodString;
    reviewerRole: z.ZodEnum<["teacher", "mentor"]>;
    userId: z.ZodString;
    lessonId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    reviewId: string;
    reviewerId: string;
    reviewerRole: "teacher" | "mentor";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    lessonId?: string | undefined;
}, {
    userId: string;
    reviewId: string;
    reviewerId: string;
    reviewerRole: "teacher" | "mentor";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    lessonId?: string | undefined;
}>;
export type EvidenceReviewApprovedEvent = z.infer<typeof evidenceReviewApprovedSchema>;
/**
 * Evidence Review Rejected Event
 */
export declare const evidenceReviewRejectedSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    reviewId: z.ZodString;
    evidenceId: z.ZodString;
    reviewerId: z.ZodString;
    reviewerRole: z.ZodEnum<["teacher", "mentor"]>;
    userId: z.ZodString;
    lessonId: z.ZodOptional<z.ZodString>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    reviewId: string;
    reviewerId: string;
    reviewerRole: "teacher" | "mentor";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    lessonId?: string | undefined;
    comment?: string | undefined;
}, {
    userId: string;
    reviewId: string;
    reviewerId: string;
    reviewerRole: "teacher" | "mentor";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    lessonId?: string | undefined;
    comment?: string | undefined;
}>;
export type EvidenceReviewRejectedEvent = z.infer<typeof evidenceReviewRejectedSchema>;
/**
 * Evidence Review Expired Event
 */
export declare const evidenceReviewExpiredSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    reviewId: z.ZodString;
    evidenceId: z.ZodString;
    userId: z.ZodString;
    lessonId: z.ZodOptional<z.ZodString>;
    reviewerRole: z.ZodEnum<["teacher", "mentor"]>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    reviewId: string;
    reviewerRole: "teacher" | "mentor";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    lessonId?: string | undefined;
}, {
    userId: string;
    reviewId: string;
    reviewerRole: "teacher" | "mentor";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    lessonId?: string | undefined;
}>;
export type EvidenceReviewExpiredEvent = z.infer<typeof evidenceReviewExpiredSchema>;
/**
 * Evidence Review Escalated Event
 */
export declare const evidenceReviewEscalatedSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodString;
    reviewId: z.ZodString;
    evidenceId: z.ZodString;
    userId: z.ZodString;
    lessonId: z.ZodOptional<z.ZodString>;
    reviewerRole: z.ZodEnum<["teacher", "mentor"]>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    userId: string;
    reviewId: string;
    reviewerRole: "teacher" | "mentor";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    lessonId?: string | undefined;
}, {
    reason: string;
    userId: string;
    reviewId: string;
    reviewerRole: "teacher" | "mentor";
    eventId: string;
    occurredAt: string;
    evidenceId: string;
    lessonId?: string | undefined;
}>;
export type EvidenceReviewEscalatedEvent = z.infer<typeof evidenceReviewEscalatedSchema>;
//# sourceMappingURL=evidence.d.ts.map