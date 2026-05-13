import express from "express"
import { getAllUser, getUserRole, postUser } from "../controllers/user.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";
const userRouter = express.Router();

// Public routes (No authentication required)
userRouter.post("/register", postUser)

// All routes below this line require authentication
userRouter.use(verifyUserToken)

// Authenticated user routes
userRouter.get('/all', getAllUser)
userRouter.get('/:email/role', getUserRole)


// Admin-only routes - get all users
// userRouter.get("/all", verifyUserRole(["admin"]), getAllUser)

export default userRouter;