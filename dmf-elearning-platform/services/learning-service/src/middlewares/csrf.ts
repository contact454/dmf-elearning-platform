import { Request, Response, NextFunction } from 'express';

/**
 * CSRF Protection Middleware
 *
 * Uses the "double submit" / custom header pattern:
 * - For state-changing requests (POST, PUT, PATCH, DELETE), requires
 *   the `X-Requested-With` header to be present.
 * - Browsers block cross-origin requests from setting custom headers
 *   unless explicitly allowed by CORS, so this provides CSRF protection.
 * - Safe methods (GET, HEAD, OPTIONS) are allowed through without checks.
 *
 * This approach works well with SPA/API architectures where the frontend
 * sends JSON requests with custom headers.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Paths that are exempt from CSRF checks (e.g., webhooks, health checks)
const EXEMPT_PATHS = new Set([
  '/health',
  '/api/health',
  '/metrics',
]);

export interface CsrfConfig {
  /** Header name to check (default: 'x-requested-with') */
  headerName?: string;
  /** Expected header value, if any (default: any truthy value) */
  headerValue?: string;
  /** Additional paths to exempt from CSRF checks */
  exemptPaths?: string[];
}

export function createCsrfProtection(config: CsrfConfig = {}) {
  const headerName = (config.headerName || 'x-requested-with').toLowerCase();
  const headerValue = config.headerValue;
  const additionalExemptPaths = new Set(config.exemptPaths || []);

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip safe (read-only) methods
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    // Skip exempt paths
    if (EXEMPT_PATHS.has(req.path) || additionalExemptPaths.has(req.path)) {
      next();
      return;
    }

    const reqHeader = req.headers[headerName];

    // Check that the custom header is present
    if (!reqHeader) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_VALIDATION_FAILED',
          message: `Missing required header: ${headerName}`,
        },
      });
      return;
    }

    // If a specific value is required, check it
    if (headerValue && reqHeader !== headerValue) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_VALIDATION_FAILED',
          message: 'Invalid CSRF header value',
        },
      });
      return;
    }

    next();
  };
}

export function getCsrfConfigFromEnv(): CsrfConfig {
  return {
    headerName: process.env.CSRF_HEADER_NAME || 'x-requested-with',
    headerValue: process.env.CSRF_HEADER_VALUE || undefined,
    exemptPaths: process.env.CSRF_EXEMPT_PATHS?.split(',').filter(Boolean) || [],
  };
}
