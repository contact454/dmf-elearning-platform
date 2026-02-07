/**
 * Rate Limiting Middleware for API Routes
 * Implements IP-based rate limiting (20 requests/minute per IP)
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis/Upstash in production)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to remote address
  return request.headers.get('x-vercel-forwarded-for') || 'unknown';
}

/**
 * Check rate limit for IP address
 * 
 * @param request - Next.js request object
 * @param limit - Maximum requests per window (default: 20)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns True if rate limit exceeded
 */
export function checkRateLimit(
  request: NextRequest,
  limit: number = 20,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  
  // Get or create rate limit entry
  let entry = rateLimitStore[ip];
  
  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore[ip] = entry;
    
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment counter
  entry.count++;
  
  if (entry.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limiting middleware wrapper for API route handlers
 * 
 * @param handler - API route handler function
 * @param limit - Maximum requests per window (default: 20)
 * @param windowMs - Time window in milliseconds (default: 60000)
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit<T extends Record<string, any> = {}>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse>,
  limit: number = 20,
  windowMs: number = 60 * 1000
) {
  return async (request: NextRequest, context: T) => {
    const result = checkRateLimit(request, limit, windowMs);
    
    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests - Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    // Execute handler
    const response = await handler(request, context);
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    return response;
  };
}
