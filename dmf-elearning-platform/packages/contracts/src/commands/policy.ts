/**
 * Policy Commands (Lệnh Chính sách)
 * 
 * Commands for policy management (hard gate switches).
 * IDs-only payloads (Track 5 contract lock).
 */

import { z } from 'zod';

/**
 * Hard Gate Set Command
 */
export const policyHardGateSetSchema = z.object({
  commandId: z.string(),
  correlationId: z.string().optional(),
  scope: z.enum(['global', 'course', 'lesson', 'cohort']),
  scopeId: z.string().optional(),
  enabled: z.boolean(),
  reason: z.string().optional(),
});

export type PolicyHardGateSetCommand = z.infer<typeof policyHardGateSetSchema>;

/**
 * Hard Gate Bulk Set Command
 */
export const policyHardGateBulkSetSchema = z.object({
  commandId: z.string(),
  correlationId: z.string().optional(),
  policies: z.array(
    z.object({
      scope: z.enum(['global', 'course', 'lesson', 'cohort']),
      scopeId: z.string().optional(),
      enabled: z.boolean(),
      reason: z.string().optional(),
    })
  ),
});

export type PolicyHardGateBulkSetCommand = z.infer<typeof policyHardGateBulkSetSchema>;
