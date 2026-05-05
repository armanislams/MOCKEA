import express from "express"
import { getAllUser, postUser } from "../controllers/user.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";
const userRouter = express.Router();

userRouter.use(verifyUserToken)

userRouter.get("/all", getAllUser)
userRouter.post("/register", postUser)

export default userRouter;