import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, expirationSeconds?: number): Promise<boolean> {
  if (!redis) return false;
  
  try {
    if (expirationSeconds) {
      await redis.setex(key, expirationSeconds, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
}

export async function cacheDelete(key: string): Promise<boolean> {
  if (!redis) return false;
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return false;
  }
}

export async function cacheInvalidatePattern(pattern: string): Promise<boolean> {
  if (!redis) return false;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Redis INVALIDATE error:', error);
    return false;
  }
}

export default redis;
