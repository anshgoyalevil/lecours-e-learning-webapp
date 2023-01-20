const express = require('express');
const router = express.Router();
const Course = require("../models/courseModel");
const uniqid = require('uniqid');

//Get request for "/courses" route
router.get("/courses", async function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        const courses = await Course.find({});
        const username = req.user.name;
        //Creat unique session id to prevent username morphing in URL
        var sessionId = 0;
        for(var i = 0; i<username.length; i++){
            sessionId = sessionId+(username.charCodeAt(i)*i);
        }
        //Render "courses" page if user is logged-in
        res.render("courses", {
            courses: courses,
            username: username,
            sessionId: sessionId
        });
    }
    else {
        //Redirect to "/login" page if user is not logged-in
        res.redirect("/login");
    }
});



//Get request for a course's page (Room)
router.get("/courses/:room", function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        //Render "coursePage" page if user is logged-in
        res.render("coursePage");
    }
    else{
        //Redirect to "/login" page if user is not logged-in
        res.redirect("/login");
    }
});

//Get request for a course's page (Room)
router.get("/add-video", function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        //Render "coursePage" page if user is logged-in
        res.render("addCourse");
    }
    else{
        //Redirect to "/login" page if user is not logged-in
        res.redirect("/login");
    }
});

//Post request for "/add-video" route
router.post("/add-video", function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        const submittedVideoName = req.body.videoName;
        const submittedVideoUrl = req.body.videoUrl;
        const submittedImageUrl = req.body.imageUrl;
        const submittedVideoDsc = req.body.videoDsc;
        //Create JSON object for a single course object
        const newObj = new Course({
            cid: uniqid(), //Unique ID will be generated using the Uniqid NPM Module
            name: submittedVideoName,
            image: submittedImageUrl,
            desc: submittedVideoDsc,
            videoUrl: submittedVideoUrl,
        });
        //Save newly created object to database
        newObj.save();
        res.redirect("/courses");
    }
    else {
        res.redirect("/login");
    }
});

module.exports = router;