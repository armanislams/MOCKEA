import express from "express";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";
import {
  getAllResources,
  incrementDownload,
  createResource,
  updateResource,
  deleteResource,
  getAllResourcesForManagement,
} from "../controllers/resource.controller.js";

const resourceRouter = express.Router();

// Public routes
resourceRouter.get("/", getAllResources);
resourceRouter.post("/:id/download", incrementDownload);

// Secure admin/instructor routes
resourceRouter.use(verifyUserToken);
resourceRouter.use(verifyUserRole(["admin", "instructor"]));

resourceRouter.get("/manage", getAllResourcesForManagement);
resourceRouter.post("/", createResource);
resourceRouter.put("/:id", updateResource);
resourceRouter.delete("/:id", deleteResource);

export default resourceRouter;
