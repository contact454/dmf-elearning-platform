import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const requestedNext = requestUrl.searchParams.get('next');

  const fallbackPath = `/${locale}/dashboard`;
  const safeNextPath =
    requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : fallbackPath;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL(`/${locale}/auth/login`, requestUrl.origin);
      loginUrl.searchParams.set('error', error.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(safeNextPath, requestUrl.origin));
}
