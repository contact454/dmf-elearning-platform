/**
 * IDs-only assertion helper (Trợ giúp Khẳng định Chỉ ID)
 * 
 * Helper to assert event payloads contain only IDs + timestamps.
 */

import type { ZodSchema } from 'zod';

/**
 * Allowed keys in event payloads (Các khóa được phép trong tải trọng sự kiện)
 */
const ALLOWED_PAYLOAD_KEYS = new Set([
  'eventId',
  'occurredAt',
  'correlationId',
  // ID fields
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
]);

/**
 * Forbidden keys (Các khóa bị cấm)
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
 * @param eventName - Event name
 * @param schema - Event Zod schema
 * @param allowedKeysAllowlist - Optional allowlist of additional allowed keys
 * @throws Error if schema violates IDs-only policy
 */
export function assertIdsOnly(
  eventName: string,
  schema: ZodSchema,
  allowedKeysAllowlist?: Set<string>
): void {
  const allowedKeys = allowedKeysAllowlist
    ? new Set([...ALLOWED_PAYLOAD_KEYS, ...allowedKeysAllowlist])
    : ALLOWED_PAYLOAD_KEYS;

  // Extract payload schema from event schema
  const shape = (schema as any)._def?.shape();
  if (!shape || !shape.payload) {
    throw new Error(`Event schema '${eventName}' does not have expected structure`);
  }

  const payloadSchema = shape.payload;
  const payloadShape = payloadSchema._def?.shape();
  if (!payloadShape) {
    throw new Error(`Event payload schema '${eventName}' does not have shape`);
  }

  const payloadKeys = Object.keys(payloadShape);

  // Check for forbidden keys
  for (const key of payloadKeys) {
    if (FORBIDDEN_KEYS.includes(key)) {
      throw new Error(
        `Event '${eventName}' contains forbidden key '${key}' in payload. Events must be IDs-only per STEP 5C.`
      );
    }
  }

  // Check that all keys are allowed
  for (const key of payloadKeys) {
    if (!allowedKeys.has(key)) {
      // Allow if it looks like an ID (ends with 'Id')
      if (!key.endsWith('Id') && key !== 'eventId' && key !== 'occurredAt' && key !== 'correlationId') {
        throw new Error(
          `Event '${eventName}' contains key '${key}' which is not allowed. Only IDs, eventId, occurredAt, and correlationId are allowed.`
        );
      }
    }
  }
}
