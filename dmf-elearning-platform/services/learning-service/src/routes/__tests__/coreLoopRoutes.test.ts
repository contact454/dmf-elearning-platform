import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import reviewRoutes from '../review';
import hubRoutes from '../hub';
import * as reviewService from '../../services/reviewService';
import { HubService } from '../../services/HubService';

vi.mock('../../services/profileService', () => ({
  ensureUserProfile: vi.fn().mockResolvedValue({
    id: 'user_123456',
    email: 'user@example.com',
    name: 'Test User',
    timezone: 'UTC',
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
}));

vi.mock('../../services/reviewService', () => ({
  getReviewQueue: vi.fn(),
  submitReview: vi.fn(),
  getProgressStats: vi.fn(),
}));

vi.mock('../../services/streakService', () => ({
  updateStreak: vi.fn().mockResolvedValue({
    success: true,
    data: {
      currentStreak: 1,
      longestStreak: 1,
      milestoneReached: null,
    },
  }),
}));

vi.mock('../../services/HubService', () => ({
  HubService: {
    getHubData: vi.fn(),
    getSkillProgress: vi.fn(),
    getDailyGoals: vi.fn(),
    updateDailyGoals: vi.fn(),
    getRecommendation: vi.fn(),
  },
}));

function createSignedToken(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

  const headerPart = encode(header);
  const payloadPart = encode(payload);
  const signingInput = `${headerPart}.${payloadPart}`;
  const signature = crypto.createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
}

function createMockResponse() {
  const finishListeners: Array<() => void | Promise<void>> = [];
  const response: Partial<Response> & {
    statusCode: number;
    body: unknown;
    triggerFinish: () => Promise<void>;
  } = {
    statusCode: 200,
    body: undefined,
    triggerFinish: async () => {
      for (const listener of finishListeners) {
        await listener();
      }
    },
  };

  response.status = vi.fn((code: number) => {
    response.statusCode = code;
    return response as Response;
  }) as Response['status'];

  response.json = vi.fn((payload: unknown) => {
    response.body = payload;
    return response as Response;
  }) as Response['json'];

  response.on = vi.fn((event: string, listener: () => void | Promise<void>) => {
    if (event === 'finish') {
      finishListeners.push(listener);
    }
    return response as Response;
  }) as Response['on'];

  return response as Response & {
    statusCode: number;
    body: unknown;
    triggerFinish: () => Promise<void>;
  };
}

function getRouteHandlers(
  router: typeof reviewRoutes | typeof hubRoutes,
  method: 'get' | 'post' | 'patch',
  path: string
): RequestHandler[] {
  const layer = (router as any).stack.find(
    (entry: any) => entry.route?.path === path && entry.route?.methods?.[method]
  );

  if (!layer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }

  return layer.route.stack.map((entry: any) => entry.handle as RequestHandler);
}

async function runRouteHandlers(
  handlers: RequestHandler[],
  request: Partial<Request>,
  response: ReturnType<typeof createMockResponse>
) {
  const req = {
    headers: {},
    params: {},
    query: {},
    body: {},
    ...request,
  } as Request;

  for (let index = 0; index < handlers.length; index += 1) {
    const next = vi.fn();
    await handlers[index](req, response, next as unknown as NextFunction);
    if (index < handlers.length - 1 && !next.mock.calls.length) {
      break;
    }
  }

  await response.triggerFinish();
  return req;
}

describe('Core loop protected routes', () => {
  const jwtSecret = 'test-supabase-secret';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_JWT_SECRET = jwtSecret;
    process.env.AUTH_ENFORCE_SUBJECT_MATCH = 'false';
  });

  it('binds GET /api/review/queue to authenticated user id', async () => {
    vi.mocked(reviewService.getReviewQueue).mockResolvedValueOnce({
      success: true,
      data: {
        words: [],
        count: 0,
        hasMore: false,
      },
    } as any);

    const token = createSignedToken(
      {
        sub: 'auth-user-review',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      jwtSecret
    );
    const handlers = getRouteHandlers(reviewRoutes, 'get', '/queue');
    const res = createMockResponse();

    await runRouteHandlers(
      handlers,
      {
        headers: { authorization: `Bearer ${token}` },
      },
      res
    );

    expect(res.statusCode).toBe(200);
    expect(reviewService.getReviewQueue).toHaveBeenCalledWith('auth-user-review');
  });

  it('binds POST /api/review/submit to authenticated user id and ignores spoofed body userId', async () => {
    vi.mocked(reviewService.submitReview).mockResolvedValueOnce({
      success: true,
      data: {
        progress: { id: 'progress-1' },
        nextReview: new Date('2026-02-21T00:00:00.000Z'),
        status: 'REVIEW',
        intervalDays: 3,
      },
    } as any);

    const token = createSignedToken(
      {
        sub: 'auth-user-submit',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      jwtSecret
    );
    const handlers = getRouteHandlers(reviewRoutes, 'post', '/submit');
    const res = createMockResponse();

    await runRouteHandlers(
      handlers,
      {
        headers: { authorization: `Bearer ${token}` },
        body: {
          userId: 'spoofed-user',
          wordId: 'ckv1234567890abcdef123456',
          quality: 4,
        },
      },
      res
    );

    expect(res.statusCode).toBe(200);
    expect(reviewService.submitReview).toHaveBeenCalledWith(
      'auth-user-submit',
      'ckv1234567890abcdef123456',
      4
    );
  });

  it('binds PATCH /api/hub/:userId/daily-goals to authenticated user id', async () => {
    vi.mocked(HubService.updateDailyGoals).mockResolvedValueOnce([
      {
        type: 'vocabulary',
        target: 12,
        completed: 3,
        isCompleted: false,
        unit: 'reviews',
      },
    ] as any);

    const token = createSignedToken(
      {
        sub: 'auth-user-hub',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      jwtSecret
    );
    const handlers = getRouteHandlers(hubRoutes, 'patch', '/:userId/daily-goals');
    const res = createMockResponse();

    await runRouteHandlers(
      handlers,
      {
        headers: { authorization: `Bearer ${token}` },
        params: { userId: 'spoofed-route-user' },
        body: {
          userId: 'spoofed-body-user',
          vocabulary: 12,
        },
      },
      res
    );

    expect(res.statusCode).toBe(200);
    expect(HubService.updateDailyGoals).toHaveBeenCalledWith(
      'auth-user-hub',
      expect.objectContaining({ vocabulary: 12 })
    );
  });

  it('rejects invalid daily goal values for PATCH /api/hub/:userId/daily-goals', async () => {
    const token = createSignedToken(
      {
        sub: 'auth-user-hub',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      jwtSecret
    );
    const handlers = getRouteHandlers(hubRoutes, 'patch', '/:userId/daily-goals');
    const res = createMockResponse();

    await runRouteHandlers(
      handlers,
      {
        headers: { authorization: `Bearer ${token}` },
        params: { userId: 'auth-user-hub' },
        body: {
          vocabulary: 0,
        },
      },
      res
    );

    expect(res.statusCode).toBe(400);
    expect(HubService.updateDailyGoals).not.toHaveBeenCalled();
  });
});
