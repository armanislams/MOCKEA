import express from "express"
const userRouter = express.Router();


userRouter.get("/", (req, res) => {
    res.send("User route is running");
})

export default userRouter;