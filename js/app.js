// ═══════════════════════════════════════
// APP — Init + glue
// ═══════════════════════════════════════

// ── Explore Page ──
function renderExplore() {
  var content = document.getElementById('explore-content');
  if (!content) return;

  var places = Storage.getPlaces();

  var headerHTML = '<div class="explore-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
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

  var headerHTML = '<div class="page-header">' +
    '<h1>✨ More</h1>' +
    '</div>';

  var bookingStats = getBookingStats();
  var bookingDesc = bookingStats.remaining > 0
    ? '⚠️ ' + bookingStats.remaining + ' still need booking'
    : '✅ All booked!';

  var statsDesc = getStatsSummary();

  var linksHTML = '<div class="content-wrap stagger">' +
    buildMoreLink('#explore', '🔍', 'Explore Cities', CITIES.length + ' cities to discover', '') +
    buildMoreLink('#phrasebook', '🇮🇹', 'Italian Phrases', 'Essential phrases & tips', '') +
    buildMoreLink('#bookings', '📋', 'Booking Checklist', bookingDesc, '') +
    buildMoreLink('#achievements', '🏆', 'Achievements', counts.unlocked + ' / ' + counts.total + ' unlocked', '') +
    buildMoreLink('#stats', '📊', 'Trip Stats', statsDesc, '') +
    buildMoreLink('#capsule', '🔮', 'Time Capsule', 'Opens 1 year after Italy', '') +
    buildMoreLink('#settings', '⚙️', 'Settings', 'Names, wedding, photo', '') +
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

// ── Time Capsule ──
function renderCapsule() {
  var content = document.getElementById('capsule-content');
  if (!content) return;

  var capsule = Storage.getCapsule();

  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>🔮 Time Capsule</h1>' +
    '</div>';

  var bodyHTML = '<div class="content-wrap">';

  if (!capsule.locked) {
    // ── UNSEALED — form to fill out ──
    var s = Storage.getSettings();
    var salutation = s.petName ? 'Dear ' + s.petName + ', ' : 'Dear future us, ';
    bodyHTML += '<div style="text-align:center;margin-bottom:24px;">' +
      '<div class="capsule-hero-icon">🔮</div>' +
      '<h2>Your Italy Time Capsule</h2>' +
      '<div class="capsule-intro-text" style="margin:12px 0;">' +
      'On your last night in Italy, fill this out together. It seals away your memories ' +
      'and opens exactly one year later — June 27, 2027.' +
      '</div>' +
      '</div>' +
      '<div class="capsule-form">' +
      '<div class="capsule-field">' +
      '<label class="capsule-label">💌 A letter to your future selves</label>' +
      '<textarea id="capsule-letter" class="journal-textarea" style="min-height:120px;" autocapitalize="sentences" placeholder="' + salutation + '"></textarea>' +
      '</div>' +
      '<div class="capsule-field">' +
      '<label class="capsule-label">📍 Favorite place from the trip</label>' +
      '<input id="capsule-place" class="capsule-input" type="text" autocapitalize="sentences" placeholder="The place that meant the most...">' +
      '</div>' +
      '<div class="capsule-field">' +
      '<label class="capsule-label">🍝 Best meal we had</label>' +
      '<input id="capsule-meal" class="capsule-input" type="text" autocapitalize="sentences" placeholder="The dish, the restaurant, the moment...">' +
      '</div>' +
      '<div class="capsule-field">' +
      '<label class="capsule-label">✨ A moment to remember</label>' +
      '<textarea id="capsule-moment" class="journal-textarea" style="min-height:80px;" autocapitalize="sentences" placeholder="Something that made this trip ours..."></textarea>' +
      '</div>' +
      '<button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="sealTimeCapsule()">🔒 Seal the Capsule</button>' +
      '</div>';

  } else if (!Storage.isCapsuleUnlocked()) {
    // ── SEALED — countdown to the reveal ──
    var unlock = new Date(capsule.lockUntil);
    var now = new Date();
    var daysLeft = Math.ceil((unlock - now) / (1000 * 60 * 60 * 24));
    bodyHTML += '<div style="text-align:center;">' +
      '<div class="capsule-hero-icon" style="margin-bottom:16px;">🔒</div>' +
      '<h2>Capsule Sealed</h2>' +
      '<div class="countdown-banner after" style="margin:20px 0;">' +
      '<div class="countdown-number">' + daysLeft + '</div>' +
      '<div class="countdown-label">days until Italy opens again</div>' +
      '</div>' +
      '<div class="capsule-intro-text">' +
      'Sealed on ' + formatDateFull(capsule.sealedAt) + '.<br>' +
      'Opens June 27, 2027 💕' +
      '</div>' +
      '</div>';

  } else {
    // ── UNLOCKED — one year later reveal ──
    bodyHTML += '<div style="text-align:center;margin-bottom:24px;">' +
      '<div class="capsule-hero-icon">🎉</div>' +
      '<h2>One Year Since Italy</h2>' +
      '<div class="capsule-intro-text" style="margin:8px 0;">Sealed ' + formatDateFull(capsule.sealedAt) + ' in Italy</div>' +
      '</div>';

    if (capsule.letter) {
      bodyHTML += '<div class="capsule-reveal-section">' +
        '<div class="capsule-reveal-label">💌 Your letter to each other</div>' +
        '<div class="capsule-reveal-text">' + capsule.letter.replace(/\n/g, '<br>') + '</div>' +
        '</div>';
    }
    if (capsule.favoritePlace) {
      bodyHTML += '<div class="capsule-reveal-section">' +
        '<div class="capsule-reveal-label">📍 Favorite place</div>' +
        '<div class="capsule-reveal-text">' + capsule.favoritePlace + '</div>' +
        '</div>';
    }
    if (capsule.bestMeal) {
      bodyHTML += '<div class="capsule-reveal-section">' +
        '<div class="capsule-reveal-label">🍝 Best meal</div>' +
        '<div class="capsule-reveal-text">' + capsule.bestMeal + '</div>' +
        '</div>';
    }
    if (capsule.bestMoment) {
      bodyHTML += '<div class="capsule-reveal-section">' +
        '<div class="capsule-reveal-label">✨ A moment to remember</div>' +
        '<div class="capsule-reveal-text">' + capsule.bestMoment.replace(/\n/g, '<br>') + '</div>' +
        '</div>';
    }
    if (capsule.snapshot) {
      var journalCount = capsule.snapshot.journal ? capsule.snapshot.journal.length : 0;
      var achievementCount = 0;
      if (capsule.snapshot.achievements) {
        for (var k in capsule.snapshot.achievements) {
          if (capsule.snapshot.achievements[k] && capsule.snapshot.achievements[k].unlocked) achievementCount++;
        }
      }
      bodyHTML += '<div class="capsule-reveal-section" style="text-align:center;">' +
        '<div class="capsule-reveal-label">📊 Trip snapshot</div>' +
        '<div class="capsule-snapshot-row">' +
        '<div><div class="capsule-stat-num" style="color:var(--rosso);">' + journalCount + '</div><div class="capsule-stat-label">journal entries</div></div>' +
        '<div><div class="capsule-stat-num" style="color:var(--verde);">' + achievementCount + '</div><div class="capsule-stat-label">achievements</div></div>' +
        '</div>' +
        '</div>';
    }
  }

  bodyHTML += '</div>';
  content.innerHTML = headerHTML + bodyHTML;
}

function sealTimeCapsule() {
  var letter = document.getElementById('capsule-letter');
  var place = document.getElementById('capsule-place');
  var meal = document.getElementById('capsule-meal');
  var moment = document.getElementById('capsule-moment');

  if (!letter || !letter.value.trim()) {
    showToast('Write a letter to your future selves first!');
    return;
  }

  if (!confirm('Seal the capsule? It won\'t open until June 27, 2027 — one year after your last night in Italy.')) {
    return;
  }

  Storage.sealCapsule({
    letter: letter.value.trim(),
    favoritePlace: place ? place.value.trim() : '',
    bestMeal: meal ? meal.value.trim() : '',
    bestMoment: moment ? moment.value.trim() : ''
  });

  showToast('Time capsule sealed! 🔮');
  renderCapsule();
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
var mapActiveFilters = [];

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

  // Draw travel route (shared with Today mini-map)
  var routeResult = drawTravelRoute(fullMap);
  mapRouteLines = mapRouteLines.concat(routeResult.lines);

  // Add hotel markers (all cities, with name labels)
  mapHotelMarkers = addHotelMarkers(fullMap);

  // Add all place markers
  addPlaceMarkers();

  // Fix size
  setTimeout(function() { fullMap.invalidateSize(); }, 100);
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
      popupHTML += '<div class="popup-summary">' +
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

// ── Filter Modal (multi-select) ──
var FILTER_TESTS = {
  'essential':  function(p) { return p.verdict === 'essential'; },
  'hidden-gem': function(p) { return p.verdict === 'hidden-gem'; },
  'worth-it':   function(p) { return p.verdict === 'worth-it'; },
  'nathan':     function(p) { return p.source && p.source.toLowerCase().indexOf('nathan') !== -1; },
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

function openMapFilters() {
  var modal = document.getElementById('map-filter-modal');
  modal.classList.add('open');
  syncFilterUI();
}

function closeMapFilters() {
  document.getElementById('map-filter-modal').classList.remove('open');
}

function syncFilterUI() {
  // Highlight all active filters in the modal
  var options = document.querySelectorAll('.mfm-option');
  for (var i = 0; i < options.length; i++) {
    options[i].classList.toggle('active', mapActiveFilters.indexOf(options[i].dataset.filter) !== -1);
  }
}

function toggleMapFilter(filter) {
  var idx = mapActiveFilters.indexOf(filter);
  if (idx === -1) {
    mapActiveFilters.push(filter);
  } else {
    mapActiveFilters.splice(idx, 1);
  }
  syncFilterUI();
  applyActiveFilters();
}

function resetMapFilters() {
  mapActiveFilters = [];
  syncFilterUI();
  applyActiveFilters();
}

function applyActiveFilters() {
  // Update the filter button label
  var btn = document.getElementById('map-filter-btn');
  var labelEl = document.getElementById('map-filter-label');
  if (mapActiveFilters.length === 0) {
    if (labelEl) labelEl.textContent = 'All Places';
    if (btn) btn.classList.remove('has-filter');
  } else if (mapActiveFilters.length === 1) {
    // Show the single filter name from the button text
    var opt = document.querySelector('.mfm-option[data-filter="' + mapActiveFilters[0] + '"]');
    var name = opt ? opt.textContent.trim() : mapActiveFilters[0];
    if (labelEl) labelEl.textContent = name;
    if (btn) btn.classList.add('has-filter');
  } else {
    if (labelEl) labelEl.textContent = mapActiveFilters.length + ' filters';
    if (btn) btn.classList.add('has-filter');
  }

  // Show/hide markers — place shows if it matches ANY active filter (OR logic)
  mapPlaceMarkers.forEach(function(m) {
    if (mapActiveFilters.length === 0) {
      fullMap.addLayer(m.marker);
      return;
    }
    var show = mapActiveFilters.some(function(f) {
      var test = FILTER_TESTS[f];
      return test && test(m.place);
    });
    if (show) {
      fullMap.addLayer(m.marker);
    } else {
      fullMap.removeLayer(m.marker);
    }
  });
}

// ── First-run: seed Settings defaults (editable in ⚙️ Settings) ──
// Only runs if the settings key has never been written — a reset clears
// everything including this, at which point the seed runs again on reload.
function seedSettingsIfEmpty() {
  try {
    if (localStorage.getItem('italy-settings-v1') !== null) return;
  } catch (e) { return; }
  Storage.saveSettings({
    userName: 'Dylan',
    partnerName: 'Hope',
    weddingDate: '2026-06-06',
    hometown: 'Brea, CA',
    departureAirport: 'LAX'
  });
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', function() {
  seedSettingsIfEmpty();
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
