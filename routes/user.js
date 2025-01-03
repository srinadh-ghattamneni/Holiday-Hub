const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl,validateSignup } = require("../middleware.js");
const userController =require("../controllers/users.js");

router.route("/signup")
// Signup route (GET)
.get( userController.renderSignupForm)
// Signup route (POST)
.post(validateSignup, wrapAsync(userController.signup));


router.post("/resend-otp", wrapAsync(userController.resendOtp));

router.route("/verify-otp")
.get( userController.renderOtpForm)
.post( wrapAsync(userController.verifyOtp));

router.route("/login")
// Login route (GET)
.get(userController.renderLoginForm)
// Login route (POST)
.post(saveRedirectUrl, passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }), userController.login);


// Forgot Password
router.route("/forgot-password")
    .get(userController.renderForgotPasswordForm)
    .post(wrapAsync(userController.forgotPassword));

// Reset Password
router.route("/reset-password/:token")
    .get(wrapAsync(userController.renderResetPasswordForm))
    .post(wrapAsync(userController.resetPassword));

// Logout route
router.get("/logout",userController.logout);
      
module.exports = router;
