/**
 * Contract validation utilities for E2E runner
 */

import { commandRegistry } from '@dmf/contracts';
import type { z } from 'zod';

export interface ValidationResult {
  valid: boolean;
  errors?: z.ZodError;
}

/**
 * Validate response against expected schema
 * For now, we validate basic shape - full schemas can be added later
 */
export function validateResponse(
  responseData: unknown,
  expectedShape: {
    hasId?: boolean;
    hasUserId?: boolean;
    hasAttemptId?: boolean;
    hasSubmissionId?: boolean;
    schema?: z.ZodSchema;
  }
): ValidationResult {
  if (expectedShape.schema) {
    const result = expectedShape.schema.safeParse(responseData);
    if (!result.success) {
      return { valid: false, errors: result.error };
    }
    return { valid: true };
  }

  // Basic shape validation
  if (typeof responseData !== 'object' || responseData === null) {
    return {
      valid: false,
      errors: {
        issues: [{ path: [], message: 'Response must be an object' }],
      } as z.ZodError,
    };
  }

  const data = responseData as Record<string, unknown>;

  if (expectedShape.hasId && !('id' in data)) {
    return {
      valid: false,
      errors: {
        issues: [{ path: ['id'], message: 'Missing required field: id' }],
      } as z.ZodError,
    };
  }

  if (expectedShape.hasUserId && !('userId' in data)) {
    return {
      valid: false,
      errors: {
        issues: [{ path: ['userId'], message: 'Missing required field: userId' }],
      } as z.ZodError,
    };
  }

  if (expectedShape.hasAttemptId && !('attemptId' in data)) {
    return {
      valid: false,
      errors: {
        issues: [{ path: ['attemptId'], message: 'Missing required field: attemptId' }],
      } as z.ZodError,
    };
  }

  if (expectedShape.hasSubmissionId && !('submissionId' in data) && !('id' in data)) {
    return {
      valid: false,
      errors: {
        issues: [{ path: ['submissionId'], message: 'Missing required field: submissionId or id' }],
      } as z.ZodError,
    };
  }

  return { valid: true };
}

/**
 * Validate StandardError response
 */
export function validateStandardError(errorData: unknown): ValidationResult {
  if (typeof errorData !== 'object' || errorData === null) {
    return {
      valid: false,
      errors: {
        issues: [{ path: [], message: 'Error response must be an object' }],
      } as z.ZodError,
    };
  }

  const error = errorData as Record<string, unknown>;

  if (!('error' in error)) {
    return {
      valid: false,
      errors: {
        issues: [{ path: ['error'], message: 'Missing required field: error' }],
      } as z.ZodError,
    };
  }

  const errorObj = error.error as Record<string, unknown>;

  const requiredFields = ['code', 'category', 'message'];
  const missingFields = requiredFields.filter((field) => !(field in errorObj));

  if (missingFields.length > 0) {
    return {
      valid: false,
      errors: {
        issues: missingFields.map((field) => ({
          path: ['error', field],
          message: `Missing required field: ${field}`,
        })),
      } as z.ZodError,
    };
  }

  return { valid: true };
}

/**
 * Format Zod errors for display
 */
export function formatValidationErrors(errors: z.ZodError): string {
  return errors.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
      return `  - ${path}: ${issue.message}`;
    })
    .join('\n');
}
