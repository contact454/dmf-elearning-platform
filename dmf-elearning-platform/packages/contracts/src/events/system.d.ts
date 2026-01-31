/**
 * System domain events (Sự kiện miền Hệ thống)
 *
 * From STEP 5C (event-contracts.md)
 * Frozen: Do not modify without architecture approval.
 *
 * IMPORTANT: Event payloads are IDs-only (no email, no passwordHash, no profile data).
 */
import { z } from 'zod';
import type { UserId } from '@dmf/shared';
/**
 * Event: system.user.registered
 * Emitted by: onboarding-service
 * Payload: IDs only (no email, no passwordHash)
 */
export interface SystemUserRegisteredEvent {
    eventName: 'system.user.registered';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        userId: UserId;
    };
}
export declare const systemUserRegisteredSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"system.user.registered">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        userId: z.ZodBranded<z.ZodString, "UserId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "system.user.registered";
    payload: {
        userId: string & z.BRAND<"UserId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "system.user.registered";
    payload: {
        userId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: system.user.login
 * Emitted by: onboarding-service
 * Payload: IDs only (no email, no passwordHash, no tokens)
 */
export interface SystemUserLoginEvent {
    eventName: 'system.user.login';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        userId: UserId;
    };
}
export declare const systemUserLoginSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"system.user.login">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        userId: z.ZodBranded<z.ZodString, "UserId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "system.user.login";
    payload: {
        userId: string & z.BRAND<"UserId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "system.user.login";
    payload: {
        userId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: system.profile.updated
 * Emitted by: onboarding-service
 * Payload: IDs only (no firstName, no lastName, no targetLanguage)
 */
export interface SystemProfileUpdatedEvent {
    eventName: 'system.profile.updated';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        userId: UserId;
    };
}
export declare const systemProfileUpdatedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"system.profile.updated">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        userId: z.ZodBranded<z.ZodString, "UserId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "system.profile.updated";
    payload: {
        userId: string & z.BRAND<"UserId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "system.profile.updated";
    payload: {
        userId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
//# sourceMappingURL=system.d.ts.map