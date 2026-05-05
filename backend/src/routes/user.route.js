import express from "express"
import { getAllUser, postUser } from "../controllers/user.controller.js";
const userRouter = express.Router();


userRouter.get("/all", getAllUser)
userRouter.post("/save", postUser)

export default userRouter;