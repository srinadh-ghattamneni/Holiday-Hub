const mongoose = require("mongoose");
const initData = require("./data.js");
const User = require("../models/user.js");  // Assuming the User model is in the correct path
const Listing = require("../models/listing.js");
if(process.env.NODE_ENV != "production")
  {
    require('dotenv').config({ path: '../.env' }); // Adjust the path if index.js is in a subfolder
  }


const MONGO_URL = process.env.MONGO_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const resetDB = async () => {
  try {
    // Delete all users
    await User.deleteMany({});
    console.log("All users have been deleted.");

    await Listing.deleteMany({});
    console.log("All listings have been deleted.");

    // Insert new listings into the database
    await Listing.insertMany(initData.data);
    console.log("Data has been initialized with new listings.");
  } catch (err) {
    console.log("Error during DB reset:", err);
  }
};

// Run the reset function
resetDB();
