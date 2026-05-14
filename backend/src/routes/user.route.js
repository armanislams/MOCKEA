import express from "express";
import {
    getAllUser,
    getUserRole,
    postUser,
    updateUserRole,
    updateUserPlan,
    deleteUser,
    toggleBanUser,
} from "../controllers/user.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";

const userRouter = express.Router();

userRouter.post("/register", postUser);

userRouter.use(verifyUserToken);

// Authenticated user routes
userRouter.get("/all", getAllUser);
userRouter.get("/:email/role", getUserRole);

// Admin-only routes
userRouter.patch("/:id/role", verifyUserRole(["admin"]), updateUserRole);
userRouter.patch("/:id/plan", verifyUserRole(["admin"]), updateUserPlan);
userRouter.delete("/:id", verifyUserRole(["admin"]), deleteUser);
userRouter.patch("/:id/ban", verifyUserRole(["admin"]), toggleBanUser);

export default userRouter;