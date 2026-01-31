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

export type OpsPolicyCreatedEvent = z.infer<typeof opsPolicyCreatedSchema>;

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

export type OpsPolicyActivatedEvent = z.infer<typeof opsPolicyActivatedSchema>;

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

export type OpsResourceRolledBackEvent = z.infer<typeof opsResourceRolledBackSchema>;

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

export type OpsRbacDiffViewedEvent = z.infer<typeof opsRbacDiffViewedSchema>;

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

export type PolicyHardGateUpdatedEvent = z.infer<typeof policyHardGateUpdatedSchema>;

/**
 * Ops Overload Detected Event
 */
const opsOverloadDetectedPayloadSchema = z.object({
  eventId: z.string(),
  occurredAt: z.string(),
  reasons: z.array(z.string()),
  roleOverloads: z.array(
    z.object({
      role: z.enum(['teacher', 'mentor']),
      overloaded: z.boolean(),
      pending: z.number(),
      limit: z.number(),
      breachRate: z.number(),
    })
  ),
});

export const opsOverloadDetectedSchema = z.object({
  eventName: z.literal('ops.overload.detected'),
  payload: opsOverloadDetectedPayloadSchema,
});

export type OpsOverloadDetectedEvent = z.infer<typeof opsOverloadDetectedSchema>;

/**
 * Ops Degrade Activated Event
 */
const opsDegradeActivatedPayloadSchema = z.object({
  eventId: z.string(),
  occurredAt: z.string(),
  activatedBy: z.string(),
  reason: z.string().optional(),
  autoActions: z.object({
    hardGateDisabledScopes: z.array(
      z.object({
        scope: z.enum(['course', 'lesson']),
        scopeId: z.string(),
      })
    ),
    reviewTypesDowngraded: z.array(z.string()),
  }),
});

export const opsDegradeActivatedSchema = z.object({
  eventName: z.literal('ops.degrade.activated'),
  payload: opsDegradeActivatedPayloadSchema,
});

export type OpsDegradeActivatedEvent = z.infer<typeof opsDegradeActivatedSchema>;

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

export type OpsDegradeDeactivatedEvent = z.infer<typeof opsDegradeDeactivatedSchema>;
