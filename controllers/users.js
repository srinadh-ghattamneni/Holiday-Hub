const User = require("../models/user.js");
const generateOtp = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");
const COOLDOWN_PERIOD = 1 * 60 * 1000; // 60 seconds cooldown

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
}

module.exports.signup = async (req, res) => {
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

module.exports.renderOtpForm = async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });

  let cooldown = 0;
  if (user && user.lastOtpSent) {
    const timeElapsed = Date.now() - user.lastOtpSent;
    if (timeElapsed < COOLDOWN_PERIOD) {
      cooldown = Math.ceil((COOLDOWN_PERIOD - timeElapsed) / 1000);
    }
  }
  res.render("users/verifyOtp.ejs", { email, cooldown });
};

module.exports.verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    req.flash("error", "Email and OTP are required.");
    return res.redirect("/signup");
  }

  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "Invalid email.");
    return res.render("users/verifyOtp.ejs", { email, cooldown: 60 });
  }

  if (!user.otp || user.otp.trim() !== otp.trim() || user.otpExpires < Date.now()) {
    req.flash("error", "Invalid or expired OTP.");

    let cooldown = 0 ;
    if (user.lastOtpSent) {
      const timeElapsed = Date.now() - user.lastOtpSent;
      if (timeElapsed < COOLDOWN_PERIOD) {
        cooldown = Math.ceil((COOLDOWN_PERIOD - timeElapsed) / 1000);

      }
    }

    return res.render("users/verifyOtp.ejs", { email, cooldown });
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

  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "No user found with this email.");
    return res.redirect("/signup");
  }

  if (user.emailVerified) {
    req.flash("error", "Email is already verified.");
    return res.redirect("/login");
  }

  const now = Date.now();
  if (user.lastOtpSent && now - user.lastOtpSent < COOLDOWN_PERIOD) {
    req.flash(
      "error",
      `Please wait ${Math.ceil(
        (COOLDOWN_PERIOD - (now - user.lastOtpSent)) / 1000
      )} seconds before requesting another OTP.`
    );
    return res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
  }

  // Generate a new OTP
  const otp = generateOtp();
  user.otp = otp;
  user.otpExpires = now + 5 * 60 * 1000; // Set expiry for 5 minutes
  user.lastOtpSent = now; // Update last OTP sent time
  await user.save();

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

};


module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
}

// actually afterLogin, coz login is done by passport
module.exports.login = async (req, res) => {
  req.flash("success", "You are logged in!");
  const redirectUrl = res.locals.redirectUrl || "/listings"; // Fallback to /listings if no redirect URL

  res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out Successfully!");
    res.redirect("/listings");
  });
}