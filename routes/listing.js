const express= require("express");
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));
  
  //New Route

  router.get("/new", isLoggedIn,(req, res) => {
    console.log(req.user);
    
    res.render("listings/new.ejs");
  });
  
  
  
  // Show Route without reviews
  router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");  
    if(!listing)
    {
      req.flash("error","The Listing you requested for does not exist !");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  }));
  
  
  // //Create Route
  // router.post("/", async (req, res) => {
  //   const newListing = new Listing(req.body.listing);
  //   await newListing.save();
  //   res.redirect("/listings");
  // });
  
  // Create Route modifed to accept the coorect image format 
  router.post("/", validateListing, wrapAsync(async (req, res, next) => {
  
    const { listing } = req.body;
    listing.image.filename = "listingimage";  // Set the filename directly
    const newListing = new Listing(listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New listing Created Successfully!");
    res.redirect("/listings");
  
  
  
  }));
  
  
  //Edit Route
  router.get("/:id/edit", isLoggedIn,wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing)
      {
        req.flash("error","The Listing you requested for does not exist !");
        res.redirect("/listings");
      }
    res.render("listings/edit.ejs", { listing });
  }));
  
  // //Update Route
  // router.put("/:id", async (req, res) => {
  //   let { id } = req.params;
  //   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  //   res.redirect(`/listings/${id}`);
  // });
  
  
  // Update Route modifed to correctly store the image as object
  router.put("/:id", isLoggedIn,validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { listing } = req.body;
    listing.image.filename = "listingimage";  // Set the filename directly
    await Listing.findByIdAndUpdate(id, { ...listing });
    req.flash("success", "Listing Updated Successfully !")
    res.redirect(`/listings/${id}`);
  }));
  
  
  //Delete Route
  router.delete("/:id",isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");
  }));

  module.exports = router;