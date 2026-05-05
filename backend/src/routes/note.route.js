import express from "express";
import { getAllNotes, getNotesByUser, postNote } from "../controllers/note.controller.js";

const noteRouter = express.Router();

noteRouter.get("/",getAllNotes)
noteRouter.get("/:email",getNotesByUser)
noteRouter.post("/post",postNote)

export default noteRouter;