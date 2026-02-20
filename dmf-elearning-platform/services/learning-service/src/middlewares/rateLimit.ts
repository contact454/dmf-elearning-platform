import { NextFunction, Request, Response } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  code?: string;
  message?: string;
  keyGenerator?: (req: Request) => string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
let cleanupTick = 0;

function toPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isRateLimitEnabled(): boolean {
  return process.env.RATE_LIMIT_ENABLED !== 'false';
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  if (Array.isArray(forwardedFor) && forwardedFor[0]) {
    return forwardedFor[0];
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function cleanupExpiredBuckets(now: number) {
  cleanupTick += 1;
  if (cleanupTick % 100 !== 0) return;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function getBucket(bucketKey: string, windowMs: number, now: number): Bucket {
  const existing = buckets.get(bucketKey);
  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(bucketKey, fresh);
    return fresh;
  }
  return existing;
}

export function createRateLimit(namespace: string, options: RateLimitOptions) {
  const code = options.code ?? 'RATE_LIMIT_EXCEEDED';
  const message = options.message ?? 'Too many requests. Please try again later.';
  const keyGenerator = options.keyGenerator ?? ((req: Request) => getClientIp(req));

  return (req: Request, res: Response, next: NextFunction) => {
    if (!isRateLimitEnabled()) {
      next();
      return;
    }

    const now = Date.now();
    cleanupExpiredBuckets(now);

    const windowMs = Math.max(1, options.windowMs);
    const max = Math.max(1, options.max);
    const key = `${namespace}:${keyGenerator(req)}`;
    const bucket = getBucket(key, windowMs, now);
    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(max - bucket.count, 0);
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        success: false,
        error: {
          code,
          message,
          retryAfterSeconds,
        },
      });
      return;
    }

    next();
  };
}

export function getRateLimitConfigFromEnv() {
  return {
    globalWindowMs: toPositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
    globalMax: toPositiveInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 240),
    reviewWindowMs: toPositiveInteger(process.env.RATE_LIMIT_REVIEW_WINDOW_MS, 60_000),
    reviewMax: toPositiveInteger(process.env.RATE_LIMIT_REVIEW_MAX_REQUESTS, 120),
    audioWindowMs: toPositiveInteger(process.env.RATE_LIMIT_AUDIO_WINDOW_MS, 60_000),
    audioMax: toPositiveInteger(process.env.RATE_LIMIT_AUDIO_MAX_REQUESTS, 60),
  };
}

