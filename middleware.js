const Listing = require("./models/listing");
const { listingSchema ,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review=require("./models/review");
const User = require("./models/user");


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
    if(! current_listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error","You are not the owner of this listing !");
      return res.redirect(`/listings/${id}`);
    }


    next();
}


module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

 module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      let { errMsg } = error.details.map((el) => el.message).join(".");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };



  module.exports.isReviewAuthor= async(req,res, next)=>{
    const { id , reviewId } = req.params;
    
    let review = await Review.findById(reviewId);
    if(! review.author.equals(res.locals.currUser._id)){
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
  const { username, email, password } = req.body;

  // Check if the username already exists
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    req.flash("error", "Username already exists. Please choose a different username.");
    return res.redirect("/signup");
  }

  // Check if the email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    req.flash("error", "Email already exists. Please use a different email.");
    return res.redirect("/signup");
  }

    // Validate username length (at least 4 characters)
    if (username.length < 4) {
      req.flash("error", "Username must be at least 4 characters long.");
      return res.redirect("/signup");
    }

  // Validate email format using a regular expression
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    req.flash("error", "Please enter a valid email address.");
    return res.redirect("/signup");
  }

  // Validate password (at least 5 characters with at least 1 number)
  const passwordRegex = /^(?=.*\d)[a-zA-Z\d]{5,}$/; // At least 5 characters with 1 number
  if (!passwordRegex.test(password)) {
    req.flash("error", "Password must be at least 5 characters long and contain at least one number.");
    return res.redirect("/signup");
  }

  // Proceed to the next middleware/controller if all checks pass
  next();
};

