import BlacklistedIp from "../model/blacklistedIp.js";

const ipBlocker = async (req, res, next) => {
  try {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

    if (!clientIp) {
      return next();
    }

    // Clean client IP (strip IPv6 prefix if present in local environments, e.g. ::ffff:)
    const cleanIp = clientIp.replace(/^.*:/, "").trim();

    // Query blacklisted database
    const isBlocked = await BlacklistedIp.findOne({ ip: cleanIp });

    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Your IP address (${cleanIp}) has been temporarily or permanently blacklisted for security violations.`,
        reason: isBlocked.reason
      });
    }

    next();
  } catch (err) {
    console.error("IP Blocker Middleware error:", err);
    next();
  }
};

export default ipBlocker;
