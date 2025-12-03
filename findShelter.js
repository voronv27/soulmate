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
  attribution:
     'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | ' +
     '<a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> ' +
     '<a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
  apiKey: apiKey,
  mapStyle: "osm-bright-smooth", // More map styles on https://apidocs.geoapify.com/docs/maps/map-tiles/
  maxZoom: 20
}).addTo(map);

// Add in a layer for markers (points on the map)
let markersLayer = L.layerGroup().addTo(map);

// Custom star marker icon for shelters
const star = L.divIcon({
  className: "star-marker",
  html: `
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#F4E8B8" stroke="#304A47" stroke-width="2" stroke-linejoin="round">
      <path d="M12 2.5l3.1 6.4 7.1 1-5.2 5.1 1.2 7.1-6.2-3.3-6.2 3.3 1.2-7.1-5.2-5.1 7.1-1z"/>
    </svg>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});


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
  // Make a query to Overpass for animal shelters within the search radius
  const query = `
     [out:json][timeout:25];
    (
      node(around:${radius},${lat},${lon})[amenity=animal_shelter];
      way(around:${radius},${lat},${lon})[amenity=animal_shelter];
      relation(around:${radius},${lat},${lon})[amenity=animal_shelter];
      node(around:${radius},${lat},${lon})[office=animal_rescue];
      way(around:${radius},${lat},${lon})[office=animal_rescue];
      relation(around:${radius},${lat},${lon})[office=animal_rescue];
    );
    out center;`;
  const url = "https://overpass-api.de/api/interpreter";
  const response = await fetch(url, {
    method: "POST",
    body: query,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    }
  });
  if (!response.ok) {
    alert("Error occurred while searching for shelters");
    return null;
  }

  // Return lat, lon, and name for any shelter with
  // a latitude and longitude (required to display on map)
  const data = await response.json();
  return data.elements.map(
    s => {
      return {
        lat: s.lat ?? s.center.lat,
        lon: s.lon ?? s.center.lon,
        name: s.tags.name || "Unnamed Shelter",
      };
    }
  ).filter(s => s.lat && s.lon);
}

// Get user inputs (location and search radius) and search for local shelters, then
// display them on the map
async function searchShelters() {
  const address = document.getElementById("location").value;
  const radiusMiles = parseFloat(document.getElementById("radius").value) || -1;

  if (radiusMiles <= 0) {
    alert("Please enter a valid search radius which is > 0 miles");
    return;
  }

  // Overpass needs radius to be in meters so we just convert it
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

  if (!shelters) {
    // There was an error in getShelters, return early
    return;
  }

  if (!shelters.length) {
    alert("No shelters found in that area.");
    return;
  }
  for (const s of shelters) {
    const lon = s.lon;
    const lat = s.lat;
    const name = s.name;
    var addr = "No address listed";
    try {
      // Try using geoapify to get the address with reverse geocoding
      const revUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;
      const revResp = await fetch(revUrl);
      const revData = await revResp.json();

      const rev = revData.features?.[0]?.properties;
      if (rev?.formatted) {
        addr = rev.formatted;
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
      continue;
    }

    const marker = L.marker([lat, lon], {icon: star}).addTo(markersLayer);
    marker.bindPopup(`<b>${name}</b><br>${addr}<br>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}"
        target="_blank"
        style="text-decoration: underline;">
        Get Directions
      </a>`);
  };
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
    div.classList.add("suggestion-item");
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