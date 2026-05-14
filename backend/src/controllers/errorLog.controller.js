import ErrorLog from "../model/errorLog.js";

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
