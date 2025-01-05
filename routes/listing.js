const express= require("express");
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn ,isOwner,validateListing,clearRedirectUrl} = require("../middleware.js");
const listingController =require("../controllers/listings.js");
const customRateLimiter = require("../utils/expressRateLimit"); // Import rate limiter
const { upload } = require("../cloudConfig.js");
const Listing = require("../models/listing");

// Apply rate limiter to certain routes
const listingRateLimiter = customRateLimiter(15 * 60 * 1000,30,
   "Too many requests, please try again later."); // 15 minutes window, max 40 requests

const searchRateLimiter = customRateLimiter(20* 60 * 1000,100,
    "Too many requests, please try again later."); 

// Add rate limiting to the search route
router.get('/search', searchRateLimiter , wrapAsync(listingController.searchListings));


router.route("/")
//Index Route
.get(clearRedirectUrl,wrapAsync(listingController.index))
  // Create Route modifed to accept the correct image format 
.post(isLoggedIn,listingRateLimiter,
  upload.single('listing[image][url]'),
  validateListing,
   wrapAsync(listingController.createListing));


//New Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
 // Show Route with reviews
 .get(wrapAsync(listingController.showListing))
    // Update Route modifed to correctly store the image as object
.put( isLoggedIn,isOwner,listingRateLimiter,
  upload.single('listing[image][url]'),
  validateListing, wrapAsync(listingController.updateListing))
  //Delete Route
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));

  //Edit Route
  router.get("/:id/edit", isLoggedIn,isOwner,listingRateLimiter,wrapAsync(listingController.renderEditForm));
  
  module.exports = router;