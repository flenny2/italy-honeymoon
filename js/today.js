// ═══════════════════════════════════════
// TODAY VIEW — The home screen
// ═══════════════════════════════════════

function renderToday() {
  var content = document.getElementById('today-content');
  if (!content) return;

  var phase = getTripPhase();
  var city = getTodayCity();
  var hotel = HOTELS[city];
  var places = Storage.getPlaces();

  // Countdown banner
  var bannerHTML = '';
  if (phase.phase === 'before') {
    bannerHTML = '<div class="countdown-banner before anim-bounce-in">' +
      '<div class="countdown-number">' + phase.daysUntil + '</div>' +
      '<div class="countdown-label">days until Italy! 🇮🇹</div>' +
      '</div>';
  } else if (phase.phase === 'during') {
    var dayTrip = phase.dayTrip;
    bannerHTML = '<div class="countdown-banner during anim-bounce-in">' +
      '<div class="countdown-number">Day ' + phase.day + '</div>' +
      '<div class="countdown-label">' + (CITY_EMOJI[phase.city] || '') + ' ' + phase.city +
      (dayTrip ? ' — ' + dayTrip.emoji + ' ' + dayTrip.label : '') +
      '</div></div>';
  } else {
    bannerHTML = '<div class="countdown-banner after anim-bounce-in">' +
      '<div class="countdown-number">' + phase.daysSince + '</div>' +
      '<div class="countdown-label">days since Italy 💕</div>' +
      '</div>';
  }

  // Hotel card
  var hotelHTML = '';
  if (hotel) {
    hotelHTML = '<div class="section-header">🏨 Your Hotel</div>' +
      '<div class="hotel-card">' +
      '<div class="hotel-emoji">' + (hotel.emoji || '🏨') + '</div>' +
      '<div class="hotel-info">' +
      '<div class="hotel-name">' + hotel.name + '</div>' +
      '<div class="hotel-dates">' + hotel.dates + ' (' + hotel.nights + ' nights)</div>' +
      '<div class="hotel-address">📍 ' + hotel.address + '</div>' +
      '</div></div>';
  }

  // Phrase of the day
  var allPhrases = [];
  PHRASES.forEach(function(cat) {
    cat.phrases.forEach(function(p) { allPhrases.push(p); });
  });
  // Use date as seed for consistent daily phrase
  var today = new Date();
  var dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  var phraseIndex = dayOfYear % allPhrases.length;
  var phrase = allPhrases[phraseIndex];

  var phraseHTML = '<div class="section-header">🇮🇹 Phrase of the Day</div>' +
    '<div class="phrase-of-day">' +
    '<div class="phrase-of-day-italian">' + phrase.it + '</div>' +
    '<div class="phrase-of-day-pronounce">/' + phrase.pr + '/</div>' +
    '<div class="phrase-of-day-english">' + phrase.en + '</div>' +
    '</div>';

  // Gifted experiences for current city
  var giftHTML = '';
  var cityGifts = GIFTED_EXPERIENCES.filter(function(g) { return g.city === city; });
  if (cityGifts.length > 0) {
    giftHTML = '<div class="section-header">🎁 Wedding Gifts</div>';
    cityGifts.forEach(function(gift) {
      giftHTML += '<div class="card card-gift">' +
        '<div style="font-size:24px;margin-bottom:8px;">' + gift.icon + '</div>' +
        '<div style="font-weight:700;font-size:15px;margin-bottom:4px;">' + gift.title + '</div>' +
        '<div style="font-size:13px;color:var(--warm-gray);margin-bottom:8px;">' + gift.description + '</div>' +
        '<div style="font-size:12px;color:#8B7420;background:var(--giallo-light);padding:6px 10px;border-radius:var(--radius-sm);border-left:3px solid var(--giallo);">' + gift.notes + '</div>' +
        '</div>';
    });
  }

  // Booking reminder (only before the trip)
  var bookingHTML = '';
  if (phase.phase === 'before') {
    var bStats = getBookingStats();
    if (bStats.remaining > 0) {
      bookingHTML = '<div class="card" style="border-left:4px solid var(--rosso);cursor:pointer;" onclick="Router.navigate(\'#bookings\')">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
        '<span style="font-size:24px;">📋</span>' +
        '<div style="flex:1;">' +
        '<div style="font-weight:700;font-size:14px;">Booking Checklist</div>' +
        '<div style="font-size:12px;color:var(--rosso);font-weight:600;">' + bStats.remaining + ' of ' + bStats.total + ' still need booking</div>' +
        '</div>' +
        '<span style="color:var(--light-gray);">→</span>' +
        '</div></div>';
    }
  }

  // Smart suggestion
  var tips = getSmartSuggestions(city);
  var suggestHTML = '';
  if (tips.length > 0) {
    suggestHTML = '<div class="section-header">💡 Suggestion</div>';
    tips.forEach(function(tip) {
      suggestHTML += '<div class="card' + (tip.placeId ? ' card-interactive" onclick="Router.navigate(\'#place/' + tip.placeId + '\')"' : '"') + ' style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">' +
        '<span style="font-size:24px;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:' + tip.color + '15;flex-shrink:0;">' + tip.icon + '</span>' +
        '<span style="font-size:14px;flex:1;">' + tip.text + '</span>' +
        (tip.placeId ? '<span style="color:var(--light-gray);">→</span>' : '') +
        '</div>';
    });
  }

  // Italy route map
  var mapHTML = '<div class="section-header">🗺️ Your Route</div>' +
    '<div class="today-map-wrap">' +
    '<div id="today-map" class="today-mini-map"></div>' +
    '</div>';

  // Quick actions
  var actionsHTML = '<div class="quick-actions">' +
    '<button class="quick-action" onclick="openSurprise(\'' + city + '\')">' +
    '<span class="quick-action-icon">🎲</span>' +
    '<span class="quick-action-label">Surprise Me</span>' +
    '</button>' +
    '<button class="quick-action" onclick="Router.navigate(\'#journal\')">' +
    '<span class="quick-action-icon">📝</span>' +
    '<span class="quick-action-label">Journal</span>' +
    '</button>' +
    '<button class="quick-action" onclick="Router.navigate(\'#achievements\')">' +
    '<span class="quick-action-icon">🏆</span>' +
    '<span class="quick-action-label">Badges</span>' +
    '</button>' +
    '<button class="quick-action" onclick="Router.navigate(\'#city/' + city.toLowerCase().replace(/ /g, '-') + '\')">' +
    '<span class="quick-action-icon">🗺️</span>' +
    '<span class="quick-action-label">Explore ' + city.split(' ')[0] + '</span>' +
    '</button>' +
    '</div>';

  // Top picks for this city
  var essentials = places.filter(function(p) {
    return p.city === city && p.verdict === 'essential';
  }).slice(0, 4);

  var picksHTML = '';
  if (essentials.length > 0) {
    picksHTML = '<div class="section-header">⭐ Don\'t Miss in ' + city + '</div>';
    essentials.forEach(function(p) {
      picksHTML += buildPlaceCard(p);
    });
  }

  content.innerHTML = '<div class="stagger">' +
    '<div class="today-section">' + bannerHTML + '</div>' +
    '<div class="today-section">' + hotelHTML + '</div>' +
    '<div class="today-section">' + mapHTML + '</div>' +
    '<div class="today-section">' + bookingHTML + '</div>' +
    '<div class="today-section">' + phraseHTML + '</div>' +
    '<div class="today-section">' + giftHTML + '</div>' +
    '<div class="today-section">' + suggestHTML + '</div>' +
    '<div class="today-section">' + actionsHTML + '</div>' +
    '<div class="today-section">' + picksHTML + '</div>' +
    '</div>';

  // Init the route map after DOM is ready
  setTimeout(initTodayMap, 50);
}

// ── Today Route Map ──
var todayMap = null;

function initTodayMap() {
  var container = document.getElementById('today-map');
  if (!container) return;

  // Clean up previous map
  if (todayMap) { todayMap.remove(); todayMap = null; }

  todayMap = L.map(container, {
    center: [43.0, 11.5],
    zoom: 6,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18
  }).addTo(todayMap);

  // Darken everything except Italy
  addItalyMask(todayMap);

  // Route coordinates in travel order
  var route = [
    { city: 'Rome',      lat: 41.8975, lng: 12.4800, days: 'Days 1–5',  dates: 'Jun 13–18', emoji: '🏛️' },
    { city: 'Florence',  lat: 43.7710, lng: 11.2540, days: 'Days 6–9',  dates: 'Jun 18–22', emoji: '🌻' },
    { city: 'Lake Como', lat: 45.8100, lng: 9.0800,  days: 'Days 10–11',dates: 'Jun 22–24', emoji: '⛰️' },
    { city: 'Venice',    lat: 45.4400, lng: 12.3350, days: 'Days 12–14',dates: 'Jun 24–27', emoji: '🚣' }
  ];

  // Draw route line (dashed, rosso)
  var routeCoords = route.map(function(r) { return [r.lat, r.lng]; });
  L.polyline(routeCoords, {
    color: '#CE2B37',
    weight: 2.5,
    opacity: 0.5,
    dashArray: '8 6'
  }).addTo(todayMap);

  // Determine current city
  var phase = getTripPhase();
  var currentCity = phase.phase === 'during' ? phase.city : null;

  // Add city markers
  route.forEach(function(r) {
    var isCurrent = r.city === currentCity;
    var size = isCurrent ? 44 : 36;

    var icon = L.divIcon({
      className: '',
      html: '<div class="route-marker' + (isCurrent ? ' route-marker-current' : '') + '" style="width:' + size + 'px;height:' + size + 'px;">' +
        '<span style="font-size:' + (isCurrent ? '22' : '18') + 'px;">' + r.emoji + '</span>' +
        '</div>' +
        '<div class="route-label">' + r.city + '<br><span class="route-dates">' + r.dates + '</span></div>',
      iconSize: [size, size + 30],
      iconAnchor: [size / 2, size / 2]
    });

    var marker = L.marker([r.lat, r.lng], { icon: icon }).addTo(todayMap);
    marker.on('click', function() {
      Router.navigate('#city/' + cityToSlug(r.city));
    });
  });

  // Add day trip markers (smaller, secondary)
  var dayTrips = [
    { label: 'Tuscany', lat: 43.55, lng: 11.25, emoji: '🍷' },
    { label: 'Verona',  lat: 45.4391, lng: 10.9946, emoji: '💌' },
    { label: 'Amalfi',  lat: 40.6280, lng: 14.4850, emoji: '🏖️' },
    { label: 'Pompeii', lat: 40.7484, lng: 14.4848, emoji: '🌋' }
  ];

  dayTrips.forEach(function(dt) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="route-marker-mini">' + dt.emoji + '</div>' +
        '<div class="route-label-mini">' + dt.label + '</div>',
      iconSize: [28, 40],
      iconAnchor: [14, 14]
    });
    L.marker([dt.lat, dt.lng], { icon: icon }).addTo(todayMap);
  });

  // Day trip route lines (dotted, lighter)
  // Rome → Amalfi/Pompeii
  L.polyline([[41.8975, 12.4800], [40.6880, 14.4849]], {
    color: '#E8B931', weight: 1.5, opacity: 0.4, dashArray: '4 6'
  }).addTo(todayMap);
  // Florence → Tuscany
  L.polyline([[43.7710, 11.2540], [43.55, 11.25]], {
    color: '#E8B931', weight: 1.5, opacity: 0.4, dashArray: '4 6'
  }).addTo(todayMap);
  // Como → Verona → Venice
  L.polyline([[45.8100, 9.0800], [45.4391, 10.9946], [45.4400, 12.3350]], {
    color: '#E8B931', weight: 1.5, opacity: 0.4, dashArray: '4 6'
  }).addTo(todayMap);

  setTimeout(function() { todayMap.invalidateSize(); }, 100);
}

// Shared place card builder (used across Today, City pages)
function buildPlaceCard(p) {
  var v = p.verdict && VERDICTS[p.verdict] ? VERDICTS[p.verdict] : null;
  return '<div class="place-card" onclick="Router.navigate(\'#place/' + p.id + '\')">' +
    '<div class="place-card-dot" style="background:' + (CAT_COLORS[p.category] || '#999') + '"></div>' +
    '<div class="place-card-info">' +
    '<div class="place-card-name">' + (CAT_ICONS[p.category] || '') + ' ' + p.name + '</div>' +
    '<div class="place-card-meta">' +
    '<span>' + p.category + '</span>' +
    (p.source ? '<span>· ' + p.source + '</span>' : '') +
    (v ? '<span class="verdict-badge verdict-' + p.verdict + '" style="font-size:10px;padding:2px 8px;">' + v.icon + ' ' + v.label + '</span>' : '') +
    '</div>' +
    '</div>' +
    '<span class="place-card-star ' + (p.saved ? 'saved' : '') + '" onclick="toggleSave(\'' + p.id + '\', event)">' + (p.saved ? '⭐' : '☆') + '</span>' +
    '</div>';
}

function toggleSave(id, evt) {
  if (evt) { evt.stopPropagation(); evt.preventDefault(); }
  var places = Storage.getPlaces();
  var p = places.find(function(x) { return x.id === id; });
  if (!p) return;
  p.saved = !p.saved;
  Storage.savePlaces(places);
  showToast(p.saved ? '⭐ Saved!' : 'Unsaved');
  // Re-render current page
  Router.navigate();
}
