const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");

//Get request for "/login" route
router.get("/login", authController.getLoginPage);

//Get request for "/register" route
router.get("/register", authController.getRegisterPage);

//Get request for "/logout" route
router.get("/logout", authController.getLogout);

//Post request for "/register" route
router.post("/register", authController.postRegister);

//Post request for "/login" route
router.post("/login", authController.postLogin);

module.exports = router;