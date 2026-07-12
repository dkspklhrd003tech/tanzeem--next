import { LRUCache } from 'lru-cache';
import { NextRequest } from 'next/server';

type RateLimitOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  STRICT: { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5 requests per 5 minutes
  MODERATE: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  LOOSE: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
};

export default function rateLimit(options?: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCount[0] += 1;
          tokenCache.set(token, tokenCount);
        }

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        if (isRateLimited) {
          return reject();
        }

        return resolve();
      }),
  };
}

// Instantiate specific limiters based on configuration
const strictLimiter = rateLimit({ interval: RATE_LIMITS.STRICT.windowMs });
const moderateLimiter = rateLimit({ interval: RATE_LIMITS.MODERATE.windowMs });
const looseLimiter = rateLimit({ interval: RATE_LIMITS.LOOSE.windowMs });

export async function checkRateLimit(req: NextRequest, type: 'STRICT' | 'MODERATE' | 'LOOSE', identifier?: string) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
  const token = identifier ? `${ip}-${identifier}` : ip;

  try {
    if (type === 'STRICT') {
      await strictLimiter.check(RATE_LIMITS.STRICT.maxRequests, token);
    } else if (type === 'MODERATE') {
      await moderateLimiter.check(RATE_LIMITS.MODERATE.maxRequests, token);
    } else if (type === 'LOOSE') {
      await looseLimiter.check(RATE_LIMITS.LOOSE.maxRequests, token);
    }
    return { success: true };
  } catch (error) {
    return { success: false, limit: RATE_LIMITS[type].maxRequests, windowMs: RATE_LIMITS[type].windowMs };
  }
}
