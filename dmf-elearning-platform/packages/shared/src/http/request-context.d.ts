/**
 * Request Context (Ngữ cảnh Yêu cầu)
 *
 * Provides request-scoped context for correlation, tracing, and logging.
 */
export interface RequestContext {
    requestId: string;
    correlationId?: string;
    userId?: string;
    serviceName: string;
    startTime: number;
}
/**
 * Get request context from AsyncLocalStorage or create new
 */
export declare function getRequestContext(): RequestContext | null;
/**
 * Set request context (for use in middleware)
 */
export declare function setRequestContext(context: RequestContext): void;
/**
 * Clear request context (for cleanup)
 */
export declare function clearRequestContext(): void;
/**
 * Generate request ID
 */
export declare function generateRequestId(): string;
//# sourceMappingURL=request-context.d.ts.map