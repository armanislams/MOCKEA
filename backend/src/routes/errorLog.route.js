import express from "express";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";
import { getLogs, clearLogs } from "../controllers/errorLog.controller.js";

const errorLogRouter = express.Router();

// Only admin can access these routes
errorLogRouter.use(verifyUserToken);
errorLogRouter.use(verifyUserRole(["admin"]));

errorLogRouter.get("/", getLogs);
errorLogRouter.delete("/", clearLogs);

// Temporary route to test the error logging feature
errorLogRouter.get("/test-error", (req, res, next) => {
    try {
        throw new Error("This is a deliberate test error to check the Error Logs feature.");
    } catch (err) {
        next(err);
    }
});

export default errorLogRouter;
