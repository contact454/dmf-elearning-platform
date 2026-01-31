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

const REQUEST_CONTEXT_KEY = Symbol.for('dmf.requestContext');

/**
 * Get request context from AsyncLocalStorage or create new
 */
export function getRequestContext(): RequestContext | null {
  const store = (globalThis as any)[REQUEST_CONTEXT_KEY] as RequestContext | undefined;
  return store || null;
}

/**
 * Set request context (for use in middleware)
 */
export function setRequestContext(context: RequestContext): void {
  (globalThis as any)[REQUEST_CONTEXT_KEY] = context;
}

/**
 * Clear request context (for cleanup)
 */
export function clearRequestContext(): void {
  delete (globalThis as any)[REQUEST_CONTEXT_KEY];
}

/**
 * Generate request ID
 */
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
