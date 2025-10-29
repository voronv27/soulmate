const apiKey = '063ef3ad3bd243e48b9e4639ca2544f4'; // when testing, change this to the API key that allows localhost--contact Vicky if you need this

// Finds the 'map' div element (default location set to around Troy)
var map = L.map('map').setView([43,-73], 10);

var mapURL = L.Browser.retina
  ? `https://maps.geoapify.com/v1/tile/{mapStyle}/{z}/{x}/{y}.png?apiKey={apiKey}`
  : `https://maps.geoapify.com/v1/tile/{mapStyle}/{z}/{x}/{y}@2x.png?apiKey={apiKey}`;

// Get rough user location using IP address and set map view there as a starting point
fetch(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`).then(result => result.json()).then(result => {
    map.setView([result.location.latitude, result.location.longitude], 8);
});

// Add map tiles layer. Set 20 as the maximal zoom and provide map data attribution.
L.tileLayer(mapURL, {
  attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
  apiKey: apiKey,
  mapStyle: "osm-bright-smooth", // More map styles on https://apidocs.geoapify.com/docs/maps/map-tiles/
  maxZoom: 20
}).addTo(map);

// Add Geoapify Address Search control
// TODO: hide the search bar and auto-search for animal shelters & human societies instead
const addressSearchControl = L.control.addressSearch(apiKey, {
  position: 'topleft',
  resultCallback: (address) => {
    console.log(address)
  },
  suggestionsCallback: (suggestions) => {
    console.log(suggestions);
  }
});
map.addControl(addressSearchControl);
L.control.zoom({ position: 'bottomright' }).addTo(map);