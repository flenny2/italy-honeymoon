// ═══════════════════════════════════════
// SERVICE WORKER — Offline support
// Caches all app assets + map tiles
// ═══════════════════════════════════════

var CACHE_NAME = 'italy-honeymoon-v1';

// All app files to pre-cache on install
var APP_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/pages.css',
  // Fonts
  '/fonts/fonts.css',
  '/fonts/files/font-0.ttf',
  '/fonts/files/font-1.ttf',
  '/fonts/files/font-2.ttf',
  '/fonts/files/font-3.ttf',
  '/fonts/files/font-4.ttf',
  '/fonts/files/font-5.ttf',
  '/fonts/files/font-6.ttf',
  '/fonts/files/font-7.ttf',
  // Leaflet
  '/lib/leaflet.css',
  '/lib/leaflet.js',
  '/lib/images/marker-icon.png',
  '/lib/images/marker-icon-2x.png',
  '/lib/images/marker-shadow.png',
  // JS data
  '/js/italy-border.js',
  '/js/data-places.js',
  '/js/data-phrases.js',
  '/js/data-hotels.js',
  '/js/data-trip.js',
  '/js/data-achievements.js',
  // JS core
  '/js/storage.js',
  '/js/router.js',
  '/js/animations.js',
  '/js/today.js',
  '/js/city.js',
  '/js/detail.js',
  '/js/phrasebook.js',
  '/js/journal.js',
  '/js/letters.js',
  '/js/achievements.js',
  '/js/surprise.js',
  '/js/suggestions.js',
  '/js/bookings.js',
  '/js/app.js',
];

// Install: pre-cache all app files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Pre-caching app files');
      return cache.addAll(APP_FILES);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
// For map tiles: network first, cache for offline
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Map tiles: network first, cache fallback (so tiles are fresh when online)
  if (url.hostname.includes('basemaps.cartocdn.com') ||
      url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        // Cache the tile for offline use
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        // Offline: serve from cache
        return caches.match(event.request);
      })
    );
    return;
  }

  // All other requests: cache first, network fallback
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Cache new requests for future offline use
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});
