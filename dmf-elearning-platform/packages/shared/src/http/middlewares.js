/**
 * HTTP Middlewares (Middleware HTTP)
 *
 * Common middleware functions for request context, correlation, and logging.
 *
 * Note: Fastify types are provided by services that use this middleware.
 */
import { setRequestContext, clearRequestContext, generateRequestId } from './request-context.js';
/**
 * Request context middleware
 * Extracts correlationId, userId, and creates requestId
 */
export function requestContextMiddleware(serviceName) {
    return async (request, reply) => {
        // Extract correlationId from headers or body
        const correlationId = request.headers['x-correlation-id'] ||
            request.body?.correlationId ||
            `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Extract userId from auth or body
        const userId = request.user?.userId ||
            request.body?.userId ||
            request.query?.userId ||
            undefined;
        // Create request context
        const context = {
            requestId: generateRequestId(),
            correlationId,
            userId,
            serviceName,
            startTime: Date.now(),
        };
        setRequestContext(context);
        // Set global context for logger access
        globalThis.__dmf_requestContext = context;
        // Add to request for access in handlers
        request.requestContext = context;
        // Cleanup on response finish
        reply.addHook('onSend', () => {
            clearRequestContext();
            delete globalThis.__dmf_requestContext;
        });
    };
}
//# sourceMappingURL=middlewares.js.map