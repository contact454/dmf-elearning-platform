import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createRateLimit, getRateLimitConfigFromEnv } from '../rateLimit';

type MockResponse = Response & {
  statusCode: number;
  jsonBody?: unknown;
  headers: Record<string, string>;
};

function createMockResponse(): MockResponse {
  const headers: Record<string, string> = {};
  const response = {
    statusCode: 200,
    headers,
    setHeader: vi.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    status: vi.fn(function (this: MockResponse, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn(function (this: MockResponse, payload: unknown) {
      this.jsonBody = payload;
      return this;
    }),
  } as unknown as MockResponse;

  return response;
}

function createRequest(ip = '127.0.0.1'): Request {
  return {
    headers: {},
    ip,
    socket: { remoteAddress: ip },
  } as unknown as Request;
}

describe('rateLimit middleware', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.RATE_LIMIT_ENABLED = 'true';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = { ...originalEnv };
  });

  it('allows requests within the configured limit', () => {
    const middleware = createRateLimit('test-within-limit', { windowMs: 60_000, max: 2 });
    const req = createRequest();
    const res = createMockResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.headers['X-RateLimit-Limit']).toBe('2');
    expect(res.headers['X-RateLimit-Remaining']).toBe('0');
  });

  it('returns 429 when the request count exceeds limit', () => {
    const middleware = createRateLimit('test-exceeded-limit', { windowMs: 60_000, max: 1 });
    const req = createRequest();
    const res = createMockResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(429);
    expect(res.headers['Retry-After']).toBe('60');
    expect(res.jsonBody).toMatchObject({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  });

  it('resets counters after the window expires', () => {
    const middleware = createRateLimit('test-window-reset', { windowMs: 10_000, max: 1 });
    const req = createRequest();
    const res = createMockResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);
    expect(res.statusCode).toBe(429);

    vi.setSystemTime(new Date('2026-02-20T00:00:11.000Z'));
    const resAfterReset = createMockResponse();
    middleware(req, resAfterReset, next);

    expect(resAfterReset.statusCode).toBe(200);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('reads configurable values from env with sane defaults', () => {
    process.env.RATE_LIMIT_WINDOW_MS = '120000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '500';
    process.env.RATE_LIMIT_REVIEW_WINDOW_MS = '10000';
    process.env.RATE_LIMIT_REVIEW_MAX_REQUESTS = '20';
    process.env.RATE_LIMIT_AUDIO_WINDOW_MS = '30000';
    process.env.RATE_LIMIT_AUDIO_MAX_REQUESTS = '15';

    const config = getRateLimitConfigFromEnv();

    expect(config).toEqual({
      globalWindowMs: 120000,
      globalMax: 500,
      reviewWindowMs: 10000,
      reviewMax: 20,
      audioWindowMs: 30000,
      audioMax: 15,
    });
  });
});

