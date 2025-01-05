const Listing = require("../models/listing");
const geocoder = require("../utils/geocoder");
const { cloudinary } = require("../cloudConfig");


module.exports.index = async (req, res) => {

  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });

}

module.exports.renderNewForm = (req, res) => {

  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    }).populate("owner");


  if (!listing) {
    req.flash("error", "The Listing you requested for does not exist !");
    res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};



module.exports.createListing = async (req, res, next) => {
  const { listing } = req.body;

  // Check if an image file was uploaded
  let url, filename;
  if (req.file) {
    url = req.file.path;        // Path of the uploaded file
    filename = req.file.filename; // Filename of the uploaded file
  } else {
    // Use default image and filename if no file was uploaded
    url = "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60";
    filename = "listingimage";
  }


  // Geocode the location
  const geoData = await geocoder.geocode(listing.location);
  const coordinates = geoData[0] ?
    { lat: geoData[0].latitude, lng: geoData[0].longitude } : { lat: 28.7041, lng: 77.1025 };

  // Create a new listing with the data
  const newListing = new Listing(listing);
  newListing.owner = req.user._id; // Associate with the logged-in user
  newListing.image = { filename, url }; // Assign image details
  newListing.coordinates = coordinates;


  await newListing.save();


  req.flash("success", "New listing created successfully!");
  res.redirect("/listings");
};




module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The Listing you requested for does not exist !");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
}


module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const { listing } = req.body;


  const geoData = await geocoder.geocode(listing.location);
  const coordinates = geoData[0] ?
    { lat: geoData[0].latitude, lng: geoData[0].longitude } :
    { lat: 28.7041, lng: 77.1025 };


  let currentListing = await Listing.findByIdAndUpdate(id, { ...listing, coordinates, },{ new: true } );// Return the updated document

  // Update the image only if a new file is uploaded
  if (req.file) {
    if (currentListing.image && currentListing.image.filename) {
      await cloudinary.uploader.destroy(currentListing.image.filename);
    }
    const url = req.file.path; // Path of the uploaded file
    const filename = req.file.filename; // Filename of the uploaded file
    currentListing.image = { filename, url };

    // Save the listing again after updating the image
    await currentListing.save();
  }

  req.flash("success", "Listing Updated Successfully !")
  res.redirect(`/listings/${id}`);
}


module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // Delete associated image from Cloudinary
  if (deletedListing.image && deletedListing.image.filename) {
    await cloudinary.uploader.destroy(deletedListing.image.filename);
  }

  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
}