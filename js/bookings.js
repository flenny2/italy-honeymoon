// ═══════════════════════════════════════
// BOOKING CHECKLIST
// Prioritized reservation tracker
// ═══════════════════════════════════════

var BOOKINGS = [
  // 🔴 BOOK NOW — these sell out weeks ahead in June
  { id: 'bk-vatican', placeId: 'l2', urgency: 'now',
    title: 'Vatican Museums, Sistine Chapel & St Peter\'s Basilica',
    city: 'Rome', when: 'June 18, 8:00 AM',
    what: 'Timed entry tickets online',
    why: 'Sells out weeks ahead in June. Book 8am slot for smallest crowds.',
    tip: 'Skip the audio guide — a human guide is worth the extra cost.',
    url: '' },

  { id: 'bk-borghese', placeId: 'l10', urgency: 'now',
    title: 'Borghese Gallery',
    city: 'Rome', when: 'June 13–17',
    what: 'Timed 2-hour entry slot',
    why: 'Only 360 visitors per slot. Sells out fast. Book the first morning slot.',
    tip: 'Walk through Villa Borghese park to get there — beautiful approach.',
    url: '' },

  { id: 'bk-amalfi', placeId: 'a1', urgency: 'now',
    title: 'Pompeii, Amalfi & Positano Day Trip',
    city: 'Rome', when: 'June 16, 7:10 AM',
    what: 'Full-day guided tour from Rome (Pompeii + Positano/Amalfi Coast)',
    why: 'Long ~13-hour day departing 7:10 AM — guided tours with transport sell out in June. Book ahead.',
    tip: 'Pompeii in the cooler morning, then a long terrace lunch on the coast. Bring water and comfortable shoes.',
    url: '' },

  { id: 'bk-uffizi', placeId: 'f2', urgency: 'now',
    title: 'Uffizi Gallery',
    city: 'Florence', when: 'June 18–21',
    what: 'Timed entry tickets online',
    why: 'Sells out in peak season. Early morning or late afternoon slots are best.',
    tip: 'Pick 10-15 works you care about and beeline for those. Do not try to see everything.',
    url: '' },

  { id: 'bk-roscioli', placeId: 'r1', urgency: 'now',
    title: 'Roscioli Salumeria con Cucina',
    city: 'Rome', when: 'June 13–17 (dinner)',
    what: 'Dinner reservation',
    why: 'Nathan\'s top pick. Books out weeks ahead — one of the hardest reservations in Rome.',
    tip: 'Load up on antipasti and cheeses instead of secondi. The carbonara is elite.',
    url: '' },

  { id: 'bk-alcovo', placeId: 'v1', urgency: 'now',
    title: 'Al Covo',
    city: 'Venice', when: 'June 24–26 (dinner)',
    what: 'Dinner reservation',
    why: 'Nathan\'s top Venice pick. Michelin-recognized, small and intimate. Book for your best Venice night.',
    tip: 'Don\'t skip Diane\'s chocolate cake for dessert.',
    url: '' },

  // 🟡 BOOK SOON — recommended but more flexible
  // (Colosseum / Roman Forum is now owned by gift-1 — see GIFTED_EXPERIENCES.)
  { id: 'bk-duomo', placeId: 'f1', urgency: 'soon',
    title: 'Florence Duomo Dome Climb',
    city: 'Florence', when: 'June 18–21',
    what: 'Dome climb tickets online (€30 combo)',
    why: '463 steps, no elevator. The combo ticket also covers the bell tower and museum.',
    tip: 'Book an early morning slot — less heat, fewer crowds on the narrow staircase.',
    url: '' },

  { id: 'bk-felice', placeId: 'g1', urgency: 'soon',
    title: 'Felice a Testaccio',
    city: 'Rome', when: 'June 13–17 (dinner)',
    what: 'Dinner reservation',
    why: 'The most famous cacio e pepe in Rome. Popular with locals and visitors alike.',
    tip: 'Watch them toss the cacio e pepe tableside. Photograph it.',
    url: '' },

  { id: 'bk-13gobbi', placeId: 'g3', urgency: 'soon',
    title: 'Trattoria 13 Gobbi',
    city: 'Florence', when: 'June 18–21 (dinner)',
    what: 'Dinner reservation',
    why: 'Fills up nightly. The rigatoni is legendary. Ask for courtyard seating.',
    tip: 'Try the bistecca alla fiorentina — served rare to medium-rare, rested, the proper Florentine way.',
    url: '' },

  { id: 'bk-santobevitore', placeId: 'g4', urgency: 'soon',
    title: 'Il Santo Bevitore',
    city: 'Florence', when: 'June 18–21 (dinner)',
    what: 'Dinner reservation',
    why: 'The most romantic dinner spot in Florence. Candlelit stone walls, incredible wine list.',
    tip: 'Book for sunset, then continue next door at Santino wine bar after.',
    url: '' },

  { id: 'bk-balbianello', placeId: 'l16', urgency: 'soon',
    title: 'Villa del Balbianello Tour',
    city: 'Lake Como', when: 'June 22–23',
    what: 'Villa tour reservation',
    why: 'The must-see villa on Como. Star Wars and Bond filming location. Book the tour in advance.',
    tip: 'Water taxi from Lenno or 1km walk to reach it.',
    url: '' },

  // (Gondola Serenade is now owned by gift-2 — see GIFTED_EXPERIENCES.)
  { id: 'bk-pantheon', placeId: 'l5', urgency: 'soon',
    title: 'Pantheon',
    city: 'Rome', when: 'June 15, 10:00 AM',
    what: 'Timed entry reservation (€5)',
    why: 'Now requires reservation. Quick to book, unlikely to sell out, but don\'t forget.',
    tip: 'Takes 20-30 minutes. The oculus is mesmerizing.',
    url: '' },

  { id: 'bk-doges', placeId: 'l12', urgency: 'soon',
    title: 'Doge\'s Palace — Secret Itineraries Tour',
    city: 'Venice', when: 'June 24–26',
    what: 'Secret Itineraries tour booking',
    why: 'The hidden rooms, prisons, and spy passages tour is way better than the standard route.',
    tip: 'Book ahead — limited spots on this specific tour.',
    url: '' },

  { id: 'bk-antinori', placeId: 't3', urgency: 'soon',
    title: 'Antinori Winery Tasting + Lunch',
    city: 'Tuscany', when: 'June 20',
    what: 'Wine tasting reservation + lunch at Rinuccio 1180',
    why: 'The best winery near Florence. Book the tasting and lunch together for the full experience.',
    tip: 'Book lunch at Rinuccio 1180 too — vineyard views and excellent food. Worth combining.',
    url: '' },

  // 🟢 NO BOOKING NEEDED — walk-in friendly
  // (not shown in checklist, but noted for reference)
];

// Booking checklist state lives in Storage (key: italy-bookings-v1).
// Mixed shape: state[venueId] = true; state[giftId] = { status: '...' }.
function getBookingState() {
  return Storage.getBookings();
}

function toggleBooking(id) {
  var state = getBookingState();
  state[id] = !state[id];
  Storage.saveBookings(state);
  renderBookings();
}

// Unified entry view across BOOKINGS (venues) and GIFTED_EXPERIENCES (gifts).
// Discriminator: entry.source = 'venue' | 'registry-gift'.
function getAllEntries() {
  var venues = BOOKINGS.map(function(b) {
    return {
      source: 'venue', id: b.id, title: b.title, city: b.city,
      placeIds: b.placeId ? [b.placeId] : [],
      urgency: b.urgency, when: b.when, what: b.what,
      why: b.why, tip: b.tip, url: b.url
    };
  });
  var gifts = (typeof GIFTED_EXPERIENCES !== 'undefined' ? GIFTED_EXPERIENCES : []).map(function(g) {
    return {
      source: 'registry-gift', id: g.id, title: g.title, city: g.city,
      placeIds: g.linkedPlaces || [],
      giver: g.giver, icon: g.icon, description: g.description,
      date: g.date, time: g.time, duration: g.duration,
      bookingStatus: g.bookingStatus, confirmationUrl: g.confirmationUrl,
      notes: g.notes
    };
  });
  return venues.concat(gifts);
}

// Returns the effective status for an entry, reading user state and applying
// the scheduled→completed auto-transition for gifts whose date has passed.
// Returns: 'booked'|'pending' for venues; 'voucher-only'|'scheduled'|'completed' for gifts.
function getEntryStatus(entry) {
  var state = getBookingState();
  var s = state[entry.id];
  if (entry.source === 'registry-gift') {
    var stored = (s && s.status) || entry.bookingStatus || 'voucher-only';
    if (stored === 'scheduled' && entry.date) {
      var todayISO = localISODate();
      if (entry.date < todayISO) return 'completed';
    }
    return stored;
  }
  return s === true ? 'booked' : 'pending';
}

// Set a gift's status. Called from gift card UI in renderBookings.
function setGiftStatus(giftId, status) {
  var state = getBookingState();
  state[giftId] = Object.assign({}, state[giftId] || {}, { status: status });
  Storage.saveBookings(state);
  renderBookings();
}

function getBookingStats() {
  var entries = getAllEntries();
  var total = entries.length;
  var booked = 0;
  entries.forEach(function(e) {
    var st = getEntryStatus(e);
    if (st === 'booked' || st === 'scheduled' || st === 'completed') booked++;
  });
  return { booked: booked, total: total, remaining: total - booked };
}

function renderBookings() {
  var content = document.getElementById('bookings-content');
  if (!content) return;

  var state = getBookingState();
  var stats = getBookingStats();

  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>📋 Booking Checklist</h1>' +
    '<div class="subtitle">' + stats.booked + ' of ' + stats.total + ' booked</div>' +
    '</div>';

  // Progress
  var pct = stats.total > 0 ? Math.round((stats.booked / stats.total) * 100) : 0;
  var progressHTML = '<div class="content-wrap" style="margin-bottom:16px;">' +
    '<div style="height:8px;background:var(--light-gray);border-radius:4px;overflow:hidden;">' +
    '<div style="height:100%;width:' + pct + '%;background:' + (pct === 100 ? 'var(--verde)' : 'var(--rosso)') + ';border-radius:4px;transition:width 0.5s var(--bounce);"></div>' +
    '</div>' +
    (stats.remaining > 0
      ? '<div class="bookings-status-line urgent">⚠️ ' + stats.remaining + ' still need booking</div>'
      : '<div class="bookings-status-line done">✅ All booked! You\'re ready for Italy!</div>') +
    '</div>';

  // Group by urgency
  var groups = { 'now': [], 'soon': [] };
  BOOKINGS.forEach(function(b) {
    if (groups[b.urgency]) groups[b.urgency].push(b);
  });

  var listHTML = '<div class="content-wrap">';

  // 🎁 Wedding Gift Experiences — top slot (emotional priority)
  var gifts = getAllEntries().filter(function(e) { return e.source === 'registry-gift'; });
  if (gifts.length > 0) {
    listHTML += '<div class="booking-urgency-header booking-urgency-gift">🎁 Wedding Gift Experiences</div>';
    gifts.forEach(function(g) {
      listHTML += buildGiftCard(g);
    });
  }

  // Book NOW
  if (groups.now.length > 0) {
    listHTML += '<div class="booking-urgency-header booking-urgency-now">🔴 Book NOW — sells out in June</div>';
    groups.now.forEach(function(b) {
      listHTML += buildBookingCard(b, state[b.id]);
    });
  }

  // Book SOON
  if (groups.soon.length > 0) {
    listHTML += '<div class="booking-urgency-header booking-urgency-soon">🟡 Book Soon — recommended in advance</div>';
    groups.soon.forEach(function(b) {
      listHTML += buildBookingCard(b, state[b.id]);
    });
  }

  listHTML += '</div>';

  content.innerHTML = headerHTML + progressHTML + listHTML;
}

function buildBookingCard(b, isBooked) {
  return '<div class="booking-card ' + (isBooked ? 'booking-booked' : '') + '">' +
    '<div class="booking-check" onclick="toggleBooking(\'' + b.id + '\')">' +
    (isBooked ? '✅' : '⬜') +
    '</div>' +
    '<div class="booking-info">' +
    '<div class="booking-title">' + b.title + '</div>' +
    '<div class="booking-meta">' +
    '<span class="booking-city">' + (CITY_EMOJI[b.city] || '📍') + ' ' + b.city + '</span>' +
    '<span class="booking-when">' + b.when + '</span>' +
    '</div>' +
    '<div class="booking-what">' + b.what + '</div>' +
    '<div class="booking-why">' + b.why + '</div>' +
    (b.tip ? '<div class="booking-tip">💡 ' + b.tip + '</div>' : '') +
    '</div>' +
    (b.placeId ? '<div class="booking-link" onclick="Router.navigate(\'#place/' + b.placeId + '\')">→</div>' : '') +
    '</div>';
}

// Human-readable status line for a gift, used by both bookings.js and detail.js.
function formatGiftStatus(g) {
  var status = getEntryStatus(g);
  if (status === 'completed') return 'Completed ✓';
  if (status === 'scheduled') {
    if (g.date) {
      var d = new Date(g.date + 'T00:00:00');
      var pretty = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      return 'Scheduled ' + pretty + (g.time ? ' at ' + g.time : '');
    }
    return 'Scheduled';
  }
  return '⚠️ Voucher only — schedule with provider';
}

function buildGiftCard(g) {
  var status = getEntryStatus(g);
  var statusClass = 'gift-status-' + status; // voucher-only | scheduled | completed
  var giverLine = g.giver
    ? '<div class="gift-card-giver">A gift from ' + g.giver + '</div>'
    : '<div class="gift-card-giver gift-card-giver-empty">A gift from …</div>';
  var urlLine = g.confirmationUrl
    ? '<a class="gift-card-url" href="' + g.confirmationUrl + '" target="_blank" rel="noopener">View voucher / provider →</a>'
    : '';
  var placeLink = (g.placeIds && g.placeIds[0])
    ? '<div class="booking-link" onclick="Router.navigate(\'#place/' + g.placeIds[0] + '\')">→</div>'
    : '';
  return '<div class="booking-card booking-card-gift ' + statusClass + '">' +
    '<div class="gift-card-icon">' + (g.icon || '🎁') + '</div>' +
    '<div class="booking-info">' +
    '<div class="booking-title">' + g.title + '</div>' +
    giverLine +
    '<div class="gift-card-status">' + formatGiftStatus(g) + '</div>' +
    '<div class="booking-what">' + (g.description || '') + '</div>' +
    (g.notes ? '<div class="booking-tip">💡 ' + g.notes + '</div>' : '') +
    urlLine +
    '</div>' +
    placeLink +
    '</div>';
}
