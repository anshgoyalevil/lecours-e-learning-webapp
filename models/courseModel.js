const mongoose = require('mongoose');

//Single Course Model Schema for MongoDB (Mongoose)
const courseSchema = new mongoose.Schema({
    cid: String,
    name: String,
    image: String,
    desc: String,
    videoUrl: String,
});

//Compiling Single Course Schema into Course Model
const Course = new mongoose.model("Course", courseSchema);

//Demo Courses JSON Objects
const appDev = new Course({
    cid: "abcd",
    name: "The Complete App Developers Bootcamp",
    image: "https://img.freepik.com/free-vector/web-developers-courses-computer-programming-web-design-script-coding-study-computer-science-student-learning-interface-structure-components_335657-2542.jpg",
    desc: "Learn app development by the industry experts and get hands on experience",
    videoUrl: "",
});

const webDev = new Course({
    cid: "efgh",
    name: "The Complete Web Developers Bootcamp",
    image: "https://www.learnatrise.in/wp-content/uploads/2019/01/full-stack-web-development-course.png",
    desc: "Learn web development by the industry experts and get hands on experience",
    videoUrl: "",
});

// Comment out below two lines to prevent addition of duplicate course objects into MongoDB.
// webDev.save();
// appDev.save();

module.exports = Course;