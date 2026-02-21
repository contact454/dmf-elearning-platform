const SUPPORTED_LOCALES = new Set(['en', 'de'])

export async function getBrowserAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || localStorage.getItem('auth_token')
  } catch (error) {
    console.warn('[auth-client] Failed to read Supabase session:', error)
    return localStorage.getItem('auth_token')
  }
}

export async function getBrowserAuthHeaders(): Promise<Record<string, string>> {
  const token = await getBrowserAuthToken()
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`,
  }
}

export function clearBrowserAuthState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function redirectToLoginIfBrowser(): void {
  if (typeof window === 'undefined') return

  const localeSegment = window.location.pathname.split('/')[1]
  const locale = SUPPORTED_LOCALES.has(localeSegment) ? localeSegment : 'en'
  window.location.href = `/${locale}/auth/login`
}
