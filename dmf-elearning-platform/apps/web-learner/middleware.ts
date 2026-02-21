import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { updateSession } from './src/lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: Parameters<typeof handleI18nRouting>[0]) {
  const response = handleI18nRouting(request);
  return updateSession(request, response);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en)/:path*']
};
