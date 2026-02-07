/**
 * Combined Security Middleware
 * Combines authentication, rate limiting, and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from './auth';
import { withRateLimit } from './rateLimit';
import { withSecurity } from './security';

/**
 * Apply all security middleware (Auth + Rate Limit + Security Headers)
 * 
 * @param handler - API route handler function
 * @param options - Configuration options
 * @returns Fully secured handler
 */
export function withSecureAuth<T extends Record<string, any> = {}>(
  handler: (
    request: NextRequest,
    context: T & { user: { userId: string; email?: string } }
  ) => Promise<NextResponse>,
  options: {
    rateLimit?: number;
    rateLimitWindow?: number;
  } = {}
) {
  const { rateLimit = 20, rateLimitWindow = 60 * 1000 } = options;
  
  // Compose middleware: Security -> Rate Limit -> Auth -> Handler
  return withSecurity(
    withRateLimit(
      withAuth(handler),
      rateLimit,
      rateLimitWindow
    )
  );
}

export { withAuth } from './auth';
export { withRateLimit } from './rateLimit';
export { withSecurity } from './security';
