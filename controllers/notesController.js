const uniqid = require('uniqid');
const User = require("../models/userModel");

exports.getNotesPage = function (req, res) {
    //Check if the user is authenticated
    if (req.isAuthenticated()) {
        const notes = req.user.notes;
        //Render "notespage" page if user is already logged-in.
        res.render("notespage", { notes: notes });
    }
    else {
        //Redirect to "/login" page if user is not logged-in
        res.redirect("/login");
    }
}

exports.postNote = function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        const submittedTitle = req.body.title;
        const submittedBody = req.body.body;
        const pg = req.body.pg;
        //Create JSON object for a single note object
        const newObj = {
            id: uniqid(), //Unique ID will be generated using the Uniqid NPM Module
            title: submittedTitle,
            body: submittedBody,
        };
        //Find user which is logged in, and insert the JSON object in that user's Notes Array
        User.findOneAndUpdate({ _id: req.user.id }, { $push: { notes: newObj } }, function (err) {
            if (!err) {
                console.log();
                //Redirect to "/notes" page if the user is currently on the "/notes" page, i.e., reloads the current page 
                if (pg === "np") {
                    res.redirect("/notes");
                }
                /*
                If the current page is not "/notes page", it will send the status code 204 to the client (request has succeeded, but that the client doesn't need to navigate away from its current page). This is useful for keeping the user on the current page while watching the lecture, as the lecture's url will not be equal to "/notes", the user will stay on the lecture page.
                */
                else {
                    res.status(204).send();
                }
            }
        });
    }
    else {
        res.redirect("/login");
    }
}

exports.deleteNote = function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        const deleteId = req.body.delete;
        //Retrieve the current user from the database, and delete the note using the id
        User.findOneAndUpdate({ _id: req.user.id }, { $pull: { notes: { id: deleteId } } }, function (err, results) {
            if (!err) {
                //Redirect to "/notes" page
                res.redirect("/notes");
            }
        });
    }
    else {
        //If user is not logged in, redirect to "/login" page
        res.redirect("/login");
    }
}