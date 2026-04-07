// ═══════════════════════════════════════
// CITY PAGE — Mini map + place cards
// ═══════════════════════════════════════

var cityMaps = {};
var activeMoodFilter = null;

function renderCity(citySlug) {
  var content = document.getElementById('city-content');
  if (!content) return;

  // Convert slug back to city name
  var cityName = slugToCity(citySlug);
  if (!cityName) {
    Router.navigate('#explore');
    return;
  }

  var places = Storage.getPlaces();
  var cityPlaces = places.filter(function(p) { return p.city === cityName; });
  var hotel = HOTELS[cityName];
  activeMoodFilter = null;

  // City header
  var emoji = CITY_EMOJI[cityName] || '📍';
  var headerHTML = '<div class="city-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#explore\')">← Explore</button>' +
    '<h1>' + emoji + ' ' + cityName + '</h1>' +
    '<div style="font-size:13px;color:var(--warm-gray);">' + cityPlaces.length + ' places</div>' +
    '</div>';

  // Hotel card
  var hotelHTML = '';
  if (hotel) {
    hotelHTML = '<div class="today-section">' +
      '<div class="hotel-card">' +
      '<div class="hotel-emoji">' + (hotel.emoji || '🏨') + '</div>' +
      '<div class="hotel-info">' +
      '<div class="hotel-name">' + hotel.name + '</div>' +
      '<div class="hotel-dates">' + hotel.dates + '</div>' +
      '<div class="hotel-address">📍 ' + hotel.address + '</div>' +
      '</div></div></div>';
  }

  // Gifted experiences
  var giftHTML = '';
  var cityGifts = GIFTED_EXPERIENCES.filter(function(g) { return g.city === cityName; });
  if (cityGifts.length > 0) {
    cityGifts.forEach(function(gift) {
      giftHTML += '<div class="today-section"><div class="card card-gift">' +
        '<div style="font-weight:700;">' + gift.icon + ' ' + gift.title + '</div>' +
        '<div style="font-size:13px;color:var(--warm-gray);margin-top:4px;">' + gift.notes + '</div>' +
        '</div></div>';
    });
  }

  // Mini map container
  var mapHTML = '<div class="city-mini-map" id="city-map-' + citySlug + '"></div>';

  // Mood bar
  var moodHTML = '<div class="city-mood-bar"><div class="mood-bar" id="city-mood-bar">';
  Object.keys(MOODS).forEach(function(key) {
    var m = MOODS[key];
    moodHTML += '<button class="mood-pill" data-mood="' + key + '" onclick="filterCityMood(\'' + key + '\', \'' + citySlug + '\')">' +
      '<span>' + m.icon + '</span> ' + key +
      '</button>';
  });
  moodHTML += '</div></div>';

  // Place list
  var listHTML = '<div class="city-places" id="city-place-list"></div>';

  content.innerHTML = headerHTML + hotelHTML + giftHTML + mapHTML + moodHTML + listHTML;

  // Render place list
  renderCityPlaces(cityName);

  // Init mini map after DOM is ready
  setTimeout(function() { initCityMap(citySlug, cityName, cityPlaces); }, 50);
}

function renderCityPlaces(cityName) {
  var list = document.getElementById('city-place-list');
  if (!list) return;

  var places = Storage.getPlaces();
  var cityPlaces = places.filter(function(p) { return p.city === cityName; });

  // Apply mood filter
  if (activeMoodFilter) {
    cityPlaces = cityPlaces.filter(function(p) {
      return autoTag(p).indexOf(activeMoodFilter) !== -1;
    });
  }

  // Sort by verdict priority
  var verdictOrder = { 'essential': 0, 'hidden-gem': 1, 'worth-it': 2, 'nice': 3, 'overrated': 4 };
  cityPlaces.sort(function(a, b) {
    var va = a.verdict ? (verdictOrder[a.verdict] !== undefined ? verdictOrder[a.verdict] : 5) : 5;
    var vb = b.verdict ? (verdictOrder[b.verdict] !== undefined ? verdictOrder[b.verdict] : 5) : 5;
    if (va !== vb) return va - vb;
    return a.name.localeCompare(b.name);
  });

  var html = '';
  if (cityPlaces.length === 0) {
    html = '<div style="text-align:center;padding:32px;color:var(--warm-gray);">No places match this mood.</div>';
  } else {
    cityPlaces.forEach(function(p) {
      html += buildPlaceCard(p);
    });
  }
  list.innerHTML = html;
}

function filterCityMood(mood, citySlug) {
  var cityName = slugToCity(citySlug);
  if (activeMoodFilter === mood) {
    activeMoodFilter = null;
  } else {
    activeMoodFilter = mood;
  }

  // Update pill UI
  var pills = document.querySelectorAll('#city-mood-bar .mood-pill');
  for (var i = 0; i < pills.length; i++) {
    var pill = pills[i];
    var m = MOODS[pill.dataset.mood];
    if (pill.dataset.mood === activeMoodFilter) {
      pill.classList.add('active');
      pill.style.background = m.color;
      pill.style.borderColor = m.color;
      pill.style.color = '#fff';
    } else {
      pill.classList.remove('active');
      pill.style.background = '';
      pill.style.borderColor = '';
      pill.style.color = '';
    }
  }

  renderCityPlaces(cityName);
}

function initCityMap(slug, cityName, cityPlaces) {
  var container = document.getElementById('city-map-' + slug);
  if (!container) return;

  // Remove existing map
  if (cityMaps[slug]) {
    cityMaps[slug].remove();
    cityMaps[slug] = null;
  }

  var view = CITY_VIEWS[cityName] || CITY_VIEWS['all'];
  var map = L.map(container, {
    center: view.center,
    zoom: view.zoom,
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 80
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18
  }).addTo(map);

  // Add hotel marker first (so it's always visible)
  var hotel = HOTELS[cityName];
  if (hotel) {
    var hotelIcon = L.divIcon({
      className: '',
      html: '<div class="map-hotel-marker" style="width:32px;height:32px;">' +
        '<span class="map-hotel-icon" style="font-size:16px;">🏠</span></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    var hotelMarker = L.marker([hotel.lat, hotel.lng], { icon: hotelIcon, zIndexOffset: 1000 }).addTo(map);
    hotelMarker.bindPopup(
      '<div class="popup-inner">' +
      '<div class="popup-name">🏠 ' + hotel.name + '</div>' +
      '<div class="popup-meta">' + hotel.dates + '</div>' +
      '</div>'
    );
  }

  // Add place markers
  cityPlaces.forEach(function(p) {
    if (p.category === 'transit' || p.category === 'pharmacy' || p.category === 'restroom') return;
    var color = CAT_COLORS[p.category] || '#999';
    var v = p.verdict && VERDICTS[p.verdict] ? VERDICTS[p.verdict] : null;
    var ringStyle = '';
    if (p.verdict === 'essential') ringStyle = 'box-shadow:0 0 0 2px rgba(0,140,69,0.4), 0 2px 6px rgba(0,0,0,0.2);';
    else if (p.verdict === 'hidden-gem') ringStyle = 'box-shadow:0 0 0 2px rgba(139,92,246,0.4), 0 2px 6px rgba(0,0,0,0.2);';

    var icon = L.divIcon({
      className: '',
      html: '<div class="custom-marker" style="background:' + color + ';width:24px;height:24px;' + ringStyle + '">' +
        (CAT_ICONS[p.category] || '📍') + '</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    var marker = L.marker([p.lat, p.lng], { icon: icon }).addTo(map);
    marker.on('click', function() {
      Router.navigate('#place/' + p.id);
    });
  });

  cityMaps[slug] = map;

  // Fix map size after render
  setTimeout(function() { map.invalidateSize(); }, 100);
}

// Slug helpers
function cityToSlug(name) {
  return name.toLowerCase().replace(/ /g, '-');
}

function slugToCity(slug) {
  if (!slug) return null;
  var map = {};
  CITIES.forEach(function(c) { map[cityToSlug(c)] = c; });
  // Also handle Verona
  map['verona'] = 'Verona';
  return map[slug] || null;
}
