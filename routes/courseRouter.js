const express = require('express');
const router = express.Router();
const courseController = require("../controllers/courseController");

//Get request for "/courses" route
router.get("/courses", courseController.getCourses);

//Get request for a course's page (Room)
router.get("/courses/:room", courseController.getCustomCourse);

//Get request for a course's page (Room)
router.get("/add-video", courseController.getAddVideoPage);

//Post request for "/add-video" route
router.post("/add-video", courseController.postAddVideo);

module.exports = router;