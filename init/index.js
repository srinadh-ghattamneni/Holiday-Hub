const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

require('dotenv').config({ path: '../.env' }); // Adjust the path if index.js is in a subfolder

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

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

const initDB = async () => {
  await Listing.deleteMany({});
  
   const ownerId = process.env.OWNER_ID;
   if (!ownerId) {
     console.log("OWNER_ID is not defined in environment variables.");
     return;
   }
   initData.data = initData.data.map((obj) => ({ ...obj, owner: ownerId }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
