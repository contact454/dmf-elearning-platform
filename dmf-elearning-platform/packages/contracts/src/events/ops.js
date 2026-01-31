/**
 * Ops Events (Sự kiện Vận hành)
 *
 * Events for ops/admin operations.
 * IDs-only payloads (Track 5 contract lock).
 */
import { z } from 'zod';
/**
 * Ops Policy Created Event
 */
const opsPolicyCreatedPayloadSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    actorUserId: z.string(),
    policyId: z.string(),
    version: z.number(),
});
export const opsPolicyCreatedSchema = z.object({
    eventName: z.literal('ops.policy.created'),
    payload: opsPolicyCreatedPayloadSchema,
});
/**
 * Ops Policy Activated Event
 */
const opsPolicyActivatedPayloadSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    actorUserId: z.string(),
    policyId: z.string(),
    version: z.number(),
});
export const opsPolicyActivatedSchema = z.object({
    eventName: z.literal('ops.policy.activated'),
    payload: opsPolicyActivatedPayloadSchema,
});
/**
 * Ops Resource Rolled Back Event
 */
const opsResourceRolledBackPayloadSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    actorUserId: z.string(),
    resourceId: z.string(),
    targetVersion: z.number(),
    previousVersion: z.number(),
});
export const opsResourceRolledBackSchema = z.object({
    eventName: z.literal('ops.resource.rolled_back'),
    payload: opsResourceRolledBackPayloadSchema,
});
/**
 * Ops RBAC Diff Viewed Event (optional, low priority)
 */
const opsRbacDiffViewedPayloadSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    actorUserId: z.string(),
    fromRole: z.string(),
    toRole: z.string(),
});
export const opsRbacDiffViewedSchema = z.object({
    eventName: z.literal('ops.rbac.diff.viewed'),
    payload: opsRbacDiffViewedPayloadSchema,
});
/**
 * Hard Gate Policy Updated Event
 */
const policyHardGateUpdatedPayloadSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    actorUserId: z.string(),
    scope: z.enum(['global', 'course', 'lesson', 'cohort']),
    scopeId: z.string().optional(),
    enabled: z.boolean(),
    reason: z.string().optional(),
});
export const policyHardGateUpdatedSchema = z.object({
    eventName: z.literal('policy.hard_gate.updated'),
    payload: policyHardGateUpdatedPayloadSchema,
});
/**
 * Ops Overload Detected Event
 */
const opsOverloadDetectedPayloadSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    reasons: z.array(z.string()),
    roleOverloads: z.array(z.object({
        role: z.enum(['teacher', 'mentor']),
        overloaded: z.boolean(),
        pending: z.number(),
        limit: z.number(),
        breachRate: z.number(),
    })),
});
export const opsOverloadDetectedSchema = z.object({
    eventName: z.literal('ops.overload.detected'),
    payload: opsOverloadDetectedPayloadSchema,
});
/**
 * Ops Degrade Activated Event
 */
const opsDegradeActivatedPayloadSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    activatedBy: z.string(),
    reason: z.string().optional(),
    autoActions: z.object({
        hardGateDisabledScopes: z.array(z.object({
            scope: z.enum(['course', 'lesson']),
            scopeId: z.string(),
        })),
        reviewTypesDowngraded: z.array(z.string()),
    }),
});
export const opsDegradeActivatedSchema = z.object({
    eventName: z.literal('ops.degrade.activated'),
    payload: opsDegradeActivatedPayloadSchema,
});
/**
 * Ops Degrade Deactivated Event
 */
const opsDegradeDeactivatedPayloadSchema = z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    deactivatedBy: z.string(),
});
export const opsDegradeDeactivatedSchema = z.object({
    eventName: z.literal('ops.degrade.deactivated'),
    payload: opsDegradeDeactivatedPayloadSchema,
});
//# sourceMappingURL=ops.js.map