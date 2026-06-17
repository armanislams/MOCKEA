const ipRequestHistory = new Map();

// Periodic cleanup to prevent memory leak: evict stale IPs every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequestHistory) {
    const active = timestamps.filter((t) => now - t < 60 * 1000);
    if (active.length === 0) {
      ipRequestHistory.delete(ip);
    } else {
      ipRequestHistory.set(ip, active);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

/**
 * Custom Sliding-Window Rate Limiter Middleware
 * @param {number} limit Maximum requests allowed within the windowMs.
 * @param {number} windowMs Window duration in milliseconds.
 */
const apiRateLimiter = (limit = 60, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    // Use req.ip (Express's trusted IP) instead of x-forwarded-for to prevent spoofing
    // When behind a trusted proxy, Express sets req.ip from the proxy header automatically
    const ip = req.ip;
    const now = Date.now();

    if (!ipRequestHistory.has(ip)) {
      ipRequestHistory.set(ip, []);
    }

    const timestamps = ipRequestHistory.get(ip);
    const activeTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (activeTimestamps.length >= limit) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please slow down and try again shortly.",
      });
    }

    activeTimestamps.push(now);
    ipRequestHistory.set(ip, activeTimestamps);
    next();
  };
};

export default apiRateLimiter;
