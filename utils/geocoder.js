const NodeGeocoder = require("node-geocoder");

const geocoder = NodeGeocoder({
  provider: "openstreetmap", // Or use 'google', 'mapquest', etc.
  httpAdapter: "https",
});

module.exports = geocoder;
