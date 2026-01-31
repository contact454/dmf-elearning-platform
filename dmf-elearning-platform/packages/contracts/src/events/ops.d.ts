/**
 * Ops Events (Sự kiện Vận hành)
 *
 * Events for ops/admin operations.
 * IDs-only payloads (Track 5 contract lock).
 */
import { z } from 'zod';
export declare const opsPolicyCreatedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"ops.policy.created">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        actorUserId: z.ZodString;
        policyId: z.ZodString;
        version: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        policyId: string;
        version: number;
    }, {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        policyId: string;
        version: number;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "ops.policy.created";
    payload: {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        policyId: string;
        version: number;
    };
}, {
    eventName: "ops.policy.created";
    payload: {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        policyId: string;
        version: number;
    };
}>;
export type OpsPolicyCreatedEvent = z.infer<typeof opsPolicyCreatedSchema>;
export declare const opsPolicyActivatedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"ops.policy.activated">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        actorUserId: z.ZodString;
        policyId: z.ZodString;
        version: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        policyId: string;
        version: number;
    }, {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        policyId: string;
        version: number;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "ops.policy.activated";
    payload: {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        policyId: string;
        version: number;
    };
}, {
    eventName: "ops.policy.activated";
    payload: {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        policyId: string;
        version: number;
    };
}>;
export type OpsPolicyActivatedEvent = z.infer<typeof opsPolicyActivatedSchema>;
export declare const opsResourceRolledBackSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"ops.resource.rolled_back">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        actorUserId: z.ZodString;
        resourceId: z.ZodString;
        targetVersion: z.ZodNumber;
        previousVersion: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        resourceId: string;
        targetVersion: number;
        previousVersion: number;
    }, {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        resourceId: string;
        targetVersion: number;
        previousVersion: number;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "ops.resource.rolled_back";
    payload: {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        resourceId: string;
        targetVersion: number;
        previousVersion: number;
    };
}, {
    eventName: "ops.resource.rolled_back";
    payload: {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        resourceId: string;
        targetVersion: number;
        previousVersion: number;
    };
}>;
export type OpsResourceRolledBackEvent = z.infer<typeof opsResourceRolledBackSchema>;
export declare const opsRbacDiffViewedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"ops.rbac.diff.viewed">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        actorUserId: z.ZodString;
        fromRole: z.ZodString;
        toRole: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        fromRole: string;
        toRole: string;
    }, {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        fromRole: string;
        toRole: string;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "ops.rbac.diff.viewed";
    payload: {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        fromRole: string;
        toRole: string;
    };
}, {
    eventName: "ops.rbac.diff.viewed";
    payload: {
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        fromRole: string;
        toRole: string;
    };
}>;
export type OpsRbacDiffViewedEvent = z.infer<typeof opsRbacDiffViewedSchema>;
export declare const policyHardGateUpdatedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"policy.hard_gate.updated">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        actorUserId: z.ZodString;
        scope: z.ZodEnum<["global", "course", "lesson", "cohort"]>;
        scopeId: z.ZodOptional<z.ZodString>;
        enabled: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        scope: "global" | "course" | "lesson" | "cohort";
        enabled: boolean;
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        reason?: string | undefined;
        scopeId?: string | undefined;
    }, {
        scope: "global" | "course" | "lesson" | "cohort";
        enabled: boolean;
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        reason?: string | undefined;
        scopeId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "policy.hard_gate.updated";
    payload: {
        scope: "global" | "course" | "lesson" | "cohort";
        enabled: boolean;
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        reason?: string | undefined;
        scopeId?: string | undefined;
    };
}, {
    eventName: "policy.hard_gate.updated";
    payload: {
        scope: "global" | "course" | "lesson" | "cohort";
        enabled: boolean;
        eventId: string;
        occurredAt: string;
        actorUserId: string;
        reason?: string | undefined;
        scopeId?: string | undefined;
    };
}>;
export type PolicyHardGateUpdatedEvent = z.infer<typeof policyHardGateUpdatedSchema>;
export declare const opsOverloadDetectedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"ops.overload.detected">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        reasons: z.ZodArray<z.ZodString, "many">;
        roleOverloads: z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<["teacher", "mentor"]>;
            overloaded: z.ZodBoolean;
            pending: z.ZodNumber;
            limit: z.ZodNumber;
            breachRate: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            pending: number;
            role: "teacher" | "mentor";
            overloaded: boolean;
            limit: number;
            breachRate: number;
        }, {
            pending: number;
            role: "teacher" | "mentor";
            overloaded: boolean;
            limit: number;
            breachRate: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        eventId: string;
        occurredAt: string;
        reasons: string[];
        roleOverloads: {
            pending: number;
            role: "teacher" | "mentor";
            overloaded: boolean;
            limit: number;
            breachRate: number;
        }[];
    }, {
        eventId: string;
        occurredAt: string;
        reasons: string[];
        roleOverloads: {
            pending: number;
            role: "teacher" | "mentor";
            overloaded: boolean;
            limit: number;
            breachRate: number;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "ops.overload.detected";
    payload: {
        eventId: string;
        occurredAt: string;
        reasons: string[];
        roleOverloads: {
            pending: number;
            role: "teacher" | "mentor";
            overloaded: boolean;
            limit: number;
            breachRate: number;
        }[];
    };
}, {
    eventName: "ops.overload.detected";
    payload: {
        eventId: string;
        occurredAt: string;
        reasons: string[];
        roleOverloads: {
            pending: number;
            role: "teacher" | "mentor";
            overloaded: boolean;
            limit: number;
            breachRate: number;
        }[];
    };
}>;
export type OpsOverloadDetectedEvent = z.infer<typeof opsOverloadDetectedSchema>;
export declare const opsDegradeActivatedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"ops.degrade.activated">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        activatedBy: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
        autoActions: z.ZodObject<{
            hardGateDisabledScopes: z.ZodArray<z.ZodObject<{
                scope: z.ZodEnum<["course", "lesson"]>;
                scopeId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                scope: "course" | "lesson";
                scopeId: string;
            }, {
                scope: "course" | "lesson";
                scopeId: string;
            }>, "many">;
            reviewTypesDowngraded: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            hardGateDisabledScopes: {
                scope: "course" | "lesson";
                scopeId: string;
            }[];
            reviewTypesDowngraded: string[];
        }, {
            hardGateDisabledScopes: {
                scope: "course" | "lesson";
                scopeId: string;
            }[];
            reviewTypesDowngraded: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        eventId: string;
        occurredAt: string;
        activatedBy: string;
        autoActions: {
            hardGateDisabledScopes: {
                scope: "course" | "lesson";
                scopeId: string;
            }[];
            reviewTypesDowngraded: string[];
        };
        reason?: string | undefined;
    }, {
        eventId: string;
        occurredAt: string;
        activatedBy: string;
        autoActions: {
            hardGateDisabledScopes: {
                scope: "course" | "lesson";
                scopeId: string;
            }[];
            reviewTypesDowngraded: string[];
        };
        reason?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "ops.degrade.activated";
    payload: {
        eventId: string;
        occurredAt: string;
        activatedBy: string;
        autoActions: {
            hardGateDisabledScopes: {
                scope: "course" | "lesson";
                scopeId: string;
            }[];
            reviewTypesDowngraded: string[];
        };
        reason?: string | undefined;
    };
}, {
    eventName: "ops.degrade.activated";
    payload: {
        eventId: string;
        occurredAt: string;
        activatedBy: string;
        autoActions: {
            hardGateDisabledScopes: {
                scope: "course" | "lesson";
                scopeId: string;
            }[];
            reviewTypesDowngraded: string[];
        };
        reason?: string | undefined;
    };
}>;
export type OpsDegradeActivatedEvent = z.infer<typeof opsDegradeActivatedSchema>;
export declare const opsDegradeDeactivatedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"ops.degrade.deactivated">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        deactivatedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        eventId: string;
        occurredAt: string;
        deactivatedBy: string;
    }, {
        eventId: string;
        occurredAt: string;
        deactivatedBy: string;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "ops.degrade.deactivated";
    payload: {
        eventId: string;
        occurredAt: string;
        deactivatedBy: string;
    };
}, {
    eventName: "ops.degrade.deactivated";
    payload: {
        eventId: string;
        occurredAt: string;
        deactivatedBy: string;
    };
}>;
export type OpsDegradeDeactivatedEvent = z.infer<typeof opsDegradeDeactivatedSchema>;
//# sourceMappingURL=ops.d.ts.map