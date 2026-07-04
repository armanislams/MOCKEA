import User from "../model/user.js";
import AuditLog from "../model/auditLog.js";
import SystemConfig from "../model/systemConfig.js";
import ErrorLog from "../model/errorLog.js";
import BroadcastEmail from "../model/broadcastEmail.js";
import Notification from "../model/notification.js";
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

// 7. Get Error Analytics (clusters backend errors and aggregates similar stack traces)
export const getErrorAnalytics = async (req, res) => {
  try {
    const logs = await ErrorLog.find().sort({ createdAt: -1 }).limit(5000);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const clusters = {};

    const getStackSignature = (stack, message, path, method) => {
      if (!stack || stack === "No stack trace provided") {
        const cleanMsg = (message || "unknown")
          .replace(/[0-9a-fA-F]{24}/g, "{MONGO_ID}")
          .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, "{UUID}")
          .replace(/\b\d+\b/g, "{NUM}");
        return `msg:${method || ""}:${path || ""}:${cleanMsg}`;
      }

      const lines = stack.split("\n").map(line => line.trim());
      const signatureLines = [];

      if (lines[0]) {
        signatureLines.push(
          lines[0]
            .replace(/[0-9a-fA-F]{24}/g, "{MONGO_ID}")
            .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, "{UUID}")
            .replace(/\b\d+\b/g, "{NUM}")
        );
      }

      for (let i = 1; i < Math.min(lines.length, 4); i++) {
        let line = lines[i];
        if (line.startsWith("at ")) {
          line = line.replace(/\\/g, "/");
          line = line.replace(/.*\/MOCKEA\//i, "");
          line = line.replace(/.*\/node_modules\//i, "node_modules/");
          line = line.replace(/[a-zA-Z]:\/[^\s]+?\/(src|node_modules|backend|frontend)/g, "$1");
        }
        signatureLines.push(line);
      }

      return signatureLines.join("\n");
    };

    for (const log of logs) {
      const sig = getStackSignature(log.stack, log.message, log.path, log.method);
      const isLastHour = log.createdAt >= oneHourAgo;
      const isLast24Hours = log.createdAt >= twentyFourHoursAgo;

      if (!clusters[sig]) {
        clusters[sig] = {
          signature: sig,
          message: log.message,
          stack: log.stack,
          count: 0,
          countLastHour: 0,
          countLast24Hours: 0,
          paths: {},
          methods: {},
          statuses: {},
          users: new Set(),
          firstSeen: log.createdAt,
          lastSeen: log.createdAt,
        };
      }

      const cluster = clusters[sig];
      cluster.count += 1;
      if (isLastHour) cluster.countLastHour += 1;
      if (isLast24Hours) cluster.countLast24Hours += 1;

      const routeKey = `${log.method || "UNKNOWN"} ${log.path || "unknown"}`;
      cluster.paths[routeKey] = (cluster.paths[routeKey] || 0) + 1;
      
      const methodKey = log.method || "UNKNOWN";
      cluster.methods[methodKey] = (cluster.methods[methodKey] || 0) + 1;

      const statusKey = log.status || 500;
      cluster.statuses[statusKey] = (cluster.statuses[statusKey] || 0) + 1;

      if (log.userEmail) {
        cluster.users.add(log.userEmail);
      }

      if (log.createdAt < cluster.firstSeen) {
        cluster.firstSeen = log.createdAt;
      }
      if (log.createdAt > cluster.lastSeen) {
        cluster.lastSeen = log.createdAt;
      }
    }

    const aggregated = Object.values(clusters).map(c => ({
      ...c,
      users: Array.from(c.users).slice(0, 10),
      uniqueUsersCount: c.users.size,
    }));

    return res.status(200).json({
      success: true,
      errorClusters: aggregated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// 11. Send Cohort Email Broadcast
export const sendEmailBroadcast = async (req, res) => {
  try {
    const { subject, content, cohort } = req.body;

    if (!subject || !content || !cohort) {
      return res.status(400).json({ success: false, message: "Subject, content, and cohort are required" });
    }

    // Find users based on cohort selection
    let userFilter = { role: "student" };
    if (cohort === "free") {
      userFilter.plan = "free";
    } else if (cohort === "standard") {
      userFilter.plan = "standard";
    } else if (cohort === "premium") {
      userFilter.plan = "premium";
    } else if (cohort === "inactive") {
      // Inactive: lastActive is older than 30 days, or is null
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      userFilter.$or = [
        { lastActive: { $lte: thirtyDaysAgo } },
        { lastActive: { $exists: false } },
        { lastActive: null }
      ];
    }

    const targetUsers = await User.find(userFilter);
    const emails = targetUsers.map((u) => u.email);

    // Save Broadcast log
    const broadcast = new BroadcastEmail({
      subject,
      content,
      cohort,
      recipientCount: emails.length,
      recipients: emails,
      sentBy: req.user.email,
    });
    await broadcast.save();

    // Create Notification document so it shows up for target cohort users in their inbox
    const notification = new Notification({
      title: subject,
      message: content,
      cohort,
      sentBy: req.user.email,
    });
    await notification.save();

    await logAction(
      req.user.email,
      req.user.role,
      "SEND_EMAIL_BROADCAST",
      "BroadcastEmail",
      broadcast._id.toString(),
      req.ip,
      req.headers["user-agent"],
      { cohort, recipientCount: emails.length }
    );

    return res.status(200).json({
      success: true,
      message: `Broadcast successfully sent to ${emails.length} users.`,
      recipientCount: emails.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 12. Get Past Broadcasts
export const getBroadcastHistory = async (req, res) => {
  try {
    const broadcasts = await BroadcastEmail.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, broadcasts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
