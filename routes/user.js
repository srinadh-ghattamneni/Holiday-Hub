const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


const userController =require("../controllers/users.js");
// Signup route (GET)
router.get("/signup", userController.renderSignupForm);

// Signup route (POST)
router.post("/signup", wrapAsync(userController.signup));

// Login route (GET)
router.get("/login", userController.renderLoginForm);

// Login route (POST)
router.post("/login", saveRedirectUrl, passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }), userController.login);
    
      
//logout

// Logout route
router.get("/logout",userController.logout);
      
module.exports = router;
