const express= require("express");
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn ,isOwner,validateListing} = require("../middleware.js");
const listingController =require("../controllers/listings.js");

router.route("/")
//Index Route
.get(wrapAsync(listingController.index))
  // Create Route modifed to accept the correct image format 
.post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//New Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
 // Show Route with reviews
 .get(wrapAsync(listingController.showListing))
    // Update Route modifed to correctly store the image as object
.put( isLoggedIn,isOwner,validateListing, wrapAsync(listingController.updateListing))
  //Delete Route
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));

  //Edit Route
  router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));
  
  module.exports = router;