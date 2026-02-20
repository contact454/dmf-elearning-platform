import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { createRequestLogging, getRequestLoggingConfigFromEnv } from '../requestLogging';

type MockResponse = Response & {
  statusCode: number;
  triggerFinish: () => void;
  setHeader: (name: string, value: string) => void;
};

function createMockRequest(params?: {
  method?: string;
  path?: string;
  originalUrl?: string;
  headers?: Record<string, string | string[]>;
  userId?: string;
}): Request {
  const method = params?.method ?? 'GET';
  const path = params?.path ?? '/api/health';
  const originalUrl = params?.originalUrl ?? path;
  const headers = params?.headers ?? {};
  const user = params?.userId ? { id: params.userId, roles: [], scopes: [] } : undefined;

  return {
    method,
    path,
    url: originalUrl,
    originalUrl,
    headers,
    user,
  } as unknown as Request;
}

function createMockResponse(statusCode = 200): MockResponse {
  const finishListeners: Array<() => void> = [];

  return {
    statusCode,
    on: vi.fn((event: string, listener: () => void) => {
      if (event === 'finish') {
        finishListeners.push(listener);
      }
      return undefined as unknown as Response;
    }),
    setHeader: vi.fn(),
    triggerFinish: () => {
      for (const listener of finishListeners) {
        listener();
      }
    },
  } as unknown as MockResponse;
}

function createNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

describe('requestLogging middleware', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('generates request id, sets response headers, and logs 2xx requests', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const middleware = createRequestLogging({
      enabled: true,
      includeQueryString: false,
      serviceName: 'learning-service',
    });

    const req = createMockRequest({
      method: 'GET',
      path: '/api/profile',
      originalUrl: '/api/profile?verbose=true',
    });
    const res = createMockResponse(200);
    const next = createNext();
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', expect.stringMatching(/^req-/));

    vi.setSystemTime(new Date('2026-02-20T00:00:00.120Z'));
    res.triggerFinish();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('path=/api/profile'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('status=200'));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('verbose=true'));
  });

  it('uses inbound request/correlation ids and includes user id in logs', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const middleware = createRequestLogging({
      enabled: true,
      includeQueryString: true,
      serviceName: 'learning-service',
    });

    const req = createMockRequest({
      method: 'POST',
      path: '/api/review/submit',
      originalUrl: '/api/review/submit?source=web',
      headers: {
        'x-request-id': 'req-fixed-1',
        'x-correlation-id': 'corr-fixed-1',
      },
      userId: 'user-123',
    });
    const res = createMockResponse(201);
    middleware(req, res, createNext());

    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'req-fixed-1');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'corr-fixed-1');

    vi.setSystemTime(new Date('2026-02-20T00:00:00.025Z'));
    res.triggerFinish();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('requestId=req-fixed-1'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('correlationId=corr-fixed-1'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('userId=user-123'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('source=web'));
  });

  it('logs 4xx as warn and 5xx as error', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const middleware = createRequestLogging({
      enabled: true,
      includeQueryString: false,
      serviceName: 'learning-service',
    });

    const req4xx = createMockRequest({ path: '/api/review/queue' });
    const res4xx = createMockResponse(429);
    middleware(req4xx, res4xx, createNext());
    res4xx.triggerFinish();

    const req5xx = createMockRequest({ path: '/api/review/submit' });
    const res5xx = createMockResponse(500);
    middleware(req5xx, res5xx, createNext());
    res5xx.triggerFinish();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('status=429'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('status=500'));
  });

  it('reads request logging config from env with defaults', () => {
    process.env.REQUEST_LOGGING_ENABLED = 'false';
    process.env.REQUEST_LOG_INCLUDE_QUERY = 'true';
    process.env.REQUEST_LOG_SERVICE_NAME = 'custom-learning-service';

    const config = getRequestLoggingConfigFromEnv();

    expect(config).toEqual({
      enabled: false,
      includeQueryString: true,
      serviceName: 'custom-learning-service',
    });
  });
});
