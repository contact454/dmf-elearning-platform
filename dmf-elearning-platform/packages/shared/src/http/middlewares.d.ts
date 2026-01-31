/**
 * HTTP Middlewares (Middleware HTTP)
 *
 * Common middleware functions for request context, correlation, and logging.
 *
 * Note: Fastify types are provided by services that use this middleware.
 */
type FastifyRequest = any;
type FastifyReply = any;
/**
 * Request context middleware
 * Extracts correlationId, userId, and creates requestId
 */
export declare function requestContextMiddleware(serviceName: string): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
export {};
//# sourceMappingURL=middlewares.d.ts.map