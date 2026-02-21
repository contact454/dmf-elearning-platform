import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useLeaderboard,
  usePoints,
  useStreak,
  useUpdatePoints,
  useUpdateStreak,
} from '../useGamification';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function mockJsonResponse(data: unknown, status: number = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('loads points contract from /api/gamification/points', async () => {
    vi.mocked(fetch).mockImplementationOnce(() =>
      mockJsonResponse({
        success: true,
        data: {
          id: 'stats-user-1',
          userId: 'user-1',
          xp: 220,
          level: 2,
          streak: 4,
          createdAt: '2026-02-20T00:00:00.000Z',
          updatedAt: '2026-02-20T00:00:00.000Z',
          lastActiveAt: '2026-02-20T00:00:00.000Z',
        },
      })
    );

    const { result } = renderHook(() => usePoints('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.xp).toBe(220);
    expect(fetch).toHaveBeenCalledWith('/api/gamification/points?userId=user-1');
  });

  it('loads leaderboard + streak contracts', async () => {
    vi.mocked(fetch)
      .mockImplementationOnce(() =>
        mockJsonResponse({
          success: true,
          data: {
            entries: [
              {
                userId: 'user-1',
                username: 'User 1',
                xp: 500,
                level: 3,
                streak: 5,
                rank: 1,
              },
            ],
            userEntry: {
              userId: 'user-1',
              username: 'User 1',
              xp: 500,
              level: 3,
              streak: 5,
              rank: 1,
            },
            period: 'weekly',
            startDate: '2026-02-17T00:00:00.000Z',
            endDate: '2026-02-20T00:00:00.000Z',
          },
        })
      )
      .mockImplementationOnce(() =>
        mockJsonResponse({
          success: true,
          data: {
            streak: 5,
            canCheckIn: true,
            lastActiveAt: '2026-02-20T00:00:00.000Z',
          },
        })
      );

    const leaderboard = renderHook(
      () => useLeaderboard({ period: 'weekly', limit: 10, userId: 'user-1' }),
      { wrapper: createWrapper() }
    );
    const streak = renderHook(() => useStreak('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(leaderboard.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(streak.result.current.isSuccess).toBe(true));

    const firstCall = vi.mocked(fetch).mock.calls[0]?.[0] as string;
    expect(firstCall).toContain('/api/gamification/leaderboard?');
    expect(firstCall).toContain('period=weekly');
    expect(streak.result.current.data?.streak).toBe(5);
  });

  it('posts points and streak updates to contract endpoints', async () => {
    vi.mocked(fetch)
      .mockImplementationOnce(() => mockJsonResponse({ success: true, data: { xp: 120 } }))
      .mockImplementationOnce(() => mockJsonResponse({ success: true, data: { streak: 3 } }));

    const pointsMutation = renderHook(() => useUpdatePoints(), {
      wrapper: createWrapper(),
    });
    const streakMutation = renderHook(() => useUpdateStreak(), {
      wrapper: createWrapper(),
    });

    pointsMutation.result.current.mutate({ userId: 'user-1', points: 20 });
    streakMutation.result.current.mutate({ userId: 'user-1' });

    await waitFor(() => expect(pointsMutation.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(streakMutation.result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith(
      '/api/gamification/points',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      '/api/gamification/streak',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});
