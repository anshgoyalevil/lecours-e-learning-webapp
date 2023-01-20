const express = require('express');
const router = express.Router();

//Get request for "/" route
router.get("/", function (req, res) {
    res.render("home");
});

//Get reqest for "/contact" route
router.get("/contact", function (req, res) {
    res.render("contact");
});

module.exports = router;