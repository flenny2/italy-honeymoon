// ═══════════════════════════════════════
// TODAY VIEW — The home screen
// Split into section renderers for clarity
// ═══════════════════════════════════════

function renderToday() {
  var content = document.getElementById('today-content');
  if (!content) return;

  var phase = getTripPhase();
  var city = getTodayCity();

  var sections = [
    renderTodayCountdown(phase),
    renderTodayHotel(city),
    renderTodayMap(),
    renderTodayBooking(phase),
    renderTodayPhrase(),
    renderTodayGifts(city),
    renderTodaySuggestion(city),
    renderTodayActions(city),
    renderTodayPicks(city)
  ];

  content.innerHTML = '<div class="stagger">' +
    sections.map(function(html) {
      return html ? '<div class="today-section">' + html + '</div>' : '';
    }).join('') + '</div>';

  setTimeout(initTodayMap, 50);
}

// ── Section renderers ──

function renderTodayCountdown(phase) {
  if (phase.phase === 'before') {
    return '<div class="countdown-banner before anim-bounce-in">' +
      '<div class="countdown-number">' + phase.daysUntil + '</div>' +
      '<div class="countdown-label">days until Italy! 🇮🇹</div></div>';
  } else if (phase.phase === 'during') {
    var dt = phase.dayTrip;
    return '<div class="countdown-banner during anim-bounce-in">' +
      '<div class="countdown-number">Day ' + phase.day + '</div>' +
      '<div class="countdown-label">' + (CITY_EMOJI[phase.city] || '') + ' ' + phase.city +
      (dt ? ' — ' + dt.emoji + ' ' + dt.label : '') + '</div></div>';
  } else {
    return '<div class="countdown-banner after anim-bounce-in">' +
      '<div class="countdown-number">' + phase.daysSince + '</div>' +
      '<div class="countdown-label">days since Italy 💕</div></div>';
  }
}

function renderTodayHotel(city) {
  var hotel = HOTELS[city];
  if (!hotel) return '';
  return '<div class="section-header">🏨 Your Hotel</div>' +
    '<div class="hotel-card">' +
    '<div class="hotel-emoji">' + (hotel.emoji || '🏨') + '</div>' +
    '<div class="hotel-info">' +
    '<div class="hotel-name">' + hotel.name + '</div>' +
    '<div class="hotel-dates">' + hotel.dates + ' (' + hotel.nights + ' nights)</div>' +
    '<div class="hotel-address">📍 ' + hotel.address + '</div>' +
    '</div></div>';
}

function renderTodayMap() {
  return '<div class="section-header">🗺️ Your Route</div>' +
    '<div class="today-map-wrap"><div id="today-map" class="today-mini-map"></div></div>';
}

function renderTodayBooking(phase) {
  if (phase.phase !== 'before') return '';
  var bStats = getBookingStats();
  if (bStats.remaining <= 0) return '';
  return '<div class="card" style="border-left:4px solid var(--rosso);cursor:pointer;" onclick="Router.navigate(\'#bookings\')">' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<span style="font-size:24px;">📋</span>' +
    '<div style="flex:1;">' +
    '<div style="font-weight:700;font-size:14px;">Booking Checklist</div>' +
    '<div style="font-size:12px;color:var(--rosso);font-weight:600;">' + bStats.remaining + ' of ' + bStats.total + ' still need booking</div>' +
    '</div><span style="color:var(--light-gray);">→</span></div></div>';
}

function renderTodayPhrase() {
  var allPhrases = [];
  PHRASES.forEach(function(cat) { cat.phrases.forEach(function(p) { allPhrases.push(p); }); });
  var phrase = allPhrases[getDayOfYear() % allPhrases.length];
  return '<div class="section-header">🇮🇹 Phrase of the Day</div>' +
    '<div class="phrase-of-day">' +
    '<div class="phrase-of-day-italian">' + phrase.it + '</div>' +
    '<div class="phrase-of-day-pronounce">/' + phrase.pr + '/</div>' +
    '<div class="phrase-of-day-english">' + phrase.en + '</div></div>';
}

function renderTodayGifts(city) {
  var cityGifts = GIFTED_EXPERIENCES.filter(function(g) { return g.city === city; });
  if (cityGifts.length === 0) return '';
  var html = '<div class="section-header">🎁 Wedding Gifts</div>';
  cityGifts.forEach(function(gift) {
    html += '<div class="card card-gift">' +
      '<div style="font-size:24px;margin-bottom:8px;">' + gift.icon + '</div>' +
      '<div style="font-weight:700;font-size:15px;margin-bottom:4px;">' + gift.title + '</div>' +
      '<div style="font-size:13px;color:var(--warm-gray);margin-bottom:8px;">' + gift.description + '</div>' +
      '<div style="font-size:12px;color:#8B7420;background:var(--giallo-light);padding:6px 10px;border-radius:var(--radius-sm);border-left:3px solid var(--giallo);">' + gift.notes + '</div></div>';
  });
  return html;
}

function renderTodaySuggestion(city) {
  var tips = getSmartSuggestions(city);
  if (tips.length === 0) return '';
  var html = '<div class="section-header">💡 Suggestion</div>';
  tips.forEach(function(tip) {
    html += '<div class="card' + (tip.placeId ? ' card-interactive" onclick="Router.navigate(\'#place/' + tip.placeId + '\')"' : '"') +
      ' style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">' +
      '<span style="font-size:24px;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:' + tip.color + '15;flex-shrink:0;">' + tip.icon + '</span>' +
      '<span style="font-size:14px;flex:1;">' + tip.text + '</span>' +
      (tip.placeId ? '<span style="color:var(--light-gray);">→</span>' : '') + '</div>';
  });
  return html;
}

function renderTodayActions(city) {
  var slug = cityToSlug(city);
  return '<div class="quick-actions">' +
    '<button class="quick-action" onclick="openSurprise(\'' + city + '\')">' +
    '<span class="quick-action-icon">🎲</span><span class="quick-action-label">Surprise Me</span></button>' +
    '<button class="quick-action" onclick="Router.navigate(\'#journal\')">' +
    '<span class="quick-action-icon">📝</span><span class="quick-action-label">Journal</span></button>' +
    '<button class="quick-action" onclick="Router.navigate(\'#achievements\')">' +
    '<span class="quick-action-icon">🏆</span><span class="quick-action-label">Badges</span></button>' +
    '<button class="quick-action" onclick="Router.navigate(\'#city/' + slug + '\')">' +
    '<span class="quick-action-icon">🗺️</span><span class="quick-action-label">Explore ' + city.split(' ')[0] + '</span></button></div>';
}

function renderTodayPicks(city) {
  var places = Storage.getPlaces();
  var essentials = places.filter(function(p) {
    return p.city === city && p.verdict === 'essential';
  }).slice(0, 4);
  if (essentials.length === 0) return '';
  var html = '<div class="section-header">⭐ Don\'t Miss in ' + city + '</div>';
  essentials.forEach(function(p) { html += buildPlaceCard(p); });
  return html;
}

// ── Today Route Map ──
var todayMap = null;

function initTodayMap() {
  var container = document.getElementById('today-map');
  if (!container) return;
  if (typeof L === 'undefined') { container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--warm-gray);font-size:13px;">Map loads after first online visit</div>'; return; }

  if (todayMap) { todayMap.remove(); todayMap = null; }

  todayMap = L.map(container, {
    center: [43.0, 11.5],
    zoom: 6,
    zoomControl: false,
    attributionControl: false
  });

  addTileLayer(todayMap);
  addItalyMask(todayMap);

  var phase = getTripPhase();
  var currentCity = phase.phase === 'during' ? phase.city : null;

  // Draw route
  var mainCoords = ROUTE_COORDS.main.map(function(r) { return [r.lat, r.lng]; });
  L.polyline(mainCoords, { color: '#CE2B37', weight: 2.5, opacity: 0.5, dashArray: '8 6' }).addTo(todayMap);

  // City markers
  ROUTE_COORDS.main.forEach(function(r) {
    var isCurrent = r.city === currentCity;
    var size = isCurrent ? 44 : 36;
    var icon = L.divIcon({
      className: '',
      html: '<div class="route-marker' + (isCurrent ? ' route-marker-current' : '') + '" style="width:' + size + 'px;height:' + size + 'px;">' +
        '<span style="font-size:' + (isCurrent ? '22' : '18') + 'px;">' + r.emoji + '</span></div>' +
        '<div class="route-label">' + r.city + '<br><span class="route-dates">' + r.dates + '</span></div>',
      iconSize: [size, size + 30],
      iconAnchor: [size / 2, size / 2]
    });
    var marker = L.marker([r.lat, r.lng], { icon: icon }).addTo(todayMap);
    marker.on('click', function() { Router.navigate('#city/' + cityToSlug(r.city)); });
  });

  // Day trip markers
  ROUTE_COORDS.dayTrips.forEach(function(dt) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="route-marker-mini">' + dt.emoji + '</div><div class="route-label-mini">' + dt.label + '</div>',
      iconSize: [28, 40], iconAnchor: [14, 14]
    });
    L.marker([dt.lat, dt.lng], { icon: icon, interactive: false }).addTo(todayMap);
  });

  // Day trip route lines
  L.polyline([[41.8975, 12.4800], [40.6880, 14.4849]], { color: '#E8B931', weight: 1.5, opacity: 0.4, dashArray: '4 6' }).addTo(todayMap);
  L.polyline([[43.7710, 11.2540], [43.55, 11.25]], { color: '#E8B931', weight: 1.5, opacity: 0.4, dashArray: '4 6' }).addTo(todayMap);
  L.polyline([[45.8100, 9.0800], [45.4391, 10.9946], [45.4400, 12.3350]], { color: '#E8B931', weight: 1.5, opacity: 0.4, dashArray: '4 6' }).addTo(todayMap);

  setTimeout(function() { todayMap.invalidateSize(); }, CONFIG.MAP_INVALIDATE_DELAY);
}

// ── Shared place card builder ──
function buildPlaceCard(p) {
  var v = p.verdict && VERDICTS[p.verdict] ? VERDICTS[p.verdict] : null;
  var booked = isPlaceBooked(p.id);
  var verdictClass = p.verdict ? ' place-card-' + p.verdict : '';
  return '<div class="place-card' + verdictClass + '" onclick="Router.navigate(\'#place/' + p.id + '\')">' +
    '<div class="place-card-dot" style="background:' + (CAT_COLORS[p.category] || '#999') + '"></div>' +
    '<div class="place-card-info">' +
    '<div class="place-card-name">' + (CAT_ICONS[p.category] || '') + ' ' + p.name + '</div>' +
    '<div class="place-card-meta">' +
    '<span>' + p.category + '</span>' +
    (p.source ? '<span>· ' + p.source + '</span>' : '') +
    (booked ? '<span class="place-booked-badge">✓ Booked</span>' : '') +
    (v ? '<span class="verdict-badge verdict-' + p.verdict + '" style="font-size:10px;padding:2px 8px;">' + v.icon + ' ' + v.label + '</span>' : '') +
    '</div></div>' +
    '<span class="place-card-star ' + (p.saved ? 'saved' : '') + '" onclick="toggleSave(\'' + p.id + '\', event)">' + (p.saved ? '⭐' : '☆') + '</span></div>';
}

// Check if a place has been booked (from booking checklist)
function isPlaceBooked(placeId) {
  var state = getBookingState();
  for (var i = 0; i < BOOKINGS.length; i++) {
    if (BOOKINGS[i].placeId === placeId && state[BOOKINGS[i].id]) return true;
  }
  return false;
}

function toggleSave(id, evt) {
  if (evt) { evt.stopPropagation(); evt.preventDefault(); }
  var places = Storage.getPlaces();
  var p = places.find(function(x) { return x.id === id; });
  if (!p) return;
  p.saved = !p.saved;
  Storage.savePlaces(places);
  invalidatePlaceIndex();
  showToast(p.saved ? '⭐ Saved!' : 'Unsaved');
  Router.navigate();
}
