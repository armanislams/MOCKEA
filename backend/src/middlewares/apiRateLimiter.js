const requestHistory = new Map();

// Periodic cleanup: evict stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requestHistory) {
    const active = timestamps.filter((t) => now - t < 60 * 1000);
    if (active.length === 0) {
      requestHistory.delete(key);
    } else {
      requestHistory.set(key, active);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

/**
 * Custom Sliding-Window Rate Limiter Middleware
 * Uses IP + user token (if available) as key so authenticated users
 * behind the same NAT/proxy get separate rate-limit buckets.
 * 
 * @param {number} limit Maximum requests allowed within the windowMs.
 * @param {number} windowMs Window duration in milliseconds.
 */
const apiRateLimiter = (limit = 60, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip;

    // Build composite key: authenticated users get their own bucket
    let key = ip;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (token && token !== "undefined" && token !== "null") {
          // Decode payload portion of JWT (no verification needed — just extracting id for bucketing)
          const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
          if (payload.user_id) {
            key = `${ip}:${payload.user_id}`;
          }
        }
      }
    } catch {
      // Fallback to IP-only bucket on any decode error
      key = ip;
    }

    const now = Date.now();

    if (!requestHistory.has(key)) {
      requestHistory.set(key, []);
    }

    const timestamps = requestHistory.get(key);
    const activeTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (activeTimestamps.length >= limit) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please slow down and try again shortly.",
      });
    }

    activeTimestamps.push(now);
    requestHistory.set(key, activeTimestamps);
    next();
  };
};

export default apiRateLimiter;
