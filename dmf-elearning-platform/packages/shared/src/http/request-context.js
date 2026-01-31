/**
 * Request Context (Ngữ cảnh Yêu cầu)
 *
 * Provides request-scoped context for correlation, tracing, and logging.
 */
const REQUEST_CONTEXT_KEY = Symbol.for('dmf.requestContext');
/**
 * Get request context from AsyncLocalStorage or create new
 */
export function getRequestContext() {
    const store = globalThis[REQUEST_CONTEXT_KEY];
    return store || null;
}
/**
 * Set request context (for use in middleware)
 */
export function setRequestContext(context) {
    globalThis[REQUEST_CONTEXT_KEY] = context;
}
/**
 * Clear request context (for cleanup)
 */
export function clearRequestContext() {
    delete globalThis[REQUEST_CONTEXT_KEY];
}
/**
 * Generate request ID
 */
export function generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=request-context.js.map