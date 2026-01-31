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
export const evidenceCreatedSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    evidenceId: z.string(),
    type: z.enum([
        'attendance',
        'speaking',
        'writing',
        'activity_submission',
        'teacher_validation',
        'mentor_validation',
    ]),
    userId: z.string(),
    lessonId: z.string().optional(),
    courseId: z.string().optional(),
    attemptId: z.string().optional(),
    source: z.enum(['system', 'teacher', 'mentor']),
});
/**
 * Evidence Validated Event (manual validation)
 */
export const evidenceValidatedSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    evidenceId: z.string(),
    validatorUserId: z.string(),
    validatorRole: z.enum(['teacher', 'mentor']),
});
/**
 * Evidence Revoked Event (rare, admin only)
 */
export const evidenceRevokedSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    evidenceId: z.string(),
    revokedBy: z.string(),
    reason: z.string().optional(),
});
/**
 * Evidence Soft Gate Triggered Event
 */
export const evidenceSoftGateTriggeredSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    userId: z.string(),
    lessonId: z.string().optional(),
    courseId: z.string().optional(),
    action: z.enum(['start', 'complete', 'unlock_next']),
    policyId: z.string(),
    missingEvidence: z.array(z.object({
        type: z.string(),
        minCount: z.number(),
    })),
});
/**
 * Evidence Hard Gate Blocked Event
 */
export const evidenceHardGateBlockedSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    userId: z.string(),
    lessonId: z.string().optional(),
    courseId: z.string().optional(),
    action: z.enum(['start', 'complete', 'unlock_next']),
    policyId: z.string(),
    missingEvidence: z.array(z.object({
        type: z.string(),
        minCount: z.number(),
    })),
});
/**
 * Evidence Policy Violation Detected Event
 */
export const evidencePolicyViolationDetectedSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    userId: z.string(),
    lessonId: z.string().optional(),
    courseId: z.string().optional(),
    action: z.enum(['start', 'complete', 'unlock_next']),
    policyId: z.string(),
    missingEvidence: z.array(z.object({
        type: z.string(),
        minCount: z.number(),
    })),
    enforcementLevel: z.enum(['observe', 'soft_gate', 'hard_gate']),
});
/**
 * Evidence Review Approved Event
 */
export const evidenceReviewApprovedSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    reviewId: z.string(),
    evidenceId: z.string(),
    reviewerId: z.string(),
    reviewerRole: z.enum(['teacher', 'mentor']),
    userId: z.string(),
    lessonId: z.string().optional(),
});
/**
 * Evidence Review Rejected Event
 */
export const evidenceReviewRejectedSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    reviewId: z.string(),
    evidenceId: z.string(),
    reviewerId: z.string(),
    reviewerRole: z.enum(['teacher', 'mentor']),
    userId: z.string(),
    lessonId: z.string().optional(),
    comment: z.string().optional(),
});
/**
 * Evidence Review Expired Event
 */
export const evidenceReviewExpiredSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    reviewId: z.string(),
    evidenceId: z.string(),
    userId: z.string(),
    lessonId: z.string().optional(),
    reviewerRole: z.enum(['teacher', 'mentor']),
});
/**
 * Evidence Review Escalated Event
 */
export const evidenceReviewEscalatedSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    reviewId: z.string(),
    evidenceId: z.string(),
    userId: z.string(),
    lessonId: z.string().optional(),
    reviewerRole: z.enum(['teacher', 'mentor']),
    reason: z.string(),
});
//# sourceMappingURL=evidence.js.map