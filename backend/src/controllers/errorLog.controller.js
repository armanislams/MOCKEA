import ErrorLog from "../model/errorLog.js";
import admin from "../lib/firebase.config.js";

export const getLogs = async (req, res, next) => {
  try {
    const logs = await ErrorLog.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      message: "Error logs fetched successfully",
      logs,
    });
  } catch (error) {
    next(error);
  }
};

export const clearLogs = async (req, res, next) => {
  try {
    await ErrorLog.deleteMany({});
    return res.status(200).json({
      success: true,
      message: "All error logs have been cleared",
    });
  } catch (error) {
    next(error);
  }
};

export const createClientLog = async (req, res, next) => {
  try {
    const { message, stack, path, method, status } = req.body;
    let userEmail = null;

    // Try to extract user email from Authorization token if present
    const token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      try {
        const idToken = token.split(" ")[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        userEmail = decoded.email;
      } catch (err) {
        console.warn("Failed to decode token for client log:", err.message);
      }
    }

    const log = await ErrorLog.create({
      message: message || "Unknown client error",
      stack: stack || "No stack trace provided",
      method: method || "CLIENT",
      path: path || "unknown-client-path",
      status: status || 500,
      userEmail: userEmail || req.body.userEmail || null,
    });

    return res.status(201).json({
      success: true,
      message: "Client error logged successfully",
      log,
    });
  } catch (error) {
    next(error);
  }
};

