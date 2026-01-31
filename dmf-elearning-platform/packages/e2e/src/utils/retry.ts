/**
 * Retry utilities for E2E runner
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 1000,
  backoffMultiplier: 2,
  retryableStatusCodes: [500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'],
};

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | unknown;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Check if error is retryable
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable =
        opts.retryableErrors.some((pattern) => errorMessage.includes(pattern)) ||
        (error && typeof error === 'object' && 'status' in error && opts.retryableStatusCodes.includes((error as any).status));

      if (!isRetryable) {
        // Not retryable, throw immediately
        throw error;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError;
}
