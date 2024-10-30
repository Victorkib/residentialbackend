// routes/noteRoutes.js
import express from "express";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../../../controllers/v2/controllers/noteController.js";

const router = express.Router();

router.get("/getAllNotes/:tenantId", getNotes); //where we stopped from last night
router.post("/postNote", createNote);
router.put("/updateNote/:id", updateNote);
router.delete("/deleteNote/:id", deleteNote);

export default router;
