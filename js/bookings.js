// ═══════════════════════════════════════
// BOOKING CHECKLIST
// Prioritized reservation tracker
// ═══════════════════════════════════════

var BOOKINGS = [
  // 🔴 BOOK NOW — these sell out weeks ahead in June
  { id: 'bk-vatican', placeId: 'l2', urgency: 'now',
    title: 'Vatican Museums & Sistine Chapel',
    city: 'Rome', when: 'June 13–17',
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
  { id: 'bk-colosseum', placeId: 'l1', urgency: 'soon',
    title: 'Colosseum + Roman Forum',
    city: 'Rome', when: 'June 13–17',
    what: 'Timed entry combo ticket (may be covered by gift tour!)',
    why: 'You have a gifted Colosseum/Forum/Palatine tour — check if tickets are included or if you need separate entry.',
    tip: 'Verify your gift voucher covers entry. If not, book the combo ticket online.',
    url: '' },

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
    tip: 'Try the bistecca alla fiorentina served medium-rare at room temperature — the proper Florentine way.',
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

  { id: 'bk-gondola', placeId: null, urgency: 'soon',
    title: 'Gondola Serenade (Wedding Gift)',
    city: 'Venice', when: 'June 24–26',
    what: 'Schedule specific date/time with provider',
    why: 'This is a wedding gift — check the voucher and book a specific evening slot.',
    tip: 'Evening is most romantic. The canals at golden hour are pure magic.',
    url: '' },

  { id: 'bk-pantheon', placeId: 'l5', urgency: 'soon',
    title: 'Pantheon',
    city: 'Rome', when: 'June 13–17',
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

  // 🟢 NO BOOKING NEEDED — walk-in friendly
  // (not shown in checklist, but noted for reference)
];

// Storage key for booking checkboxes
var BOOKING_STORAGE_KEY = 'italy-bookings-v1';

function getBookingState() {
  try {
    var data = localStorage.getItem(BOOKING_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) { return {}; }
}

function toggleBooking(id) {
  var state = getBookingState();
  state[id] = !state[id];
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(state));
  renderBookings();
}

function getBookingStats() {
  var state = getBookingState();
  var total = BOOKINGS.length;
  var booked = 0;
  BOOKINGS.forEach(function(b) { if (state[b.id]) booked++; });
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
      ? '<div style="text-align:center;font-size:12px;color:var(--rosso);font-weight:600;margin-top:6px;">⚠️ ' + stats.remaining + ' still need booking</div>'
      : '<div style="text-align:center;font-size:12px;color:var(--verde);font-weight:600;margin-top:6px;">✅ All booked! You\'re ready for Italy!</div>') +
    '</div>';

  // Group by urgency
  var groups = { 'now': [], 'soon': [] };
  BOOKINGS.forEach(function(b) {
    if (groups[b.urgency]) groups[b.urgency].push(b);
  });

  var listHTML = '<div class="content-wrap">';

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
