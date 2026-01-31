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
    occurredAt: string; // ISO 8601
    correlationId?: string;
    userId: UserId;
  };
}

export const systemUserRegisteredSchema = z.object({
  eventName: z.literal('system.user.registered'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    userId: z.string().brand<'UserId'>(),
  }),
});

/**
 * Event: system.user.login
 * Emitted by: onboarding-service
 * Payload: IDs only (no email, no passwordHash, no tokens)
 */
export interface SystemUserLoginEvent {
  eventName: 'system.user.login';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    userId: UserId;
  };
}

export const systemUserLoginSchema = z.object({
  eventName: z.literal('system.user.login'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    userId: z.string().brand<'UserId'>(),
  }),
});

/**
 * Event: system.profile.updated
 * Emitted by: onboarding-service
 * Payload: IDs only (no firstName, no lastName, no targetLanguage)
 */
export interface SystemProfileUpdatedEvent {
  eventName: 'system.profile.updated';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    userId: UserId;
  };
}

export const systemProfileUpdatedSchema = z.object({
  eventName: z.literal('system.profile.updated'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    userId: z.string().brand<'UserId'>(),
  }),
});
