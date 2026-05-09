import express from "express";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import { getAnalyticsSummary } from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

analyticsRouter.use(verifyUserToken);
analyticsRouter.get("/summary/:email", getAnalyticsSummary);

export default analyticsRouter;
