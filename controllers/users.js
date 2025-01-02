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
     console.log("------\n",registeredUser);
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
    return res.redirect("/verify-otp");
}
  // Find user and validate OTP
  const user = await User.findOne({ email });

  if (!user ) {
    req.flash("error", "Invalid email");
    return res.redirect("/verify-otp");
  }


 // Check if OTP has expired
 if (user.otpExpires < Date.now()) {
  user.otp = undefined;  // Clear expired OTP
  user.otpExpires = undefined;
  await user.save();
}

 // is someone directly tries to access the verify-otp router
  if ( !user.otp) {
    req.flash("error", " OTP not found.");
    return res.redirect("/verify-otp");
  }

  if (  user.otp.trim() !== otp.trim() || user.otpExpires < Date.now() ) {
    req.flash("error", "Invalid or expired OTP!");
    return res.redirect("/verify-otp");
  }

  // Clear OTP fields and mark email as verified
  user.otp = undefined;
  user.otpExpires = undefined;
  user.emailVerified = true;  // Set emailVerified to true after successful OTP verification
  await user.save();

  req.flash("success", "Signup Successful !");

  // Log the user in after successful verification
  req.login(user, (err) => {
      if (err) {
          return next(err); // Pass the error to your error handler
      }
      req.flash("success", "Welcome to WanderLust!");
      return res.redirect("/listings");
  });
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