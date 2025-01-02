const Listing = require("../models/listing");
const geocoder = require("../utils/geocoder");


module.exports.index=async(req,res) =>{
   
const allListings = await Listing.find({});
res.render("listings/index.ejs", { allListings });
        
    }

module.exports.renderNewForm =(req,res)=>{

     res.render("listings/new.ejs");
}

module.exports.showListing =async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
      populate:{path:"author"},
  }).populate("owner");  


    if(!listing)
    {
      req.flash("error","The Listing you requested for does not exist !");
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
    console.log(newListing);

    await newListing.save();


    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
};




module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing)
      {
        req.flash("error","The Listing you requested for does not exist !");
        res.redirect("/listings");
      }

      let originalImageUrl=listing.image.url;
      originalImageUrl=  originalImageUrl.replace("/upload","/upload/h_300");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
  }


module.exports.updateListing=async (req, res) => {
    const { id } = req.params;
    const { listing } = req.body;


    const geoData = await geocoder.geocode(listing.location);
  const coordinates = geoData[0] ? 
  { lat: geoData[0].latitude, lng: geoData[0].longitude } : 
  { lat: currentListing.coordinates.lat, lng: currentListing.coordinates.lng };

    
  currentListing = await Listing.findByIdAndUpdate(id, { ...listing,coordinates,});
    

    // Check if an image file was uploaded
    let url, filename;
    if (typeof req.file !== "undefined") {
        url = req.file.path;        // Path of the uploaded file
        filename = req.file.filename; // Filename of the uploaded file
        currentListing.image={filename,url};
        await currentListing.save();
    } 
    
    req.flash("success", "Listing Updated Successfully !")
    res.redirect(`/listings/${id}`);
  }


module.exports.deleteListing =async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
   // console.log(deletedListing);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");
  }