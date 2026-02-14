import { Context, Next } from 'hono';

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export const rateLimiter = () => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();

    const existing = requestCounts.get(ip);

    if (!existing || now > existing.resetTime) {
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + WINDOW_MS,
      });
      return next();
    }

    if (existing.count >= MAX_REQUESTS) {
      return c.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later',
        },
        429
      );
    }

    existing.count++;
    return next();
  };
};
