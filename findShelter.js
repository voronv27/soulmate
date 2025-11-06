const apiKey = '063ef3ad3bd243e48b9e4639ca2544f4'; // when testing, change this to the API key that allows localhost--contact Vicky if you need this

// ---------------- BASIC MAP SETUP ----------------
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

// Add in a layer for markers (points on the map)
let markersLayer = L.layerGroup().addTo(map);

// ---------------- SEARCH AND DISPLAY RESULTS ----------------
// Geocode an address (get coordinates given an address). We need this to display markers on the map
async function geocodeAddress(address) {
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.features[0]?.geometry.coordinates.reverse(); // [lat, lon]
}

// Function to search for nearby pet-related* places
// (*may swap to another API to have better search criteria)
async function getShelters(lat, lon, radius) {
  // This version of the link uses the search radius, but as Geoapify
  // doesn't provide many results, we ignore the radius for testing
  // const url = `https://api.geoapify.com/v2/places?categories=pet&bias=proximity:${lon},${lat}&filter=circle:${lon},${lat},${radius}&limit=50&apiKey=${apiKey}`;
  const url = `https://api.geoapify.com/v2/places?categories=pet&bias=proximity:${lon},${lat}&limit=50&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.features;
}

// Get user inputs (location and search radius) and search for local shelters, then
// display them on the map
async function searchShelters() {
  const address = document.getElementById("location").value;
  const radiusMiles = parseFloat(document.getElementById("radius").value) || 20;
  // Geoapify needs radius to be in meters so we just convert it
  const radius = radiusMiles * 1609.34;

  if (!address) {
    alert("Please enter an address");
    return;
  }

  // Get coordinates for user-inputted address
  var coords = await geocodeAddress(address);
  if (!coords) {
    alert("Address not found");
    return;
  }
  const [lat, lon] = coords;

  // Clear old results and center the map around the user location
  markersLayer.clearLayers();
  map.setView([lat, lon], 10);

  // Either message that there are no nearby shelters or display them on the map
  const shelters = await getShelters(lat, lon, radius);
  if (!shelters.length) {
    alert("No shelters found in that area.");
    return;
  }
  shelters.forEach(feature => {
    const [lon, lat] = feature.geometry.coordinates;
    const name = feature.properties.name || "Unnamed Shelter";
    const address = feature.properties.formatted || "No address listed";

    const marker = L.marker([lat, lon]).addTo(markersLayer);
    marker.bindPopup(`<b>${name}</b><br>${address}`);
  });
}
document.getElementById("mapSearchBtn").onclick = searchShelters;

// ---------------- AUTO-SUGGEST ADDRESSES FOR USER-INPUTTED LOCATION ----------------
// Function to get autocomplete address suggestions
async function suggestAddresses(addr) {
  if (!addr) return [];
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(addr)}&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  var suggestedAddresses = [];
  for (addr of data.features) {
    if (addr.properties.formatted) {
      suggestedAddresses.push(addr);
    }
  }
  return suggestedAddresses;
}

// Update the suggestionBox element with address suggestions
const inputBox = document.getElementById("location");
const suggestionBox = document.getElementById("suggestionBox");
let latestSuggestions = [];
async function updateAddressSuggestions() {
  const text = inputBox.value.trim();
  if (!text) {
    suggestionBox.style.display = "none";
    return;
  }
  const suggestions = await suggestAddresses(text);
  latestSuggestions = suggestions || [];
  suggestionBox.innerHTML = "";

  // Display each suggested address
  latestSuggestions.forEach(s => {
    const div = document.createElement("div");
    div.classList.add("js-animate-on-scroll", "bg-brand-light",
      "rounded-2xl", "p-8", "transition-all", "duration-300",
      "hover:-translate-y-2", "hover:shadow-xl", "fade-in-element",
      "is-visible");
    div.textContent = s.properties.formatted;

    // Clicking on an address suggestion changes the inputBox text
    // to that address and hides the suggestions
    div.onclick = () => {
      inputBox.value = s.properties.formatted;
      suggestionBox.style.display = "none";
    };
    suggestionBox.appendChild(div);
  });
  suggestionBox.style.display = "block";
}
inputBox.addEventListener("input", updateAddressSuggestions);

// Hide dropdown when clicking outside location input box, and
// show again when clicking on the input box
document.addEventListener("click", (e) => {
  if (!suggestionBox.contains(e.target) && !inputBox.contains(e.target)) {
    suggestionBox.style.display = "none";
  } else if (inputBox.contains(e.target)) {
    suggestionBox.style.display = "block";
  }
});