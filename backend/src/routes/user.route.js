import express from "express"
import { getAllUser, postUser } from "../controllers/user.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";
const userRouter = express.Router();

// All routes require authentication
userRouter.use(verifyUserToken)

// Public user routes (authenticated users)
userRouter.post("/register", postUser)
userRouter.get('/all', getAllUser)


// Admin-only routes - get all users
// userRouter.get("/all", verifyUserRole(["admin"]), getAllUser)

export default userRouter;