
document.addEventListener("DOMContentLoaded", function () {

    try {
       // console.log(coordinates); 
        if (typeof coordinates !== 'undefined'  && coordinates.length > 0) {
            const firstCoordinate = coordinates[0];
            // Access latitude and longitude
            const latitude = firstCoordinate.lat;
            const longitude = firstCoordinate.lng;

            // Initialize the map with coordinates
            var map = L.map('map').setView([latitude, longitude], 10);  // Use dynamic coordinates here

            // Add OpenStreetMap tile layer
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            // Custom red marker icon
            var redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            // Place a marker at the coordinates
            var marker = L.marker([latitude, longitude], { icon: redIcon }).addTo(map);

            // Bind popup to the marker
            marker.bindPopup("<b>This is where you'll stay</b><br>Exact location will be provided after booking.").openPopup();
        }



    } catch (error) {
        console.log(error);
    }


});
