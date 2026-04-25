// ═══════════════════════════════════════
// MAP-SHARED — Helpers used by both the
// Today mini-map and the full-screen Map tab.
//
// Depends on: ROUTE_COORDS (helpers.js), HOTELS (data-hotels.js), Leaflet (L).
// Bare globals to match the rest of the codebase.
// ═══════════════════════════════════════

// Hardcoded day-trip route polylines (Rome→Amalfi/Pompeii, Florence→Tuscany,
// Como→Verona→Venice). Could move into a data file later.
var DAY_TRIP_LINE_COORDS = [
  [[41.8975, 12.4800], [40.6880, 14.4849]],
  [[43.7710, 11.2540], [43.55, 11.25]],
  [[45.8100, 9.0800], [45.4391, 10.9946], [45.4400, 12.3350]]
];

// Draw the main route polyline + day-trip polylines + day-trip markers.
// Returns { lines: Layer[] } so the caller can track them for later removal.
//
// opts:
//   routeStyle:           Leaflet polyline opts for the main red route line
//   dayTripStyle:         Leaflet polyline opts for the gold day-trip lines
//   dayTripMarkerClass:   CSS class for the day-trip pin (default 'map-dt-marker')
//   dayTripLabelClass:    CSS class for the day-trip label (default 'map-dt-label')
function drawTravelRoute(map, opts) {
  opts = opts || {};
  var routeStyle = Object.assign({
    color: '#CE2B37', weight: 3, opacity: 0.5, dashArray: '10 8'
  }, opts.routeStyle || {});
  var dayTripStyle = Object.assign({
    color: '#E8B931', weight: 2, opacity: 0.4, dashArray: '6 6'
  }, opts.dayTripStyle || {});
  var dayTripMarkerClass = opts.dayTripMarkerClass || 'map-dt-marker';
  var dayTripLabelClass = opts.dayTripLabelClass || 'map-dt-label';

  var lines = [];

  // Main route
  var mainCoords = ROUTE_COORDS.main.map(function(r) { return [r.lat, r.lng]; });
  lines.push(L.polyline(mainCoords, routeStyle).addTo(map));

  // Day trip route lines
  DAY_TRIP_LINE_COORDS.forEach(function(coords) {
    lines.push(L.polyline(coords, dayTripStyle).addTo(map));
  });

  // Day trip markers
  ROUTE_COORDS.dayTrips.forEach(function(dt) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="' + dayTripMarkerClass + '">' + dt.emoji + '</div>' +
            '<div class="' + dayTripLabelClass + '">' + dt.label + '</div>',
      iconSize: [28, 40],
      iconAnchor: [14, 14]
    });
    L.marker([dt.lat, dt.lng], { icon: icon, interactive: false }).addTo(map);
  });

  return { lines: lines };
}

// Add the hotel "house" markers for one city or all cities.
// Returns Array<{ marker: L.Marker, city: string }> so the caller can track for filtering.
//
// opts:
//   cityFilter:   single city name; if set, only that hotel is added
//   size:         marker diameter in px (default 36)
//   showLabel:    show the wrapped name label below the marker (default true)
function addHotelMarkers(map, opts) {
  opts = opts || {};
  var size = opts.size || 36;
  var showLabel = opts.showLabel !== false;
  var iconAnchor = size / 2;
  var iconHeight = showLabel ? size + 14 : size;
  var hotels = [];

  Object.keys(HOTELS).forEach(function(cityName) {
    if (opts.cityFilter && cityName !== opts.cityFilter) return;
    var h = HOTELS[cityName];
    var labelHTML = showLabel
      ? '<div class="map-hotel-label">' + h.name.split(' ').slice(0, 3).join(' ') + '</div>'
      : '';
    var icon = L.divIcon({
      className: '',
      html: '<div class="map-hotel-marker" style="width:' + size + 'px;height:' + size + 'px;">' +
        '<span class="map-hotel-icon" style="font-size:' + Math.round(size * 0.5) + 'px;">🏠</span>' +
        '</div>' + labelHTML,
      iconSize: [size, iconHeight],
      iconAnchor: [iconAnchor, iconAnchor]
    });

    var marker = L.marker([h.lat, h.lng], { icon: icon, zIndexOffset: 1000 }).addTo(map);
    marker.bindPopup(
      '<div class="popup-inner">' +
      '<div class="popup-name">🏠 ' + h.name + '</div>' +
      '<div class="popup-meta">' + h.dates + ' · ' + h.address + '</div>' +
      '</div>'
    );
    hotels.push({ marker: marker, city: cityName });
  });

  return hotels;
}
