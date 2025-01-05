const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, validateSignup, validateLogin, validateResetPassword } = require("../middleware.js");
const userController = require("../controllers/users.js");
const customRateLimiter = require("../utils/expressRateLimit.js");

// Create rate limiters using customRateLimiter
const loginRateLimiter = customRateLimiter(15 * 60 * 1000, 30, "Too many login attempts, please try again later.");
const signupRateLimiter = customRateLimiter(15 * 60 * 1000,30,"Too many signup attempts, please try again later.");
const resendOtpRateLimiter = customRateLimiter(10 * 60 * 1000,20,"Too many OTP resend attempts, please try again later.");
const verifyOtpRateLimiter = customRateLimiter(10 * 60 * 1000,30,"Too many OTP verification attempts, please try again later.");
const forgotPasswordRateLimiter = customRateLimiter(10 * 60 * 1000,30,"Too many forgot password attempts, please try again later.");
const resetPasswordRateLimiter = customRateLimiter(10 * 60 * 1000,10,"Too many reset password attempts, please try again later.");

router.route("/signup")
  // Signup route (GET)
  .get(userController.renderSignupForm)
  // Signup route (POST)
  .post(signupRateLimiter, validateSignup, wrapAsync(userController.signup));

router.post("/resend-otp", resendOtpRateLimiter, wrapAsync(userController.resendOtp));

router.route("/verify-otp")
  .get(userController.renderOtpForm)
  .post(verifyOtpRateLimiter, wrapAsync(userController.verifyOtp));

router.route("/login")
  // Login route (GET)
  .get(userController.renderLoginForm)
  // Login route (POST)
  .post(saveRedirectUrl, loginRateLimiter, validateLogin, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }), userController.login);


// Forgot Password
router.route("/forgot-password")
  .get(userController.renderForgotPasswordForm)
  .post(forgotPasswordRateLimiter, wrapAsync(userController.forgotPassword));

// Reset Password
router.route("/reset-password/:token")
  .get(wrapAsync(userController.renderResetPasswordForm))
  .post(resetPasswordRateLimiter, validateResetPassword, wrapAsync(userController.resetPassword));

// Logout route
router.get("/logout", userController.logout);

module.exports = router;
