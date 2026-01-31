/**
 * System domain events (Sự kiện miền Hệ thống)
 *
 * From STEP 5C (event-contracts.md)
 * Frozen: Do not modify without architecture approval.
 *
 * IMPORTANT: Event payloads are IDs-only (no email, no passwordHash, no profile data).
 */
import { z } from 'zod';
export const systemUserRegisteredSchema = z.object({
    eventName: z.literal('system.user.registered'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        userId: z.string().brand(),
    }),
});
export const systemUserLoginSchema = z.object({
    eventName: z.literal('system.user.login'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        userId: z.string().brand(),
    }),
});
export const systemProfileUpdatedSchema = z.object({
    eventName: z.literal('system.profile.updated'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        userId: z.string().brand(),
    }),
});
//# sourceMappingURL=system.js.map