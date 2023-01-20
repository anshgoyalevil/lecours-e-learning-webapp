const express = require('express');
const router = express.Router();
const notesController = require("../controllers/notesController");

//Get request for "/notes" route
router.get("/notes", notesController.getNotesPage);

//Post request for "/submit" route
router.post("/submit", notesController.postNote);

//Post request for "/delete" route
router.post("/delete", notesController.deleteNote);

module.exports = router;