import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const mockGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

describe('Supabase auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users away from protected pages', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const request = new NextRequest('http://localhost/en/dashboard');
    const response = NextResponse.next({ request });
    const result = await updateSession(request, response);

    expect(result.status).toBeGreaterThanOrEqual(300);
    expect(result.headers.get('location')).toContain('/en/auth/login');
    expect(result.headers.get('location')).toContain('redirect=%2Fdashboard');
  });
});
