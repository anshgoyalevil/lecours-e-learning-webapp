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
deepai.setApiKey(process.env.API_KEY);
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
app.use(session({
    secret: "My little secret",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URI);

const botName = "LeCours Bot";

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

const courseSchema = new mongoose.Schema({
    cid: Number,
    name: String,
    image: String,
    desc: String,
});

const Course = new mongoose.model("Course", courseSchema);

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

// webDev.save();
// appDev.save();

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/keepclone",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));

////////////////////////////////App.* Requests//////////////////////////////

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/notes", function (req, res) {
    if (req.isAuthenticated()) {

        const notes = req.user.notes;

        res.render("notespage", {notes: notes});
    }
    else {
        res.redirect("/login");
    }
});

app.get("/login", function (req, res) {
    if(req.isAuthenticated()){
        res.redirect("/courses");
    }
    else{
        res.render("login");
    }
});

app.get("/register", function (req, res) {
    if(req.isAuthenticated()){
        res.redirect("/courses");
    }
    else{
        res.render("register");
    }
});

app.get("/courses", async function (req, res) {
    if (req.isAuthenticated()) {

        const courses = await Course.find({});
        const username = req.user.name;
        //console.log(courses);

        res.render("courses", {
            courses: courses,
            username: username
        });
    }
    else {
        res.redirect("/login");
    }
});


///////////////////Image Processing////////////////////


app.get("/image-processor", function (req, res) {
    res.render("imageprocessor");
});

var files = [];
var i = 0;
var score = -1;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "." + _.lowerCase(path.extname((file.originalname))));
    }
});

var upload = multer({ storage: storage });

var multipleUpload = upload.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }]);

app.post("/upload", multipleUpload, function (req, res) {
    if (req.files) {
        console.log("file uploaded successfully");
        const testFolder = 'public/uploads';
        fs.readdirSync(testFolder).forEach(file => {
            files[i] = file;
            i++;
        });

        (async function() {
            var resp = await deepai.callStandardApi("image-similarity", {
                image1: fs.createReadStream("public/uploads/" + files[0]),
                image2: fs.createReadStream("public/uploads/" + files[1]),
            });
            score = resp.output.distance;
            res.redirect("/processedResult");
        })()
    }
    
});

app.get("/processedResult", function (req, res) { 
    res.render("processedResult", {
        score: score,
    });
 });

////////////////Image Processor Scripts End Here/////////////////

app.get("/courses/:room", function (req, res) { 
    if(req.isAuthenticated()){

        console.log(req.params.room);
        
        res.render("coursePage");

    }
 });

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

app.post("/register", function (req, res) {

    const name = req.body.name;

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                
                User.findOneAndUpdate({_id: req.user.id}, {$set: {name: name}}, function (err) { 
                    if(!err){
                        res.redirect("/courses");
                    }
                 });

                //res.redirect("/courses");
            });
        }
    });

});

app.post("/login", function (req, res) {

        const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/courses");
            });
        }
    });

});

app.post("/submit", function (req, res) {

    if (req.isAuthenticated()) {

        const submittedTitle = req.body.title;
        const submittedBody = req.body.body;
        const pg = req.body.pg;
        const newObj = {
            id: uniqid(),
            title: submittedTitle,
            body: submittedBody,
        };

        User.findOneAndUpdate({_id: req.user.id}, {$push: {notes: newObj}}, function (err) { 
            if(!err){
                console.log();
                
                if(pg === "np"){
                    res.redirect("/notes");
                }
                else{
                    res.status(204).send();
                }
            
            }
         });
    }
    else {
        res.redirect("/login");
    }

});

app.post("/delete", function (req, res) {

    if (req.isAuthenticated()) {

        const deleteId = req.body.delete;

        User.findOneAndUpdate({_id: req.user.id}, {$pull: {notes: {id: deleteId}}}, function (err, results) { 
            if(!err){
              res.redirect("/notes");
            }
           });
    }
    else {
        res.redirect("/login");
    }

});

//////////////////////////////////////////Socket.io Requests Start//////////////////////////////////////////

// Run when client connects
io.on("connection", (socket) => {
    console.log(io.of("/").adapter);
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

////////////////////////////////////////////////Socket.io Requests End///////////////////////////////////////////////
const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
    console.log("App successfully spinned up on port 3000");
});