/**
 * HTTP Middlewares (Middleware HTTP)
 * 
 * Common middleware functions for request context, correlation, and logging.
 * 
 * Note: Fastify types are provided by services that use this middleware.
 */

import { setRequestContext, clearRequestContext, generateRequestId, type RequestContext } from './request-context.js';

// Fastify types (services will have fastify installed)
type FastifyRequest = any;
type FastifyReply = any;

/**
 * Request context middleware
 * Extracts correlationId, userId, and creates requestId
 */
export function requestContextMiddleware(serviceName: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Extract correlationId from headers or body
    const correlationId = 
      (request.headers['x-correlation-id'] as string) ||
      (request.body as any)?.correlationId ||
      `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Extract userId from auth or body
    const userId = 
      (request as any).user?.userId ||
      (request.body as any)?.userId ||
      (request.query as any)?.userId ||
      undefined;

    // Create request context
    const context: RequestContext = {
      requestId: generateRequestId(),
      correlationId,
      userId,
      serviceName,
      startTime: Date.now(),
    };

    setRequestContext(context);

    // Set global context for logger access
    (globalThis as any).__dmf_requestContext = context;

    // Add to request for access in handlers
    (request as any).requestContext = context;

    // Cleanup on response finish (use reply.raw for Node.js http.ServerResponse)
    reply.raw.on('finish', () => {
      clearRequestContext();
      delete (globalThis as any).__dmf_requestContext;
    });
  };
}
