const Listing = require("./models/listing");
const { listingSchema ,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review=require("./models/review");
const User = require("./models/user");
const Joi = require('joi');
const { userSchema } = require('./schema');
const { cloudinary } = require("./cloudConfig");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
      // Save the original URL
      req.session.originalUrl = req.originalUrl;
      //console.log("Original URL saved:", req.session.originalUrl); // Debug log

      // Trim the URL to create a new redirect URL
      const match = req.originalUrl.match(/^\/listings\/([^/]+)/);
      if (match) {
          req.session.redirectUrl = `/listings/${match[1]}`; // Save the URL only up to the listing ID
      } else {
          req.session.redirectUrl = "/"; // Fallback to the root if no listing ID is found
      }

      req.flash("error", "You must be logged in to perform this action!"); // Same for both listings and reviews
      //console.log("Trimmed Redirect URL saved:", req.session.redirectUrl); // Debug log

      return res.redirect("/login");
  }
  next();
};



module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner= async(req,res, next)=>{
    const { id } = req.params;
    
    let current_listing = await Listing.findById(id);
    if(!current_listing  ){
      req.flash("error","No such listing !");
      return res.redirect(`/listings/${id}`);
    }
    if( !current_listing.owner  ||    ! current_listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error","You are not the owner of this listing !");
      return res.redirect(`/listings/${id}`);
    }


    next();
}


module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      cloudinary.uploader.destroy(req.body.listing.image.filename, { invalidate: true });
      const errMsg = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

  module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(".");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };
  

  module.exports.isReviewAuthor= async(req,res, next)=>{
    const { id , reviewId } = req.params;
    
    let review = await Review.findById(reviewId);
    if(!review  ){
      req.flash("error","No such review !");
      return res.redirect(`/listings/${id}`);
    }
    if( !review.author  || !review.author.equals(res.locals.currUser._id)){
      req.flash("error","You are not the author of this review !");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.clearRedirectUrl = (req, res, next) => {
  // Reset the redirectUrl to "/listings" , the "All Listings" page
  req.session.redirectUrl = "/listings"; // Default to "All Listings"
  next();
};



module.exports.validateSignup = async (req, res, next) => {
  try {
    req.body.email = req.body.email.trim();
    const { error } = userSchema.validate(req.body);
    if (error) {
      // If validation fails, send a response with the error message
      req.flash("error", error.details.map(el => el.message).join(", "));
      return res.redirect("/signup");
    }
    const existingUsername = await User.findOne({ username: req.body.username });
    const existingEmail = await User.findOne({ email: req.body.email });

    if (existingUsername) {
      req.flash("error", "Username already exists. Please choose a different username.");
      return res.redirect("/signup");
    }

    if (existingEmail) {
      req.flash("error", "Email already exists. Please use a different email.");
      return res.redirect("/signup");
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Simplified `validateLogin` middleware using the email and password fields of userSchema
module.exports.validateLogin = (req, res, next) => {
  
  const loginSchema = Joi.object({
    username: userSchema.extract('username').required(),
    password: userSchema.extract('password').required(),
  });

  const { error } = loginSchema.validate(req.body);
  if (error) {
    req.flash("error", error.details.map(el => el.message).join(", "));
    return res.redirect("/login");
  }

  next();
};



module.exports.validateResetPassword = (req, res, next) => {
  const resetPasswordSchema = Joi.object({
    password: userSchema.extract('password').required(),  // Extracting password validation from userSchema
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords must match'
    })
  });

  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    req.flash("error", error.details.map(el => el.message).join(", "));
    return res.redirect(`/reset-password/${req.params.token}`); // Redirecting back to the reset password page with the error message
  }

  next();
};

