/**
 * JWT Authentication Middleware for API Routes
 * Validates Supabase JWT tokens and extracts userId
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createSecureErrorResponse } from './security';

/**
 * Extended Request type with authenticated user
 */
export interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    email?: string;
  };
}

/**
 * Authenticate JWT token from Authorization header
 * Extracts userId from Supabase JWT token
 * 
 * @param request - Next.js request object
 * @returns Authenticated user or null if unauthenticated
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ userId: string; email?: string } | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll(cookiesToSet) {
            // No-op for API routes - cookies handled by client
          },
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify JWT and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[authenticateRequest] Authentication failed:', error?.message);
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error('[authenticateRequest] Error:', error);
    return null;
  }
}

/**
 * Authentication middleware wrapper for API route handlers
 * Usage: const handler = withAuth(async (request, { user }) => { ... })
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler with authentication
 */
export function withAuth<T extends Record<string, any> = {}>(
  handler: (
    request: NextRequest,
    context: T & { user: { userId: string; email?: string } }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T) => {
    const user = await authenticateRequest(request);

    if (!user) {
      return createSecureErrorResponse(
        'Unauthorized - Valid JWT token required',
        401,
        request
      );
    }

    // Attach user to context
    return handler(request, { ...context, user });
  };
}
