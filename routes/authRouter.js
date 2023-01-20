const express = require('express');
const router = express.Router();
const User = require("../models/userModel");
const passport = require("passport");

//Get request for "/login" route
router.get("/login", function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        //Redirect to "/courses" page if user is logged-in
        res.redirect("/courses");
    }
    else {
        //Render "login" page if user is not logged-in.
        res.render("login");
    }
});

//Get request for "/register" route
router.get("/register", function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        //Redirect to "/courses" page if user is logged-in
        res.redirect("/courses");
    }
    else {
        //Render "register" page if user is not logged-in.
        res.render("register");
    }
});

//Get request for "/logout" route
router.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/");
        }
    });
});

//Post request for "/register" route
router.post("/register", function (req, res) {
    const name = req.body.name;
    //Register a user into database
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            //Saving session cookies after successful registration
            passport.authenticate("local")(req, res, function () {
                //Find and update name of the user into database (Naming is required for Chat Rooms).
                User.findOneAndUpdate({ _id: req.user.id }, { $set: { name: name } }, function (err) {
                    if (!err) {
                        //Redirect to "/courses" page after successful registration
                        res.redirect("/courses");
                    }
                });
            });
        }
    });
});

//Post request for "/login" route
router.post("/login", async function (req, res) {
    //Create user object from the login form data
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    const userExist = await User.find({username: req.body.username});
    if (userExist.length <= 0){
        res.redirect("/register");
    }
    else{
       req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            //If user is found in database, save the login session and redirect to "/courses" page
            passport.authenticate("local")(req, res, function () {
                res.redirect("/courses");
            });
        }
    }); 
    }
    
});

module.exports = router;