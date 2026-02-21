import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Creates a Supabase client for use in middleware
 */
export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  let supabaseResponse = response;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const [, maybeLocale, ...rest] = pathname.split('/');
  const locale = maybeLocale === 'en' || maybeLocale === 'de' ? maybeLocale : 'en';
  const normalizedPath = maybeLocale === 'en' || maybeLocale === 'de' ? `/${rest.join('/')}` || '/' : pathname;

  const isAuthPage = normalizedPath.startsWith('/auth');
  const isPublicPath =
    normalizedPath === '/' ||
    normalizedPath.startsWith('/auth') ||
    normalizedPath.startsWith('/_next') ||
    normalizedPath.startsWith('/api') ||
    normalizedPath.startsWith('/favicon') ||
    normalizedPath.startsWith('/terms') ||
    normalizedPath.startsWith('/privacy');

  const isProtectedPath =
    normalizedPath.startsWith('/dashboard') ||
    normalizedPath.startsWith('/profile') ||
    normalizedPath.startsWith('/learn') ||
    normalizedPath.startsWith('/vocabulary') ||
    normalizedPath.startsWith('/reading') ||
    normalizedPath.startsWith('/listening') ||
    normalizedPath.startsWith('/speaking') ||
    normalizedPath.startsWith('/writing') ||
    normalizedPath.startsWith('/practice') ||
    normalizedPath.startsWith('/quiz');

  if (!user && isProtectedPath && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    url.searchParams.set('redirect', normalizedPath);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
