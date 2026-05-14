import express from "express";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";
import { getAnalyticsSummary, getAdminAnalytics } from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

analyticsRouter.use(verifyUserToken);
analyticsRouter.get("/summary/:email", getAnalyticsSummary);
analyticsRouter.get("/admin", verifyUserRole(["admin"]), getAdminAnalytics);

export default analyticsRouter;
