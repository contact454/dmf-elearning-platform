import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import profileRoutes from '../profile';
import { authMiddleware, attachAuthenticatedUserId } from '../../middlewares/auth';

vi.mock('../../services/profileService', () => ({
  ensureUserProfile: vi.fn().mockResolvedValue({
    id: 'user-123456',
    email: 'user@example.com',
    name: 'Test User',
    timezone: 'UTC',
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

function createSignedToken(
  payload: Record<string, unknown>,
  secret: string
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');

  const headerPart = encode(header);
  const payloadPart = encode(payload);
  const signingInput = `${headerPart}.${payloadPart}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  return `${signingInput}.${signature}`;
}

function createMockResponse() {
  const response: Partial<Response> & { statusCode: number; body: any } = {
    statusCode: 200,
    body: undefined as any,
  };

  response.status = vi.fn((code: number) => {
      response.statusCode = code;
      return response as Response;
    }) as any;

  response.json = vi.fn((payload: unknown) => {
      response.body = payload;
      return response as Response;
    }) as any;

  return response as unknown as Response & {
    statusCode: number;
    body: any;
  };
}

async function runHandler(
  handler: RequestHandler,
  request: Request,
  response: Response
) {
  const next = vi.fn() as unknown as NextFunction;
  await handler(request, response, next);
  return next;
}

function getRouteHandlers(
  router: typeof profileRoutes,
  method: 'patch' | 'get',
  path: string
) {
  const layer = (router as any).stack.find(
    (entry: any) => entry.route?.path === path && entry.route?.methods?.[method]
  );

  if (!layer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }

  return layer.route.stack.map((entry: any) => entry.handle as RequestHandler);
}

describe('Auth + Profile route handlers', () => {
  const jwtSecret = 'test-supabase-secret';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_JWT_SECRET = jwtSecret;
    process.env.AUTH_ENFORCE_SUBJECT_MATCH = 'false';
  });

  it('returns 401 with standard auth payload when token is missing', async () => {
    const req = {
      headers: {},
      params: {},
      query: {},
      body: {},
    } as unknown as Request;
    const res = createMockResponse();

    await runHandler(authMiddleware, req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatchObject({
      type: 'AUTH_ERROR',
      code: 'AUTH_MISSING_TOKEN',
      status: 401,
    });
  });

  it('returns 401 when token signature is invalid', async () => {
    const invalidToken = createSignedToken(
      {
        sub: 'user-123456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      'wrong-secret'
    );

    const req = {
      headers: {
        authorization: `Bearer ${invalidToken}`,
      },
      params: {},
      query: {},
      body: {},
    } as unknown as Request;
    const res = createMockResponse();

    await runHandler(authMiddleware, req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('AUTH_INVALID_TOKEN');
  });

  it('binds progress reads/writes to authenticated user id from JWT', async () => {
    const req = {
      user: {
        id: 'supabase-user-001',
        email: 'learner@dmf.test',
        roles: [],
        scopes: [],
      },
      params: {
        userId: 'mock-user-id',
      },
      query: {
        userId: 'mock-user-id',
      },
      body: {
        userId: 'mock-user-id',
        points: 100,
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = await runHandler(attachAuthenticatedUserId, req, res);

    expect(next).toHaveBeenCalled();
    expect(req.params.userId).toBe('supabase-user-001');
    expect(req.query.userId).toBe('supabase-user-001');
    expect((req.body as any).userId).toBe('supabase-user-001');
    expect((req.body as any).points).toBe(100);
  });

  it('returns 403 with standard auth payload on subject mismatch when strict mode is enabled', async () => {
    process.env.AUTH_ENFORCE_SUBJECT_MATCH = 'true';
    const req = {
      user: {
        id: 'supabase-user-002',
        roles: [],
        scopes: [],
      },
      params: {
        userId: 'another-user',
      },
      query: {},
      body: {},
    } as unknown as Request;
    const res = createMockResponse();

    await runHandler(attachAuthenticatedUserId, req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatchObject({
      type: 'AUTH_ERROR',
      code: 'AUTH_FORBIDDEN',
      status: 403,
    });
  });

  it('updates profile using authenticated identity', async () => {
    const profileService = await import('../../services/profileService');
    vi.mocked(profileService.updateProfile).mockResolvedValue({
      id: 'supabase-user-003',
      email: 'profile@dmf.test',
      name: 'Updated Learner',
      timezone: 'Asia/Ho_Chi_Minh',
      streak: {
        current: 3,
        longest: 10,
        lastActivityDate: null,
      },
      preferences: {
        timezone: 'Asia/Ho_Chi_Minh',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = createSignedToken(
      {
        sub: 'supabase-user-003',
        email: 'profile@dmf.test',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      jwtSecret
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {},
      query: {},
      body: {
        name: 'Updated Learner',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const handlers = getRouteHandlers(profileRoutes, 'patch', '/');
    const [authHandler, userBindingHandler, syncProfileHandler, patchHandler] = handlers;

    let next = vi.fn() as unknown as NextFunction;
    await authHandler(req, res, next);
    expect(next).toHaveBeenCalled();

    next = vi.fn() as unknown as NextFunction;
    await userBindingHandler(req, res, next);
    expect(next).toHaveBeenCalled();

    next = vi.fn() as unknown as NextFunction;
    await syncProfileHandler(req, res, next);
    expect(next).toHaveBeenCalled();

    await patchHandler(req, res, vi.fn() as unknown as NextFunction);

    expect(res.statusCode).toBe(200);
    expect(profileService.updateProfile).toHaveBeenCalledWith(
      'supabase-user-003',
      { email: 'profile@dmf.test' },
      {
        name: 'Updated Learner',
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );
    expect(res.body.success).toBe(true);
  });
});
