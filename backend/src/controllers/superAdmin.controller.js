import User from "../model/user.js";
import AuditLog from "../model/auditLog.js";
import SystemConfig from "../model/systemConfig.js";
import admin from "../lib/firebase.config.js";
import mongoose from "mongoose";

// Log action helper
const logAction = async (actorEmail, actorRole, action, targetType, targetId, ipAddress, userAgent, details = {}) => {
  try {
    const audit = new AuditLog({
      actorEmail,
      actorRole,
      action,
      targetType,
      targetId,
      ipAddress,
      userAgent,
      details,
    });
    await audit.save();
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
};

// 1. Get System Configuration
export const getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
      await config.save();
    }
    return res.status(200).json({ success: true, config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update System Configuration
export const updateSystemConfig = async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage, featureFlags, systemNotice } = req.body;

    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }

    if (maintenanceMode !== undefined) config.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) config.maintenanceMessage = maintenanceMessage;
    if (featureFlags !== undefined) config.featureFlags = { ...config.featureFlags, ...featureFlags };
    if (systemNotice !== undefined) config.systemNotice = { ...config.systemNotice, ...systemNotice };

    await config.save();

    await logAction(
      req.user.email,
      req.user.role,
      "UPDATE_SYSTEM_CONFIG",
      "SystemConfig",
      config._id.toString(),
      req.ip,
      req.headers["user-agent"],
      { maintenanceMode, featureFlags, systemNotice }
    );

    return res.status(200).json({ success: true, message: "System configuration updated successfully", config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. User Impersonation
export const impersonateUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Target user email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const targetUser = await User.findOne({ email: cleanEmail });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found in local database" });
    }

    // Call Firebase Admin auth to fetch Firebase user UID
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(cleanEmail);
    } catch (fbError) {
      return res.status(404).json({
        success: false,
        message: `User exists in MOCKEA, but no corresponding account was found in Firebase auth: ${fbError.message}`
      });
    }

    // Generate Firebase Custom Token for impersonation
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

    await logAction(
      req.user.email,
      req.user.role,
      "IMPERSONATE_USER",
      "User",
      targetUser._id.toString(),
      req.ip,
      req.headers["user-agent"],
      { targetEmail: cleanEmail }
    );

    return res.status(200).json({
      success: true,
      message: `Impersonation token generated for ${cleanEmail}`,
      customToken,
      targetUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Fetch Audit Logs
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, actorEmail } = req.query;

    const query = {};
    if (action) query.action = action;
    if (actorEmail) query.actorEmail = { $regex: actorEmail, $options: "i" };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get System Metrics (Real-life diagnostic tool)
export const getSystemMetrics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const activeLogCount = await AuditLog.countDocuments();

    // Mongoose stats
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = ["Disconnected", "Connected", "Connecting", "Disconnecting"];

    const memoryUsage = process.memoryUsage();

    return res.status(200).json({
      success: true,
      metrics: {
        database: {
          status: dbStatusMap[dbState] || "Unknown",
          collectionsCount: Object.keys(mongoose.connection.collections).length,
        },
        counts: {
          users: userCount,
          auditLogs: activeLogCount,
        },
        server: {
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform,
          memory: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + " MB",
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + " MB",
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + " MB",
          }
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get Public System Configuration (Exposed publicly for announcements/maintenance check)
export const getPublicSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
      await config.save();
    }
    return res.status(200).json({
      success: true,
      maintenanceMode: config.maintenanceMode,
      maintenanceMessage: config.maintenanceMessage,
      systemNotice: config.systemNotice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
