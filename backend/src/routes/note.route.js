import express from "express";
import { getAllNotes, getNotesByUser, postNote } from "../controllers/note.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";

const noteRouter = express.Router();

noteRouter.use(verifyUserToken)
noteRouter.get("/",getAllNotes)
noteRouter.get("/:email",getNotesByUser)
noteRouter.post("/post",postNote)

export default noteRouter;