/**
 * In-Memory Sliding Window Rate Limiter for Laure Joyas API & Routes
 * Protects against DDoS, brute force, and rapid request flooding.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of expired records every 2 minutes
    if (typeof window === 'undefined') {
      setInterval(() => this.cleanup(), 120000);
    }
  }

  /**
   * Checks if an identifier (IP address or token) has exceeded rate limit.
   */
  public check(identifier: string, limit = this.maxRequests, windowMs = this.windowMs): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
  } {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.store.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(identifier, record);
    }

    // Filter out timestamps outside current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestTs = record.timestamps[0];
      const resetMs = Math.max(0, oldestTs + windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    // Record request timestamp
    record.timestamps.push(now);
    const remaining = Math.max(0, limit - record.timestamps.length);

    return {
      allowed: true,
      remaining,
      resetMs: windowMs,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// Export singletons for general API routes and strict auth/sensitive routes
export const globalApiRateLimiter = new SlidingWindowRateLimiter(60000, 60); // 60 req/min
export const strictAuthRateLimiter = new SlidingWindowRateLimiter(60000, 15); // 15 req/min
