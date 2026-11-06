import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * High-performance, zero-dependency in-memory rate limiter
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please slow down and try again later.',
  } = options;

  const clients = new Map<string, ClientRecord>();

  // Periodically sweep expired rate-limit records
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients.entries()) {
      if (now > record.resetTime) {
        clients.delete(ip);
      }
    }
  }, Math.min(windowMs, 60000));

  if (timer.unref) {
    timer.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = clients.get(ip);
    if (!record || now > record.resetTime) {
      clients.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: message,
        retryAfterSeconds: retryAfter,
      });
    }

    record.count++;
    next();
  };
}

// Global API Limiter: 300 requests per 15 minutes
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'API rate limit exceeded. Please try again in a few minutes.',
});

// Sensitive / Cryptographic Limiter: 60 requests per minute
export const cryptoLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Cryptographic operation rate limit reached. Please wait a moment.',
});

// Write / Creation Limiter: 30 requests per minute
export const writeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Contact registration rate limit reached. Please wait before adding more addresses.',
});

