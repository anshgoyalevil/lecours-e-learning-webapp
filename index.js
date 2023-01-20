//Node Modules and Dependencies
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const redis = require("redis");
const deepai = require('deepai');
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
    secret: process.env.APP_SEC,
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
mongoose.connect(process.env.DB_URI);

//Bot Name for Live Chat Module
const botName = "LeCours Bot";

//Course and User Models
const Course = require("./models/courseModel");
const User = require("./models/userModel");

//Importing routers
const notesRouter = require("./routes/notesRouter");
const authRouter = require("./routes/authRouter");
const imageaiRouter = require("./routes/imageaiRouter");
const homeRouter = require("./routes/homeRouter");
const courseRouter = require("./routes/courseRouter");

//Plugging in routers
app.use(notesRouter);
app.use(authRouter);
app.use(imageaiRouter);
app.use(homeRouter);
app.use(courseRouter);

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