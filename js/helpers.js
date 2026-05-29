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
    { label: 'Amalfi',   lat: 40.6280, lng: 14.4850, emoji: '🏖️' },
    { label: 'Pompeii',  lat: 40.7484, lng: 14.4848, emoji: '🌋' }
  ]
};

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

function addDaysISO(iso, n) {
  if (!iso) return '';
  var d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ── Map tile layer helper ──
function addTileLayer(map) {
  return L.tileLayer(CONFIG.MAP_TILE_URL, { maxZoom: CONFIG.MAP_MAX_ZOOM }).addTo(map);
}

// ── Today-screen time helpers (Up Next tile + Tonight mode) ──
// CITY_COLORS lives in data-trip.js alongside CAT_COLORS — peer data, not a helper.

// Parses 'HH:MM' as today in the user's local timezone and returns
// minute diff from `now` (defaults to new Date()). Negative if past.
// Returns null on parse failure.
function minutesUntil(hhmm, now) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  var parts = hhmm.split(':');
  if (parts.length !== 2) return null;
  var h = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  now = now || new Date();
  var target = new Date(now);
  target.setHours(h, m, 0, 0);
  return Math.round((target - now) / 60000);
}

// 'in 1h 40m' / 'in 25 min' / 'now' / '40 min ago'
function formatRelativeTime(minutes) {
  if (minutes === null || minutes === undefined) return '';
  if (minutes === 0) return 'now';
  var past = minutes < 0;
  var abs = Math.abs(minutes);
  var suffix = past ? ' ago' : '';
  var prefix = past ? '' : 'in ';
  if (abs < 60) return prefix + abs + ' min' + suffix;
  var h = Math.floor(abs / 60);
  var m = abs % 60;
  if (m === 0) return prefix + h + 'h' + suffix;
  return prefix + h + 'h ' + m + 'm' + suffix;
}

// Localhost-only mock harness for visual QA (and trip-time "preview tomorrow").
//   ?date=YYYY-MM-DD[THH:MM]&phase=during
// Only honored when served from localhost/127.0.0.1, so production traffic is
// never affected. Drives getTripPhase() (mock date + forced phase) and
// getRomeNow() (the optional THH:MM clock, which decides move-AM vs move-PM and
// Tonight mode). Supersedes the older ?tonight=1 flag for everything except a
// quick force-evening toggle. Returns all-null off-localhost or on no/garbled input.
function _readMockParams() {
  var off = { date: null, rome: null, forcePhase: null };
  if (typeof location === 'undefined') return off;
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return off;
  var sp;
  try { sp = new URLSearchParams(location.search); } catch (e) { return off; }
  var raw = sp.get('date');
  var date = null, rome = null;
  if (raw) {
    var m = raw.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{1,2}):(\d{2}))?$/);
    if (m) {
      date = m[1];
      if (m[2] !== undefined) rome = { hour: parseInt(m[2], 10), minute: parseInt(m[3], 10) };
    }
  }
  return { date: date, rome: rome, forcePhase: (sp.get('phase') === 'during') ? 'during' : null };
}

// Returns { hour, minute } in Europe/Rome regardless of the user's clock.
// Used for Tonight-mode trigger so the app doesn't flip at the wrong time
// when QA'd from a US timezone.
function getRomeNow(now) {
  now = now || new Date();
  // Localhost mock clock (?date=…THH:MM) wins so move-AM/PM + Tonight are deterministic in QA.
  var mock = (typeof _readMockParams === 'function') ? _readMockParams() : null;
  if (mock && mock.rome) return mock.rome;
  var parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(now);
  var h = 0, m = 0;
  parts.forEach(function(p) {
    if (p.type === 'hour') h = parseInt(p.value, 10);
    if (p.type === 'minute') m = parseInt(p.value, 10);
  });
  // Dev escape hatch — append ?tonight=1 to force evening mode on localhost.
  if (typeof location !== 'undefined' &&
      /[?&]tonight=1\b/.test(location.search) &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    return { hour: 21, minute: 0 };
  }
  return { hour: h, minute: m };
}
