const User = require("../models/user.js");
const  generateOtp  = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");

module.exports.renderSignupForm=(req, res) => {
    res.render("users/signup.ejs");
  }

module.exports.signup =async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    
     // Generate OTP and save to user
     const otp = generateOtp();
     registeredUser.otp = otp;
     registeredUser.otpExpires = Date.now() + 5 * 60 * 1000;
   
     await registeredUser.save();


    //  Send OTP via email in HTML format
     const verificationCodeHtml = `
     <p>Your OTP is: <strong>${otp}</strong></p>
     <p>Please enter this code to verify your email address. This code will expire in 5 minutes.</p> `;
   await sendEmail(email, "Welcome to Wanderlust - Verify Your Email",
     "Please verify your email using the OTP.", verificationCodeHtml);

     
   req.flash("success", "OTP sent to your email.");
   //res.redirect("/verify-otp");
   res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`); // Pass email as query parameter

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};


module.exports.renderOtpForm = (req, res) => {
  const { email } = req.query; // Extract email from query parameters
  res.render("users/verifyOtp.ejs", { email });
};


module.exports.verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    req.flash("error", "Email and OTP are required.");
    return res.render("users/verifyOtp.ejs", { email }); // Pass email back to the view
  }

  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "Invalid email.");
    return res.render("users/verifyOtp.ejs", { email }); // Pass email back to the view
  }

  if (!user.otp || user.otp.trim() !== otp.trim() || user.otpExpires < Date.now()) {
    req.flash("error", "Invalid or expired OTP.");
    return res.render("users/verifyOtp.ejs", { email }); // Pass email back to the view
  }

  // Clear OTP and verify email
  user.otp = undefined;
  user.otpExpires = undefined;
  user.emailVerified = true;
  await user.save();

  req.flash("success", "Signup Successful!");
  req.login(user, (err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Welcome to Wanderlust!");
    return res.redirect("/listings");
  });
};



module.exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    req.flash("error", "Email is required.");
    return res.redirect("/signup");
  }

  try {
    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "No user found with this email.");
      return res.redirect("/signup");
    }

    // Check if the user has already verified their email
    if (user.emailVerified) {
      req.flash("error", "Email is already verified.");
      return res.redirect("/login");
    }

    // Generate a new OTP
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // Set expiry for 5 minutes
    user.lastOtpSent = new Date(); // Record the time of sending the OTP
    await user.save();

    // Send the OTP via email
    const verificationCodeHtml = `
      <p>Your new OTP is: <strong>${otp}</strong></p>
      <p>Please enter this code to verify your email address. This code will expire in 5 minutes.</p>
    `;
    await sendEmail(
      email,
      "Resend OTP - Wanderlust",
      "Here is your new OTP.",
      verificationCodeHtml
    );

    req.flash("success", "A new OTP has been sent to your email.");
    res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/signup");
  }
};




module.exports.renderLoginForm =(req, res) => {
    res.render("users/login.ejs");
  }

// actually afterLogin, coz login is done by passport
  module.exports.login=async (req, res) => {
    req.flash("success", "You are logged in!");
    const redirectUrl = res.locals.redirectUrl || "/listings"; // Fallback to /listings if no redirect URL
    
    res.redirect(redirectUrl);
}

module.exports.logout= (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Logged out Successfully!");
      res.redirect("/listings");
    });
  }