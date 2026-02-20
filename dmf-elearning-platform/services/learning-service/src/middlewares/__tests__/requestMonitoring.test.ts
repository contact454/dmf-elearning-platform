import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { createRequestMonitoring, getMonitoringConfigFromEnv } from '../requestMonitoring';

type MockResponse = Response & {
  statusCode: number;
  triggerFinish: () => void;
};

function createMockRequest(method = 'GET', path = '/api/test'): Request {
  return {
    method,
    path,
    originalUrl: path,
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

describe('requestMonitoring middleware', () => {
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

  it('emits a 5xx spike alert when threshold is reached', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const middleware = createRequestMonitoring({
      enabled: true,
      windowMs: 60_000,
      alert5xxThreshold: 2,
      alert429Threshold: 99,
      slowRequestMs: 10_000,
      logAllRequests: false,
    });

    for (let i = 0; i < 2; i += 1) {
      const req = createMockRequest('GET', '/api/fail');
      const res = createMockResponse(500);
      const next = createNext();
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      res.triggerFinish();
    }

    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('429 spike detected'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('5xx spike detected'));
  });

  it('emits a 429 spike alert when threshold is reached', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const middleware = createRequestMonitoring({
      enabled: true,
      windowMs: 60_000,
      alert5xxThreshold: 99,
      alert429Threshold: 2,
      slowRequestMs: 10_000,
      logAllRequests: false,
    });

    for (let i = 0; i < 2; i += 1) {
      const req = createMockRequest('GET', '/api/review/queue');
      const res = createMockResponse(429);
      const next = createNext();
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      res.triggerFinish();
    }

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('429 spike detected'));
    expect(errorSpy).not.toHaveBeenCalledWith(expect.stringContaining('5xx spike detected'));
  });

  it('logs slow requests above configured duration', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const middleware = createRequestMonitoring({
      enabled: true,
      windowMs: 60_000,
      alert5xxThreshold: 10,
      alert429Threshold: 10,
      slowRequestMs: 500,
      logAllRequests: false,
    });

    const req = createMockRequest('POST', '/api/review/submit');
    const res = createMockResponse(200);
    middleware(req, res, createNext());

    vi.setSystemTime(new Date('2026-02-20T00:00:01.000Z'));
    res.triggerFinish();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('slow request'));
  });

  it('reads monitoring env config with defaults', () => {
    process.env.MONITORING_ALERTS_ENABLED = 'false';
    process.env.MONITORING_WINDOW_MS = '45000';
    process.env.MONITORING_5XX_ALERT_THRESHOLD = '7';
    process.env.MONITORING_429_ALERT_THRESHOLD = '11';
    process.env.MONITORING_SLOW_REQUEST_MS = '900';
    process.env.MONITORING_LOG_ALL_REQUESTS = 'true';

    const config = getMonitoringConfigFromEnv();

    expect(config).toEqual({
      enabled: false,
      windowMs: 45000,
      alert5xxThreshold: 7,
      alert429Threshold: 11,
      slowRequestMs: 900,
      logAllRequests: true,
    });
  });
});
