import express from "express";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";
import { getAnalyticsSummary, getAdminAnalytics, getInstructorAnalytics } from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

// All analytics require authentication
analyticsRouter.use(verifyUserToken);
// Populate req.user for all analytics routes
analyticsRouter.use(verifyUserRole());

// Student can see their own summary
analyticsRouter.get("/summary", getAnalyticsSummary);

// Admin can see global overview
analyticsRouter.get("/admin", verifyUserRole(["admin"]), getAdminAnalytics);

// Instructor analytics
analyticsRouter.get("/instructor", verifyUserRole(["instructor", "admin"]), getInstructorAnalytics);

export default analyticsRouter;
