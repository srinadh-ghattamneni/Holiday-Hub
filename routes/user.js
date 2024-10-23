const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

// Signup route (GET)
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// Signup route (POST)
router.post("/signup", wrapAsync(async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.flash("success", "Welcome to WanderLust");
    res.redirect("/listings");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}));

// Login route (GET)
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Login route (POST)
router.post("/login", passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true
}), async(req, res) => {
  req.flash("success", "You are logged in!");
  res.redirect("/listings");
});

module.exports = router;
