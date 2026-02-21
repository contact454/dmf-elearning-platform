/**
 * Zod Validation Hooks for Fastify (Hook Xác thực Zod cho Fastify)
 *
 * Provides preValidation hooks that validate request body, query, and params
 * using Zod schemas. Returns standardized error responses on validation failure.
 *
 * Usage in Fastify routes:
 *   import { zodValidateBody, zodValidateQuery, zodValidateParams } from '@dmf/shared/http/validation';
 *   app.post('/api/foo', { preValidation: [zodValidateBody(mySchema)] }, handler);
 */

type ZodSchema = {
  parse(data: unknown): unknown;
};

type ZodError = {
  errors: Array<{
    path: (string | number)[];
    message: string;
  }>;
};

function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as any).errors)
  );
}

// Fastify types — services that use this will have fastify installed
type FastifyRequest = any;
type FastifyReply = any;

function buildValidationErrorResponse(location: string, error: ZodError) {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: `Invalid ${location}`,
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    },
  };
}

/**
 * Fastify preValidation hook — validate request body with a Zod schema
 */
export function zodValidateBody(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      if (isZodError(error)) {
        return reply.code(400).send(buildValidationErrorResponse('request body', error));
      }
      throw error;
    }
  };
}

/**
 * Fastify preValidation hook — validate query parameters with a Zod schema
 */
export function zodValidateQuery(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.query = schema.parse(request.query);
    } catch (error) {
      if (isZodError(error)) {
        return reply.code(400).send(buildValidationErrorResponse('query parameters', error));
      }
      throw error;
    }
  };
}

/**
 * Fastify preValidation hook — validate URL parameters with a Zod schema
 */
export function zodValidateParams(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.params = schema.parse(request.params);
    } catch (error) {
      if (isZodError(error)) {
        return reply.code(400).send(buildValidationErrorResponse('URL parameters', error));
      }
      throw error;
    }
  };
}

/**
 * Sanitize strings by removing angle brackets (basic XSS prevention) and trimming
 */
function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '').trim();
}

function sanitizeValue(obj: unknown): unknown {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeValue);
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeValue(value);
    }
    return sanitized;
  }
  return obj;
}

/**
 * Fastify onRequest hook — sanitize body, query, and params
 */
export function sanitizeInputHook() {
  return async (request: FastifyRequest) => {
    if (request.body) request.body = sanitizeValue(request.body);
    if (request.query) request.query = sanitizeValue(request.query);
    if (request.params) request.params = sanitizeValue(request.params);
  };
}
