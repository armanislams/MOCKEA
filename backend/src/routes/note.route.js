import express from "express";
import { getNotes, postNote } from "../controllers/note.controller";

const noteRouter = express.Router();

noteRouter.get("/",getNotes)
noteRouter.post("/post",postNote)

export default noteRouter;