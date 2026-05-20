import express from "express";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";
import {
  getAllResources,
  incrementDownload,
  createResource,
  updateResource,
  deleteResource,
} from "../controllers/resource.controller.js";

const resourceRouter = express.Router();

// Public routes
resourceRouter.get("/", getAllResources);
resourceRouter.post("/:id/download", incrementDownload);

// Admin-only routes
resourceRouter.use(verifyUserToken);
resourceRouter.use(verifyUserRole(["admin"]));

resourceRouter.post("/", createResource);
resourceRouter.put("/:id", updateResource);
resourceRouter.delete("/:id", deleteResource);

export default resourceRouter;
