import express from "express";
import {
  getSystemConfig,
  updateSystemConfig,
  impersonateUser,
  getAuditLogs,
  getSystemMetrics,
  getErrorAnalytics,
  getCollectionsList,
  exportCollection,
  runDatabaseSeeder,
  sendEmailBroadcast,
  getBroadcastHistory
} from "../controllers/superAdmin.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import isSuperAdmin from "../middlewares/isSuperAdmin.js";

const superAdminRouter = express.Router();

// Apply auth & super admin role checks to all subroutes
superAdminRouter.use(verifyUserToken);
superAdminRouter.use(isSuperAdmin);

superAdminRouter.get("/config", getSystemConfig);
superAdminRouter.put("/config", updateSystemConfig);
superAdminRouter.post("/impersonate", impersonateUser);
superAdminRouter.get("/logs", getAuditLogs);
superAdminRouter.get("/metrics", getSystemMetrics);
superAdminRouter.get("/error-analytics", getErrorAnalytics);

superAdminRouter.get("/collections", getCollectionsList);
superAdminRouter.get("/export/:collectionName", exportCollection);
superAdminRouter.post("/seed", runDatabaseSeeder);
superAdminRouter.post("/broadcast", sendEmailBroadcast);
superAdminRouter.get("/broadcasts", getBroadcastHistory);

export default superAdminRouter;
