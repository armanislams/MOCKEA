import express from "express";
import { getReading, submitReadingAnswers, getUserReadingHistory } from "../controllers/reading.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";

const readingRouter = express.Router();

readingRouter.use(verifyUserToken);

readingRouter.get("/    ", getReading);
readingRouter.post("/submit", submitReadingAnswers);
readingRouter.get("/history/:email", getUserReadingHistory);

export default readingRouter;
