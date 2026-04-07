// ═══════════════════════════════════════
// APP — Init + glue
// ═══════════════════════════════════════

// ── Explore Page ──
function renderExplore() {
  var content = document.getElementById('explore-content');
  if (!content) return;

  var places = Storage.getPlaces();

  var headerHTML = '<div class="explore-header">' +
    '<h1>🗺️ Explore Italy</h1>' +
    '<div class="subtitle">Your curated travel guide</div>' +
    '</div>';

  var gridHTML = '<div class="explore-grid stagger">';
  CITIES.forEach(function(city) {
    var count = places.filter(function(p) { return p.city === city; }).length;
    var emoji = CITY_EMOJI[city] || '📍';
    gridHTML += '<div class="explore-city-card" onclick="Router.navigate(\'#city/' + cityToSlug(city) + '\')">' +
      '<div class="explore-city-emoji">' + emoji + '</div>' +
      '<div class="explore-city-name">' + city + '</div>' +
      '<div class="explore-city-count">' + count + ' places</div>' +
      '</div>';
  });
  gridHTML += '</div>';

  content.innerHTML = headerHTML + gridHTML;
}

// ── More Page ──
function renderMore() {
  var content = document.getElementById('more-content');
  if (!content) return;

  var counts = Storage.getAchievementCount();
  var journal = Storage.getJournal();
  var letters = Storage.getLetters();

  var headerHTML = '<div class="page-header">' +
    '<h1>✨ More</h1>' +
    '</div>';

  var bookingStats = getBookingStats();
  var bookingDesc = bookingStats.remaining > 0
    ? '⚠️ ' + bookingStats.remaining + ' still need booking'
    : '✅ All booked!';

  var linksHTML = '<div class="content-wrap stagger">' +
    buildMoreLink('#bookings', '📋', 'Booking Checklist', bookingDesc, '') +
    buildMoreLink('#journal', '📝', 'Journal', journal.length + ' entries', '') +
    buildMoreLink('#letters', '💌', 'Letters', letters.length + ' sealed', '') +
    buildMoreLink('#achievements', '🏆', 'Achievements', counts.unlocked + ' / ' + counts.total + ' unlocked', '') +
    buildMoreLink('#capsule', '🔮', 'Time Capsule', 'Anniversary surprise', '') +
    '<div style="margin-top:24px;">' +
    '<button class="btn btn-ghost btn-full btn-sm" onclick="if(confirm(\'Reset all saved data? Places will be restored to defaults.\')){Storage.resetAll();showToast(\'Data reset!\');Router.navigate(\'#today\');}">Reset All Data</button>' +
    '</div>' +
    '</div>';

  content.innerHTML = headerHTML + linksHTML;
}

function buildMoreLink(href, icon, title, desc) {
  return '<a class="more-link" href="' + href + '">' +
    '<div class="more-link-icon">' + icon + '</div>' +
    '<div class="more-link-text">' +
    '<div class="more-link-title">' + title + '</div>' +
    '<div class="more-link-desc">' + desc + '</div>' +
    '</div>' +
    '<div class="more-link-arrow">→</div>' +
    '</a>';
}

// ── Time Capsule (placeholder) ──
function renderCapsule() {
  var content = document.getElementById('capsule-content');
  if (!content) return;

  var capsule = Storage.getCapsule();

  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>🔮 Time Capsule</h1>' +
    '</div>';

  var bodyHTML = '<div class="content-wrap" style="text-align:center;">';

  if (!capsule.locked) {
    bodyHTML += '<div style="font-size:64px;margin-bottom:16px;">🔮</div>' +
      '<h2>Your Anniversary Time Capsule</h2>' +
      '<div style="font-size:14px;color:var(--warm-gray);margin:12px 0 24px;line-height:1.6;">' +
      'On your last night in Italy, seal this capsule. It will lock away your journal entries, ' +
      'favorite moments, a letter to your future selves, and your achievement stats — ' +
      'all revealed on your first anniversary, June 27, 2027.' +
      '</div>' +
      '<div style="font-size:13px;color:var(--warm-gray);">This feature will be ready for your trip! ✨</div>';
  } else if (!Storage.isCapsuleUnlocked()) {
    var unlock = new Date(capsule.lockUntil);
    var now = new Date();
    var daysLeft = Math.ceil((unlock - now) / (1000 * 60 * 60 * 24));
    bodyHTML += '<div style="font-size:64px;margin-bottom:16px;">🔒</div>' +
      '<h2>Capsule Sealed!</h2>' +
      '<div class="countdown-banner after" style="margin:16px 0;">' +
      '<div class="countdown-number">' + daysLeft + '</div>' +
      '<div class="countdown-label">days until your anniversary reveal</div>' +
      '</div>';
  } else {
    bodyHTML += '<div style="font-size:64px;margin-bottom:16px;">🎉</div>' +
      '<h2>Happy Anniversary!</h2>' +
      '<div style="font-size:14px;color:var(--warm-gray);margin:12px 0;">Your capsule is ready to open!</div>';
  }

  bodyHTML += '</div>';

  content.innerHTML = headerHTML + bodyHTML;
}

// ═══════════════════════════════════════
// FULL MAP TAB
// ═══════════════════════════════════════
var fullMap = null;
var mapPlaceMarkers = [];   // all place markers (for filtering)
var mapRouteLines = [];     // route polylines
var mapHotelMarkers = [];   // hotel markers
var mapRadiusCircles = [];  // walking radius circles
var mapCurrentCity = 'all';
var mapCurrentFilter = 'all';

function renderFullMap() {
  var container = document.getElementById('full-map');
  if (!container) return;
  if (typeof L === 'undefined') { container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--warm-gray);padding:24px;text-align:center;">Map requires an internet connection on first load.</div>'; return; }

  if (fullMap) {
    setTimeout(function() { fullMap.invalidateSize(); }, 100);
    return;
  }

  fullMap = L.map(container, {
    center: [42.5, 12.5],
    zoom: 6,
    zoomControl: false,
    // Smoother, faster zooming
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 80,
    wheelDebounceTime: 40,
    zoomAnimationThreshold: 6
  });

  L.control.zoom({ position: 'topright' }).addTo(fullMap);

  addTileLayer(fullMap);

  // Darken everything except Italy
  addItalyMask(fullMap);

  // Draw travel route
  drawTravelRoute();

  // Add hotel markers
  addHotelMarkers();

  // Add all place markers
  addPlaceMarkers();

  // Fix size
  setTimeout(function() { fullMap.invalidateSize(); }, 100);
}

// ── Travel route lines ──
function drawTravelRoute() {
  if (!fullMap) return;

  // Main route from shared coordinates
  var mainCoords = ROUTE_COORDS.main.map(function(r) { return [r.lat, r.lng]; });
  var mainLine = L.polyline(mainCoords, {
    color: '#CE2B37', weight: 3, opacity: 0.5, dashArray: '10 8'
  }).addTo(fullMap);
  mapRouteLines.push(mainLine);

  // Day trip routes (thinner, gold)
  var dayTripLines = [
    [[41.8975, 12.4800], [40.6880, 14.4849]],
    [[43.7710, 11.2540], [43.55, 11.25]],
    [[45.8100, 9.0800], [45.4391, 10.9946], [45.4400, 12.3350]]
  ];
  dayTripLines.forEach(function(coords) {
    var line = L.polyline(coords, {
      color: '#E8B931', weight: 2, opacity: 0.4, dashArray: '6 6'
    }).addTo(fullMap);
    mapRouteLines.push(line);
  });

  // Day trip point markers from shared coordinates
  ROUTE_COORDS.dayTrips.forEach(function(dt) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="map-dt-marker">' + dt.emoji + '</div><div class="map-dt-label">' + dt.label + '</div>',
      iconSize: [28, 40], iconAnchor: [14, 14]
    });
    L.marker([dt.lat, dt.lng], { icon: icon, interactive: false }).addTo(fullMap);
  });
}

// ── Hotel markers (house icon, always visible) ──
function addHotelMarkers() {
  if (!fullMap) return;

  Object.keys(HOTELS).forEach(function(cityName) {
    var h = HOTELS[cityName];
    var icon = L.divIcon({
      className: '',
      html: '<div class="map-hotel-marker">' +
        '<span class="map-hotel-icon">🏠</span>' +
        '</div>' +
        '<div class="map-hotel-label">' + h.name.split(' ').slice(0, 3).join(' ') + '</div>',
      iconSize: [36, 50],
      iconAnchor: [18, 18]
    });

    var marker = L.marker([h.lat, h.lng], { icon: icon, zIndexOffset: 1000 }).addTo(fullMap);
    marker.bindPopup(
      '<div class="popup-inner">' +
      '<div class="popup-name">🏠 ' + h.name + '</div>' +
      '<div class="popup-meta">' + h.dates + ' · ' + h.address + '</div>' +
      '</div>'
    );
    mapHotelMarkers.push({ marker: marker, city: cityName });
  });
}

// ── Place markers with verdict styling ──
function addPlaceMarkers() {
  if (!fullMap) return;

  // Clear existing
  mapPlaceMarkers.forEach(function(m) { fullMap.removeLayer(m.marker); });
  mapPlaceMarkers = [];

  var places = Storage.getPlaces();

  places.forEach(function(p) {
    if (!isVisiblePlace(p)) return;

    var color = CAT_COLORS[p.category] || '#999';
    var v = p.verdict && VERDICTS[p.verdict] ? VERDICTS[p.verdict] : null;

    // Verdict ring: essential gets green glow, hidden-gem gets purple, etc.
    var ringStyle = '';
    if (p.verdict === 'essential') {
      ringStyle = 'box-shadow:0 0 0 3px rgba(0,140,69,0.4), 0 2px 8px rgba(0,0,0,0.25);';
    } else if (p.verdict === 'hidden-gem') {
      ringStyle = 'box-shadow:0 0 0 3px rgba(139,92,246,0.4), 0 2px 8px rgba(0,0,0,0.25);';
    }

    // Check if gifted experience
    var isGift = GIFTED_EXPERIENCES.some(function(g) {
      return g.linkedPlaces && g.linkedPlaces.indexOf(p.id) !== -1;
    });

    var markerHTML = '<div class="custom-marker" style="background:' + color + ';' + ringStyle + '">' +
      (CAT_ICONS[p.category] || '📍') + '</div>';

    if (isGift) {
      markerHTML = '<div class="custom-marker map-gift-pin" style="background:' + color + ';' + ringStyle + '">' +
        (CAT_ICONS[p.category] || '📍') +
        '<span class="map-gift-ribbon">🎁</span>' +
        '</div>';
    }

    var icon = L.divIcon({
      className: '',
      html: markerHTML,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    var marker = L.marker([p.lat, p.lng], { icon: icon }).addTo(fullMap);

    // Popup with verdict badge
    var popupHTML = '<div class="popup-inner">' +
      '<div class="popup-name">' + (CAT_ICONS[p.category] || '') + ' ' + p.name + '</div>' +
      '<div class="popup-meta">' + p.city;
    if (v) {
      popupHTML += ' · <span style="color:' + v.color + ';font-weight:700;">' + v.icon + ' ' + v.label + '</span>';
    }
    if (p.source) {
      popupHTML += ' · ' + p.source;
    }
    popupHTML += '</div>';
    if (p.honest_summary) {
      popupHTML += '<div style="font-size:12px;color:var(--espresso);margin-top:6px;line-height:1.4;max-height:60px;overflow:hidden;">' +
        p.honest_summary.substring(0, 120) + '...</div>';
    }
    popupHTML += '<button class="popup-btn" onclick="Router.navigate(\'#place/' + p.id + '\')">View Details →</button></div>';

    marker.bindPopup(popupHTML, { maxWidth: 260 });

    mapPlaceMarkers.push({
      marker: marker,
      place: p
    });
  });
}

// ── City jump ──
function mapJumpTo(city) {
  if (!fullMap) return;
  mapCurrentCity = city;

  var view = CITY_VIEWS[city] || CITY_VIEWS['all'];
  fullMap.flyTo(view.center, view.zoom, { duration: 1.2 });

  // Update chip UI
  var chips = document.querySelectorAll('.map-city-chip');
  for (var i = 0; i < chips.length; i++) {
    chips[i].classList.toggle('active', chips[i].dataset.city === city);
  }

  // Show/hide walking radius
  clearRadiusCircles();
  if (city !== 'all' && HOTELS[city]) {
    showWalkingRadius(city);
  }
}

// ── Walking radius from hotel ──
function showWalkingRadius(city) {
  if (!fullMap || !HOTELS[city]) return;
  var h = HOTELS[city];

  var radius15 = L.circle([h.lat, h.lng], {
    radius: CONFIG.WALKING_RADIUS_15MIN_M,
    color: '#CE2B37',
    fillColor: '#CE2B37',
    fillOpacity: 0.04,
    weight: 1.5,
    opacity: 0.3,
    dashArray: '6 4',
    interactive: false
  }).addTo(fullMap);

  var radius8 = L.circle([h.lat, h.lng], {
    radius: CONFIG.WALKING_RADIUS_8MIN_M,
    color: '#008C45',
    fillColor: '#008C45',
    fillOpacity: 0.05,
    weight: 1.5,
    opacity: 0.35,
    dashArray: '6 4',
    interactive: false
  }).addTo(fullMap);

  // Labels for the radius circles
  var label15 = L.marker([h.lat + 0.0094, h.lng], {
    icon: L.divIcon({
      className: '',
      html: '<div class="map-radius-label">~15 min walk</div>',
      iconSize: [80, 16],
      iconAnchor: [40, 8]
    }),
    interactive: false
  }).addTo(fullMap);

  var label8 = L.marker([h.lat + 0.005, h.lng], {
    icon: L.divIcon({
      className: '',
      html: '<div class="map-radius-label map-radius-label-inner">~8 min walk</div>',
      iconSize: [70, 16],
      iconAnchor: [35, 8]
    }),
    interactive: false
  }).addTo(fullMap);

  mapRadiusCircles.push(radius15, radius8, label15, label8);
}

function clearRadiusCircles() {
  mapRadiusCircles.forEach(function(layer) { fullMap.removeLayer(layer); });
  mapRadiusCircles = [];
}

// ── Filter Modal ──
function openMapFilters() {
  var modal = document.getElementById('map-filter-modal');
  modal.classList.add('open');

  // Highlight current active filter
  var options = modal.querySelectorAll('.mfm-option');
  for (var i = 0; i < options.length; i++) {
    options[i].classList.toggle('active', options[i].dataset.filter === mapCurrentFilter);
  }
}

function closeMapFilters() {
  document.getElementById('map-filter-modal').classList.remove('open');
}

function applyMapFilter(filter, label) {
  mapCurrentFilter = filter;

  // Update button label
  var btn = document.getElementById('map-filter-btn');
  var labelEl = document.getElementById('map-filter-label');
  if (labelEl) labelEl.textContent = label;
  if (btn) btn.classList.toggle('has-filter', filter !== 'all');

  // Filter strategies — each returns true if place should show
  var filters = {
    'all':        function() { return true; },
    'essential':  function(p) { return p.verdict === 'essential'; },
    'hidden-gem': function(p) { return p.verdict === 'hidden-gem'; },
    'worth-it':   function(p) { return p.verdict === 'worth-it'; },
    'nathan':     function(p) { return p.source && p.source.toLowerCase().indexOf('nathan') !== -1; },
    'hotel':      function(p) { return p.source && p.source.toLowerCase().indexOf('splendid') !== -1; },
    'goop':       function(p) { return p.source && p.source.toLowerCase().indexOf('goop') !== -1; },
    'dining':     function(p) { return p.category === 'dining'; },
    'landmark':   function(p) { return p.category === 'landmark'; },
    'activity':   function(p) { return p.category === 'activity'; },
    'viewpoint':  function(p) { return p.category === 'viewpoint'; },
    'romantic':   function(p) { return autoTag(p).indexOf('romantic') !== -1; },
    'evening':    function(p) { return autoTag(p).indexOf('evening') !== -1; },
    'budget':     function(p) { return autoTag(p).indexOf('budget') !== -1; },
    'foodie':     function(p) { return autoTag(p).indexOf('foodie') !== -1; }
  };

  var filterFn = filters[filter] || filters['all'];

  mapPlaceMarkers.forEach(function(m) {
    if (filterFn(m.place)) {
      fullMap.addLayer(m.marker);
    } else {
      fullMap.removeLayer(m.marker);
    }
  });

  closeMapFilters();
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', function() {
  Router.init();

  // Register Service Worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      console.log('Service Worker registered');
    }).catch(function(err) {
      console.log('SW registration failed (normal on localhost):', err.message);
    });
  }
});
