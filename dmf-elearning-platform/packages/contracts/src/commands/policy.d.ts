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
export declare const policyHardGateSetSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
    scope: z.ZodEnum<["global", "course", "lesson", "cohort"]>;
    scopeId: z.ZodOptional<z.ZodString>;
    enabled: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    scope: "global" | "course" | "lesson" | "cohort";
    enabled: boolean;
    reason?: string | undefined;
    correlationId?: string | undefined;
    scopeId?: string | undefined;
}, {
    commandId: string;
    scope: "global" | "course" | "lesson" | "cohort";
    enabled: boolean;
    reason?: string | undefined;
    correlationId?: string | undefined;
    scopeId?: string | undefined;
}>;
export type PolicyHardGateSetCommand = z.infer<typeof policyHardGateSetSchema>;
/**
 * Hard Gate Bulk Set Command
 */
export declare const policyHardGateBulkSetSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
    policies: z.ZodArray<z.ZodObject<{
        scope: z.ZodEnum<["global", "course", "lesson", "cohort"]>;
        scopeId: z.ZodOptional<z.ZodString>;
        enabled: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        scope: "global" | "course" | "lesson" | "cohort";
        enabled: boolean;
        reason?: string | undefined;
        scopeId?: string | undefined;
    }, {
        scope: "global" | "course" | "lesson" | "cohort";
        enabled: boolean;
        reason?: string | undefined;
        scopeId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    policies: {
        scope: "global" | "course" | "lesson" | "cohort";
        enabled: boolean;
        reason?: string | undefined;
        scopeId?: string | undefined;
    }[];
    correlationId?: string | undefined;
}, {
    commandId: string;
    policies: {
        scope: "global" | "course" | "lesson" | "cohort";
        enabled: boolean;
        reason?: string | undefined;
        scopeId?: string | undefined;
    }[];
    correlationId?: string | undefined;
}>;
export type PolicyHardGateBulkSetCommand = z.infer<typeof policyHardGateBulkSetSchema>;
//# sourceMappingURL=policy.d.ts.map