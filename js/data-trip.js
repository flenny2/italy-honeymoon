// ═══════════════════════════════════════
// TRIP SCHEDULE & CONSTANTS
// ═══════════════════════════════════════

const TRIP = {
  startDate: '2026-06-13',
  endDate: '2026-06-27',
  totalDays: 14,
  schedule: [
    { date: '2026-06-13', city: 'Rome', day: 1 },
    { date: '2026-06-14', city: 'Rome', day: 2 },
    { date: '2026-06-15', city: 'Rome', day: 3 },
    { date: '2026-06-16', city: 'Rome', day: 4 },
    { date: '2026-06-17', city: 'Rome', day: 5 },
    { date: '2026-06-18', city: 'Florence', day: 6 },
    { date: '2026-06-19', city: 'Florence', day: 7 },
    { date: '2026-06-20', city: 'Florence', day: 8 },
    { date: '2026-06-21', city: 'Florence', day: 9 },
    { date: '2026-06-22', city: 'Lake Como', day: 10 },
    { date: '2026-06-23', city: 'Lake Como', day: 11 },
    { date: '2026-06-24', city: 'Venice', day: 12 },
    { date: '2026-06-25', city: 'Venice', day: 13 },
    { date: '2026-06-26', city: 'Venice', day: 14 },
  ],
  dayTrips: {
    '2026-06-16': { label: 'Pompeii / Amalfi / Positano day trip', from: 'Rome', emoji: '🌊' },
    '2026-06-19': { label: 'Bologna half-day', from: 'Florence', emoji: '🟥' },
    '2026-06-20': { label: 'Tuscany / Chianti day trip', from: 'Florence', emoji: '🍷' },
  }
};

// Cities in travel order (Bologna inserted as Florence day-trip — TRIP.schedule
// for Jun 19 stays 'Florence'; dayTrips is additive).
const CITIES = ['Rome', 'Florence', 'Bologna', 'Tuscany', 'Lake Como', 'Venice'];

const CITY_EMOJI = {
  'Rome': '🏛️',
  'Florence': '🌻',
  'Bologna': '🟥',
  'Tuscany': '🍷',
  'Lake Como': '⛰️',
  'Venice': '🚣'
};

// Map center + zoom per city
const CITY_VIEWS = {
  'Rome':      { center: [41.8975, 12.4800], zoom: 13 },
  'Florence':  { center: [43.7710, 11.2540], zoom: 14 },
  'Bologna':   { center: [44.4949, 11.3426], zoom: 14 },
  'Tuscany':   { center: [43.5100, 11.1500], zoom: 10 },
  'Lake Como': { center: [45.8700, 9.1500], zoom: 11 },
  'Venice':    { center: [45.4400, 12.3350], zoom: 14 },
  'all':       { center: [43.5, 12.5], zoom: 6 },
};

// Category colors & icons
const CAT_COLORS = {
  dining: '#CE2B37', landmark: '#008C45', hotel: '#E8B931',
  activity: '#F97316', viewpoint: '#8B5CF6', transit: '#3B82F6',
  pharmacy: '#EC4899', restroom: '#6B7280'
};

// Per-city tint colors (Today screen Hairline Editorial pass).
// Keys match phase.city / CITIES exactly. Italian display names live in `label`
// and are used only as the Hero kicker eyebrow ("TODAY · ROMA"), never as data keys.
// Each entry pairs an oklch() value with a hex fallback for iOS Safari 15.3 and older.
const CITY_COLORS = {
  'Rome':      { oklch: 'oklch(0.62 0.11 65)',  hex: '#B89358', label: 'Roma' },
  'Florence':  { oklch: 'oklch(0.55 0.14 35)',  hex: '#A45B3D', label: 'Firenze' },
  'Venice':    { oklch: 'oklch(0.55 0.07 215)', hex: '#5A7B92', label: 'Venezia' },
  'Lake Como': { oklch: 'oklch(0.60 0.08 235)', hex: '#6585AB', label: 'Como' },
  'Bologna':   { oklch: 'oklch(0.48 0.12 25)',  hex: '#92492A', label: 'Bologna' }
};

// Typical-June climatology per city — an OFFLINE STUB for the Status strip
// weather tile, NOT a live forecast (a real forecast needs an API, which breaks
// the offline-first promise). Labeled "TYPICAL JUNE" in the UI so it never reads
// as a real-time reading. Keys match phase.city / day-trip labels exactly.
// Temps are °C seasonal averages.
const WEATHER_TYPICAL = {
  'Rome':      { hi: 28, lo: 17, icon: '☀️' },
  'Florence':  { hi: 29, lo: 16, icon: '☀️' },
  'Bologna':   { hi: 28, lo: 17, icon: '⛅' },
  'Tuscany':   { hi: 28, lo: 15, icon: '☀️' },
  'Lake Como': { hi: 26, lo: 15, icon: '⛅' },
  'Venice':    { hi: 26, lo: 18, icon: '⛅' }
};

// Real Talk · Today — per-city evergreen essay.
// Final fallback in getRealTalk()'s 3-step chain:
//   1) TODAY_PLAN[date].headline.realTalk  (per-day override)
//   2) headline place's honest_summary first sentence
//   3) CITY_REAL_TALK[city]                  (this map)
// Headline is rendered Playfair Display roman in the Real Talk tile;
// body is DM Sans 15px below.
const CITY_REAL_TALK = {
  'Rome': {
    headline: 'On not seeing everything.',
    body: 'You will not see all of Rome. You will not see most of it. The city has 2,800 years of layers and you have five days, two of them already half-eaten by jet lag and gelato. The trick is to pick one thing each morning and walk slowly. Then sit in a piazza. Let the afternoon get long.'
  },
  'Florence': {
    headline: 'On art fatigue.',
    body: 'The Uffizi has 1,500 works and a half-mile of corridor. The Accademia has the David. The Duomo has 463 steps. You cannot do all three back to back without your eyes glazing over and your honeymoon turning into a punch list. Pick the one that matters and give it real attention. Then go drink wine.'
  },
  'Venice': {
    headline: 'On getting lost on purpose.',
    body: 'Venice has 400 bridges and no logic. Your phone map will lie to you — alleys end at canals, signs point in three directions, the same square shows up twice. That\'s the point. Put the phone away after sundown. The tourists thin out around 9 PM and the city you came for shows up.'
  },
  'Lake Como': {
    headline: 'On the ferry, not the car.',
    body: 'You are not here to drive. Como has one road around the lake and it is slow, narrow, and lined with cars. The ferries are the actual transit — Bellagio, Varenna, Menaggio, Tremezzo, all linked by boat. Buy the day pass, get the upper deck, drink an Aperol. The view does the work for you.'
  },
  'Bologna': {
    headline: 'On the day-trip you weren\'t planning.',
    body: 'Bologna is half a day on the train from Florence and worth every minute of it. The food is what people show up for — tortellini, mortadella, tagliatelle the way it\'s supposed to taste. The Resistance Wall in Piazza del Nettuno is what makes you stay. Quadrilatero for lunch, Sorbetteria Castiglione before the train home.'
  }
};

const CAT_ICONS = {
  dining: '🍝', landmark: '🏛️', hotel: '🏨',
  activity: '🎯', viewpoint: '👁️', transit: '🚂',
  pharmacy: '💊', restroom: '🚻'
};

// Mood definitions
const MOODS = {
  historic:    { icon: '🏛️', color: '#CE2B37' },
  foodie:      { icon: '🍝', color: '#E8B931' },
  romantic:    { icon: '💑', color: '#EC4899' },
  budget:      { icon: '💰', color: '#008C45' },
  outdoor:     { icon: '☀️', color: '#3B82F6' },
  evening:     { icon: '🌙', color: '#8B5CF6' },
  'quick-bite':{ icon: '⚡', color: '#F97316' }
};

// Verdict definitions
const VERDICTS = {
  'essential':  { label: 'Essential',       icon: '🟢', color: '#008C45', desc: "Don't miss this" },
  'worth-it':   { label: 'Worth It',        icon: '🔵', color: '#3B82F6', desc: 'Go if you have time' },
  'nice':       { label: 'Nice If Nearby',  icon: '🟡', color: '#E8B931', desc: 'Good but not a must' },
  'overrated':  { label: 'Overhyped',       icon: '🔴', color: '#CE2B37', desc: 'Manage expectations' },
  'hidden-gem': { label: 'Hidden Gem',      icon: '💎', color: '#8B5CF6', desc: 'Locals know, tourists miss' },
};

// Gifted experiences from wedding registry.
// Unified with venue BOOKINGS via source='registry-gift' discriminator —
// see getAllEntries() in bookings.js. State persists to italy-bookings-v1
// (mixed shape: booleans for venues, { status } objects for gifts).
const GIFTED_EXPERIENCES = [
  {
    id: 'gift-1',
    source: 'registry-gift',
    title: 'Colosseum, Roman Forum & Palatine Hill Tour',
    giver: '',
    city: 'Rome',
    icon: '🎁',
    description: 'A guided tour through ancient Rome — the Colosseum, Roman Forum, and Palatine Hill. A wedding gift!',
    linkedPlaces: ['l1', 'l6'],
    date: '2026-06-14',
    time: '10:45',
    duration: '3 hours',
    bookingStatus: 'scheduled',
    confirmationUrl: '',
    notes: 'Check voucher for date/time. Arrive 15 min early.'
  },
  {
    id: 'gift-2',
    source: 'registry-gift',
    title: 'Gondola Serenade for Two',
    giver: '',
    city: 'Venice',
    icon: '🎁',
    description: 'Private gondola ride with a musician serenading you through the canals. Pure honeymoon magic.',
    linkedPlaces: [],
    date: '2026-06-25',
    time: '17:50',
    duration: '30 minutes',
    bookingStatus: 'scheduled',
    confirmationUrl: '',
    notes: 'Book specific date/time. Evening is most romantic.'
  },
  {
    id: 'gift-3',
    source: 'registry-gift',
    title: 'Pasta-Making Class for Two',
    giver: '',
    city: 'Rome',
    icon: '🎁',
    description: 'Hands-on class learning to make fresh Roman pasta — likely cacio e pepe and carbonara. A wedding gift!',
    linkedPlaces: [],
    date: '2026-06-15',
    time: '16:15',
    duration: '3 hours',
    bookingStatus: 'scheduled',
    confirmationUrl: '',
    notes: 'Book specific date/time with provider. Likely includes dinner.'
  }
];

// ═══════════════════════════════════════
// TRIP DATE HELPERS
// ═══════════════════════════════════════

function getTripPhase() {
  // Localhost ?date= override (see _readMockParams in helpers.js) lets QA jump to
  // any trip day; null/off-localhost falls back to the real clock.
  const mock = (typeof _readMockParams === 'function') ? _readMockParams() : null;
  const now = (mock && mock.date) ? new Date(mock.date + 'T00:00:00') : new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(TRIP.startDate);
  const end = new Date(TRIP.endDate);

  let result;
  if (now < start) {
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    result = { phase: 'before', daysUntil: diff };
  } else if (now <= end) {
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const today = TRIP.schedule[diff] || TRIP.schedule[TRIP.schedule.length - 1];
    const dayTrip = TRIP.dayTrips[today.date] || null;
    result = { phase: 'during', day: today.day, city: today.city, date: today.date, dayTrip: dayTrip };
  } else {
    const diff = Math.ceil((now - end) / (1000 * 60 * 60 * 24));
    result = { phase: 'after', daysSince: diff };
  }

  // Localhost ?phase=during override — force a DURING object even when the date
  // lands outside the trip window, for forward-mocking before the trip starts.
  if (mock && mock.forcePhase === 'during' && result.phase !== 'during') {
    const iso = mock.date || TRIP.schedule[0].date;
    const entry = TRIP.schedule.find(s => s.date === iso) || TRIP.schedule[0];
    result = { phase: 'during', day: entry.day, city: entry.city, date: entry.date,
               dayTrip: TRIP.dayTrips[entry.date] || null };
  }
  return result;
}

function getTodayCity() {
  const phase = getTripPhase();
  if (phase.phase === 'during') return phase.city;
  if (phase.phase === 'before') return 'Rome'; // default to first city
  return 'Venice'; // default to last city
}
