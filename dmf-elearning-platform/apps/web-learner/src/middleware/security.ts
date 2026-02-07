/**
 * Security utilities for API routes
 * - Security headers
 * - Rate limiting
 * - CORS configuration
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter (IP-based)
 * For production, use Redis or similar distributed cache
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];
    
    // Filter out requests outside the current window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    // Clean up old entries (every 1000 requests)
    if (this.requests.size > 1000) {
      this.cleanup(windowStart);
    }

    return true;
  }

  private cleanup(windowStart: number) {
    const entries = Array.from(this.requests.entries());
    for (const [identifier, timestamps] of entries) {
      const validTimestamps = timestamps.filter(t => t > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }
}

// Global rate limiter instance (100 requests per minute per IP)
const rateLimiter = new RateLimiter(60000, 100);

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (when behind proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to generic identifier
  return 'unknown';
}

/**
 * Check rate limit for request
 * @throws Error if rate limit exceeded
 */
export function checkRateLimit(request: NextRequest): void {
  const ip = getClientIP(request);
  const allowed = rateLimiter.check(ip);
  
  if (!allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

/**
 * Add CORS headers to response
 */
export function addCORSHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  const origin = request.headers.get('origin');
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

/**
 * Create error response with security headers
 */
export function createSecureErrorResponse(
  message: string,
  status: number,
  request: NextRequest
): NextResponse {
  const response = NextResponse.json(
    { success: false, error: message },
    { status }
  );

  addSecurityHeaders(response);
  addCORSHeaders(response, request);

  return response;
}

/**
 * Create success response with security headers
 */
export function createSecureResponse(
  data: any,
  request: NextRequest
): NextResponse {
  const response = NextResponse.json(data);

  addSecurityHeaders(response);
  addCORSHeaders(response, request);

  return response;
}
