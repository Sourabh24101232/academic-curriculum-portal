import AppError from '../utils/AppError.js';

/**
 * In-Memory Sliding Window Rate Limiter Factory
 * @param {Object} options
 * @param {number} options.windowMs - Window duration in milliseconds (default: 15 mins)
 * @param {number} options.max - Max attempts permitted within the window (default: 5)
 * @param {string} options.message - Error message delivered on HTTP 429
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 5,
  message = 'Too many login attempts. Please try again after 15 minutes.'
} = {}) => {
  const ipRecords = new Map();

  // Periodic pruning of expired records to avoid memory leaks
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRecords.entries()) {
      if (now > record.resetTime) {
        ipRecords.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval so it doesn't hold open Node process on shutdown
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req, res, next) => {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      'unknown_ip';

    const now = Date.now();
    let record = ipRecords.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      ipRecords.set(ip, record);
      return next();
    }

    if (record.count >= max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return next(new AppError(message, 429));
    }

    record.count += 1;
    next();
  };
};

/**
 * Institutional Login Rate Limiter Middleware
 * Restricts rapid brute-force password attacks on POST /api/admin/login.
 */
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

export default loginLimiter;
