import express from "express";
import {
  getTrainers,
  postTrainer,
  deleteTrainer,
} from "../controllers/trainer.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";

const trainersRouter = express.Router();

// All trainer routes require authentication
trainersRouter.use(verifyUserToken);

// General logged in users can view trainers
trainersRouter.get("/", getTrainers);

// Admin-only actions
trainersRouter.post("/add", verifyUserRole(["admin"]), postTrainer);
trainersRouter.delete("/:id", verifyUserRole(["admin"]), deleteTrainer);

export default trainersRouter;
