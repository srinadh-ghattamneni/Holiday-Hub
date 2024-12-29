const Listing = require("./models/listing");
const { listingSchema ,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review=require("./models/review")

// module.exports.isLoggedIn =(req,res,next)=>{
//     if(!req.isAuthenticated())
//         {
//             req.session.redirectUrl=req.originalUrl;
//             req.flash("error", "You must be logged in to perform this action !");// same for both listings and reviews
//             console.log("Redirect URL saved:", req.session.redirectUrl); // Debug log
            
//         return res.redirect("/login");
//           }
//           next();
// }



module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
      // Save the original URL
      req.session.originalUrl = req.originalUrl;
      console.log("Original URL saved:", req.session.originalUrl); // Debug log

      // Trim the URL to create a new redirect URL
      const match = req.originalUrl.match(/^\/listings\/([^/]+)/);
      if (match) {
          req.session.redirectUrl = `/listings/${match[1]}`; // Save the URL only up to the listing ID
      } else {
          req.session.redirectUrl = "/"; // Fallback to the root if no listing ID is found
      }

      req.flash("error", "You must be logged in to perform this action!"); // Same for both listings and reviews
      console.log("Trimmed Redirect URL saved:", req.session.redirectUrl); // Debug log

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
  console.log(req.body);
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