// Finds the 'map' div element and sets its location
var map = L.map('map').setView([51.505, -0.09], 13)

// Display tilemap (the actual map 'image') using openstreetmap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);