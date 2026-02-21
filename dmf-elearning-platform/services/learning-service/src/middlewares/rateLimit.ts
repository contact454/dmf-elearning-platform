import { Request, Response, NextFunction } from 'express';
import { createClient, RedisClientType } from 'redis';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// In-memory store (fallback)
// ---------------------------------------------------------------------------

const memoryBuckets = new Map<string, Bucket>();
let cleanupTick = 0;

function cleanupExpiredBuckets(now: number) {
  cleanupTick += 1;
  if (cleanupTick % 100 !== 0) return;
  for (const [key, bucket] of memoryBuckets.entries()) {
    if (bucket.resetAt <= now) {
      memoryBuckets.delete(key);
    }
  }
}

function getMemoryBucket(bucketKey: string, windowMs: number, now: number): Bucket {
  const existing = memoryBuckets.get(bucketKey);
  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 0, resetAt: now + windowMs };
    memoryBuckets.set(bucketKey, fresh);
    return fresh;
  }
  return existing;
}

// ---------------------------------------------------------------------------
// Redis store
// ---------------------------------------------------------------------------

let redisClient: RedisClientType | null = null;
let redisReady = false;

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

async function ensureRedisClient(): Promise<RedisClientType | null> {
  const url = getRedisUrl();
  if (!url) return null;

  if (redisClient && redisReady) return redisClient;

  try {
    redisClient = createClient({ url }) as RedisClientType;

    redisClient.on('error', (err) => {
      console.warn('[RateLimit] Redis error — falling back to in-memory:', err.message);
      redisReady = false;
    });

    redisClient.on('ready', () => {
      redisReady = true;
    });

    await redisClient.connect();
    redisReady = true;
    return redisClient;
  } catch (err) {
    console.warn('[RateLimit] Redis connection failed — using in-memory store');
    redisClient = null;
    redisReady = false;
    return null;
  }
}

async function getRedisBucket(
  client: RedisClientType,
  bucketKey: string,
  windowMs: number,
): Promise<{ count: number; remaining: number; resetAt: number }> {
  const key = `ratelimit:${bucketKey}`;
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  // INCR is atomic — safe across multiple instances
  const count = await client.incr(key);

  // Set TTL only on first increment (when count == 1)
  if (count === 1) {
    await client.expire(key, ttlSeconds);
  }

  // Get remaining TTL to calculate resetAt
  const ttl = await client.ttl(key);
  const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs);

  return { count, remaining: ttl, resetAt };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isRateLimitEnabled(): boolean {
  return process.env.RATE_LIMIT_ENABLED !== 'false';
}

function getRateLimitStore(): 'redis' | 'memory' {
  const store = process.env.RATE_LIMIT_STORE?.toLowerCase();
  return store === 'redis' ? 'redis' : 'memory';
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

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------

export function createRateLimit(namespace: string, options: RateLimitOptions) {
  const code = options.code ?? 'RATE_LIMIT_EXCEEDED';
  const message = options.message ?? 'Too many requests. Please try again later.';
  const keyGenerator = options.keyGenerator ?? ((req: Request) => getClientIp(req));
  const store = getRateLimitStore();

  // Eagerly try to connect to Redis if configured
  if (store === 'redis') {
    ensureRedisClient().catch(() => {/* handled via fallback */ });
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isRateLimitEnabled()) {
      next();
      return;
    }

    const now = Date.now();
    const windowMs = Math.max(1, options.windowMs);
    const max = Math.max(1, options.max);
    const key = `${namespace}:${keyGenerator(req)}`;

    let count: number;
    let resetAt: number;

    // Try Redis first, fall back to memory
    if (store === 'redis' && redisReady && redisClient) {
      try {
        const result = await getRedisBucket(redisClient, key, windowMs);
        count = result.count;
        resetAt = result.resetAt;
      } catch {
        // Redis error — fallback to memory for this request
        cleanupExpiredBuckets(now);
        const bucket = getMemoryBucket(key, windowMs, now);
        bucket.count += 1;
        memoryBuckets.set(key, bucket);
        count = bucket.count;
        resetAt = bucket.resetAt;
      }
    } else {
      // In-memory store
      cleanupExpiredBuckets(now);
      const bucket = getMemoryBucket(key, windowMs, now);
      bucket.count += 1;
      memoryBuckets.set(key, bucket);
      count = bucket.count;
      resetAt = bucket.resetAt;
    }

    const remaining = Math.max(max - count, 0);
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (count > max) {
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

// ---------------------------------------------------------------------------
// Config helper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Test helper
// ---------------------------------------------------------------------------

/** @internal — reset state for tests */
export function __resetRateLimitForTests() {
  memoryBuckets.clear();
  cleanupTick = 0;
}
