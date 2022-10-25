//Node Modules and Dependencies
require("dotenv").config();
const uniqid = require('uniqid');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const redis = require("redis");
const _ = require("lodash");
const multer = require('multer');
const deepai = require('deepai');
const fs = require('fs');
require("dotenv").config();
const { createClient } = redis;
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const server = http.createServer(app);
const io = socketio(server);

//Setting DeepAI.org API Key for Deep Learning API
deepai.setApiKey(process.env.API_KEY);

//Session & Cookie Management Plugging in
app.use(session({
    secret: "My little secret",
    resave: false,
    saveUninitialized: false,
}));

//Passport (Authorization Module) Plugging in
app.use(passport.initialize());
app.use(passport.session());

/*
Mongoose Connection URL
- Use 'mongodb://127.0.0.1:27017/courseDB' for local installation of MongoDB
- Use process.env.DB_URI for MongoDB hosted on Atlas
- Define DB_URI in the .env file, where it's value has to be the connection URL provided by MongoDB Atlas Cluster.
*/
mongoose.connect('mongodb://127.0.0.1:27017/courseDB');

//Bot Name for Live Chat Module
const botName = "LeCours Bot";

//User Schema for MongoDB (Mongoose)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    googleId: String,
    notes: [{
        id: String,
        title: String,
        body: String,
    }],
});

//Single Course Model Schema for MongoDB (Mongoose)
const courseSchema = new mongoose.Schema({
    cid: Number,
    name: String,
    image: String,
    desc: String,
});

//Compiling Single Course Schema into Course Model
const Course = new mongoose.model("Course", courseSchema);

//Demo Courses JSON Objects
const appDev = new Course({
    cid: 2,
    name: "The Complete App Developers Bootcamp",
    image: "https://img.freepik.com/free-vector/web-developers-courses-computer-programming-web-design-script-coding-study-computer-science-student-learning-interface-structure-components_335657-2542.jpg",
    desc: "Learn app development by the industry experts and get hands on experience"
});

const webDev = new Course({
    cid: 1,
    name: "The Complete Web Developers Bootcamp",
    image: "https://www.learnatrise.in/wp-content/uploads/2019/01/full-stack-web-development-course.png",
    desc: "Learn web development by the industry experts and get hands on experience"
});

// Comment out below two lines to prevent addition of duplicate course objects into MongoDB.
// webDev.save();
// appDev.save();

//Plugging in Mongoose Plugin for Passport
userSchema.plugin(passportLocalMongoose);

//Plugging in findOrCreate helper module for Mongoose to create or find user object
userSchema.plugin(findOrCreate);

//Compiling User Schema into User Model
const User = new mongoose.model("User", userSchema);

//Plugging in Passport User Creation Strategy
passport.use(User.createStrategy());

//Persisting user data into session and cookies (After successful authentication)
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//Retrieving user data from saved session and cookies
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

//Plugging in Gooogle OAuth2.0 Authentication Strategy and adding Client ID, Cliet Secret and Callback URL.
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/keepclone",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        //Creating User object if not found already inside the database
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));

//Get request for "/" route
app.get("/", function (req, res) {
    res.render("home");
});

//Get request for "/notes" route
app.get("/notes", function (req, res) {
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
});

//Get request for "/login" route
app.get("/login", function (req, res) {
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
app.get("/register", function (req, res) {
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

//Get request for "/courses" route
app.get("/courses", async function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        const courses = await Course.find({});
        const username = req.user.name;
        //Render "courses" page if user is logged-in
        res.render("courses", {
            courses: courses,
            username: username
        });
    }
    else {
        //Redirect to "/login" page if user is not logged-in
        res.redirect("/login");
    }
});

//Get request for "/image-processor" route
app.get("/image-processor", function (req, res) {
    //Render "imageprocessor" page
    res.render("imageprocessor");
});

//Get request for "/processedResult" route
app.get("/processedResult", function (req, res) {
    //Render "processedResult" page and pass the score variable
    res.render("processedResult", {
        score: score,
    });
});

//Get request for a course's page (Room)
app.get("/courses/:room", function (req, res) {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        //Render "coursePage" page if user is logged-in
        res.render("coursePage");
    }
});

//Get request for "/logout" route
app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/");
        }
    });
});

var files = [];
var i = 0;
var score = -1;

//Multer (Uploading Images to Disk)
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //Path where the files would be uploaded
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        //Modify the name of the uploaded file
        cb(null, file.fieldname + "." + _.lowerCase(path.extname((file.originalname))));
    }
});

var upload = multer({ storage: storage });
var multipleUpload = upload.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }]);

//Post reqest for "/upload" route
app.post("/upload", multipleUpload, function (req, res) {
    if (req.files) {
        console.log("file uploaded successfully");
        const testFolder = 'public/uploads';
        //Read uploaded files from the server
        fs.readdirSync(testFolder).forEach(file => {
            files[i] = file;
            i++;
        });
        //DeepAI.org Image Similarity Async API Call
        (async function () {
            var resp = await deepai.callStandardApi("image-similarity", {
                image1: fs.createReadStream("public/uploads/" + files[0]),
                image2: fs.createReadStream("public/uploads/" + files[1]),
            });
            score = resp.output.distance;
            //Redirect to "/processedResult" page after the API call return a response
            res.redirect("/processedResult");
        })()
    }
});

//Post request for "/register" route
app.post("/register", function (req, res) {
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
app.post("/login", function (req, res) {
    //Create user object from the login form data
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
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
});

//Post request for "/submit" route
app.post("/submit", function (req, res) {
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
});

//Post request for "/delete" route
app.post("/delete", function (req, res) {
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

});

//Run when client connects
io.on("connection", (socket) => {
    console.log(io.of("/").adapter);
    //Join the room using the username of the current user, and room name as the name of the course, which the student is currently watching
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        // Welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to LeCours!"));
        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has joined the chat`)
            );
        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });
    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });
    // Runs when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat`)
            );
            // Send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

//3000 for localhost (127.0.0.1) and dynamic port for Heroku and other Node.JS services
const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
    console.log("App successfully spinned up on port 3000");
});