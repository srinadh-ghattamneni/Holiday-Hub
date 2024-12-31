const express= require("express");
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn ,isOwner,validateListing,clearRedirectUrl} = require("../middleware.js");
const listingController =require("../controllers/listings.js");

const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage});



router.route("/")
//Index Route
.get(clearRedirectUrl,wrapAsync(listingController.index))
  // Create Route modifed to accept the correct image format 
.post(isLoggedIn,
  upload.single('listing[image][url]'),
  validateListing,
   wrapAsync(listingController.createListing));


//New Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
 // Show Route with reviews
 .get(wrapAsync(listingController.showListing))
    // Update Route modifed to correctly store the image as object
.put( isLoggedIn,isOwner,
  upload.single('listing[image][url]'),
  validateListing, wrapAsync(listingController.updateListing))
  //Delete Route
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));

  //Edit Route
  router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));
  
  module.exports = router;