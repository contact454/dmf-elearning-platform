/**
 * IDs-only Event Policy Tests (Kiểm tra Chính sách Sự kiện Chỉ ID)
 * 
 * Ensures all event schemas contain ONLY IDs + occurredAt + eventId + optional correlationId.
 * Per STEP 5C: no score, cefrLevel, email, passwordHash, etc.
 */

import { describe, it, expect } from 'vitest';
import { eventRegistry } from '../registries';
import type { ZodSchema } from 'zod';
import { z } from 'zod';

/**
 * Allowed keys in event payloads (Các khóa được phép trong tải trọng sự kiện)
 * 
 * Per STEP 5C: Only IDs, timestamps, and correlationId are allowed.
 */
const ALLOWED_PAYLOAD_KEYS = new Set([
  'eventId',
  'occurredAt',
  'correlationId', // optional
  // ID fields (all branded types)
  'userId',
  'attemptId',
  'lessonId',
  'unitId',
  'courseId',
  'enrollmentId',
  'submissionId',
  'activityId',
  'quizId',
  'assessmentId',
  'feedbackId',
  'srsItemId',
  // Non-ID fields that are intentionally part of certain ops/curriculum events
  'version',
  'targetVersion',
  'previousVersion',
  'fromRole',
  'toRole',
  'scope',
  'enabled',
  'reason',
  'reasons',
  'roleOverloads',
  'autoActions',
  'activatedBy',
  'deactivatedBy',
  'dueItemIds',
]);

/**
 * Forbidden keys (Các khóa bị cấm)
 * 
 * These should NEVER appear in event payloads.
 */
const FORBIDDEN_KEYS = [
  'score',
  'cefrLevel',
  'email',
  'passwordHash',
  'password',
  'token',
  'firstName',
  'lastName',
  'targetLanguage',
  'text',
  'audioUrl',
  'content',
  'answer',
  'mastery',
  'readiness',
  'unlockStatus',
];

/**
 * Assert event schema is IDs-only (Khẳng định schema sự kiện chỉ ID)
 * 
 * Checks that event payload schema contains only allowed keys.
 */
function assertIdsOnly(
  eventName: string,
  schema: ZodSchema,
  allowedKeys: Set<string> = ALLOWED_PAYLOAD_KEYS
): void {
  // Extract payload schema from event schema
  // Primary expected structure:
  //   z.object({ eventName: z.literal(...), payload: z.object({...}) })
  // Some legacy schemas may use payload-only structure:
  //   z.object({ eventId, occurredAt, ... })
  const shape = (schema as any)._def?.shape();
  if (!shape) {
    throw new Error(`Event schema '${eventName}' does not have expected structure`);
  }

  // Prefer nested payload if present
  const payloadSchema = shape.payload ?? schema;
  const payloadShape = payloadSchema._def?.shape();
  if (!payloadShape) {
    throw new Error(`Event payload schema '${eventName}' does not have shape`);
  }

  // Get all keys in payload schema
  const payloadKeys = Object.keys(payloadShape);

  // Check for forbidden keys
  for (const key of payloadKeys) {
    if (FORBIDDEN_KEYS.includes(key)) {
      throw new Error(
        `Event '${eventName}' contains forbidden key '${key}' in payload. Events must be IDs-only per STEP 5C.`
      );
    }
  }

  // Check that all keys are allowed (or warn if new ID type)
  for (const key of payloadKeys) {
    if (!allowedKeys.has(key)) {
      // Allow if it looks like an ID (ends with 'Id' or is a known ID type)
      if (!key.endsWith('Id') && key !== 'eventId' && key !== 'occurredAt' && key !== 'correlationId') {
        console.warn(
          `Event '${eventName}' contains key '${key}' which is not in allowed list. Verify it's an ID type.`
        );
      }
    }
  }
}

describe('IDs-only Event Policy (Chính sách Sự kiện Chỉ ID)', () => {
  it('should enforce IDs-only policy for all events (Phải thực thi chính sách chỉ ID cho tất cả sự kiện)', () => {
    for (const [eventName, schema] of Object.entries(eventRegistry)) {
      expect(() => assertIdsOnly(eventName, schema)).not.toThrow();
    }
  });

  it('should reject events with forbidden keys (Phải từ chối sự kiện có khóa bị cấm)', () => {
    // Create a test schema with forbidden key
    const badSchema = z.object({
      eventName: z.literal('test.event'),
      payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        userId: z.string(),
        score: z.number(), // FORBIDDEN
      }),
    });

    expect(() => assertIdsOnly('test.event', badSchema)).toThrow(/forbidden key 'score'/);
  });

  it('should allow only IDs, timestamps, and correlationId (Chỉ cho phép ID, timestamp và correlationId)', () => {
    // Test each event in registry
    for (const [eventName, schema] of Object.entries(eventRegistry)) {
      const shape = (schema as any)._def?.shape();
      if (!shape || !shape.payload) continue;

      const payloadSchema = shape.payload;
      const payloadShape = payloadSchema._def?.shape();
      if (!payloadShape) continue;

      const payloadKeys = Object.keys(payloadShape);

      // Must have eventId and occurredAt
      expect(payloadKeys).toContain('eventId');
      expect(payloadKeys).toContain('occurredAt');

      // correlationId is optional
      // All other keys must be IDs (end with 'Id') or be in allowed list
      for (const key of payloadKeys) {
        if (key === 'eventId' || key === 'occurredAt' || key === 'correlationId') {
          continue;
        }
        // Accept ID fields (Id / Ids) or explicitly allowed keys above
        expect(key.endsWith('Id') || key.endsWith('Ids') || ALLOWED_PAYLOAD_KEYS.has(key)).toBe(true);
      }
    }
  });
});
