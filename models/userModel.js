const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const passport = require("passport");

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

module.exports = User;