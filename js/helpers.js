// ═══════════════════════════════════════
// HELPERS — Shared constants & utilities
// Single source of truth for repeated values
// ═══════════════════════════════════════

// ── Configuration ──
var CONFIG = {
  WALKING_SPEED_M_PER_MIN: 70,        // ~4.2 km/h
  WALKING_RADIUS_15MIN_M: 1050,
  WALKING_RADIUS_8MIN_M: 560,
  NEARBY_PAIRING_MAX_KM: 0.6,         // 600m
  ANNIVERSARY_DATE: '2027-06-27',
  MAP_TILE_URL: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  MAP_MAX_ZOOM: 18,
  MAP_INVALIDATE_DELAY: 120,           // ms delay for map resize
};

// Categories hidden from user-facing lists and maps
var HIDDEN_CATEGORIES = ['transit', 'pharmacy', 'restroom'];

function isVisiblePlace(p) {
  return HIDDEN_CATEGORIES.indexOf(p.category) === -1;
}

// ── Route coordinates (used by Today map + Map tab) ──
var ROUTE_COORDS = {
  main: [
    { city: 'Rome',      lat: 41.8975, lng: 12.4800, days: 'Days 1–5',  dates: 'Jun 13–18', emoji: '🏛️' },
    { city: 'Florence',  lat: 43.7710, lng: 11.2540, days: 'Days 6–9',  dates: 'Jun 18–22', emoji: '🌻' },
    { city: 'Lake Como', lat: 45.8100, lng: 9.0800,  days: 'Days 10–11',dates: 'Jun 22–24', emoji: '⛰️' },
    { city: 'Venice',    lat: 45.4400, lng: 12.3350, days: 'Days 12–14',dates: 'Jun 24–27', emoji: '🚣' }
  ],
  dayTrips: [
    { label: 'Tuscany',  lat: 43.55,   lng: 11.25,   emoji: '🍷' },
    { label: 'Verona',   lat: 45.4391, lng: 10.9946, emoji: '💌' },
    { label: 'Amalfi',   lat: 40.6280, lng: 14.4850, emoji: '🏖️' },
    { label: 'Pompeii',  lat: 40.7484, lng: 14.4848, emoji: '🌋' }
  ]
};

// ── Place index for O(1) lookups by ID ──
var _placeIndex = null;

function getPlaceById(id) {
  if (!_placeIndex) {
    _placeIndex = {};
    var places = Storage.getPlaces();
    places.forEach(function(p) { _placeIndex[p.id] = p; });
  }
  return _placeIndex[id] || null;
}

function invalidatePlaceIndex() {
  _placeIndex = null;
}

// ── Date helpers ──
function getDayOfYear(date) {
  if (!date) date = new Date();
  var start = new Date(date.getFullYear(), 0, 0);
  var diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDateShort(date) {
  if (typeof date === 'number') date = new Date(date);
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateLong(date) {
  if (typeof date === 'number') date = new Date(date);
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateFull(date) {
  if (typeof date === 'number') date = new Date(date);
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Map tile layer helper ──
function addTileLayer(map) {
  return L.tileLayer(CONFIG.MAP_TILE_URL, { maxZoom: CONFIG.MAP_MAX_ZOOM }).addTo(map);
}
