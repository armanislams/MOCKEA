const ipRequestHistory = new Map();

/**
 * Custom Sliding-Window Rate Limiter Middleware
 * @param {number} limit Maximum requests allowed within the windowMs.
 * @param {number} windowMs Window duration in milliseconds.
 */
const apiRateLimiter = (limit = 60, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.ip;
    const now = Date.now();

    if (!ipRequestHistory.has(ip)) {
      ipRequestHistory.set(ip, []);
    }

    const timestamps = ipRequestHistory.get(ip);
    // Remove timestamps that fell out of the active sliding window
    const activeTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (activeTimestamps.length >= limit) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please slow down and try again shortly."
      });
    }

    // Record the current request timestamp
    activeTimestamps.push(now);
    ipRequestHistory.set(ip, activeTimestamps);
    next();
  };
};

export default apiRateLimiter;
