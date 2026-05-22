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
    '2026-06-19': { label: 'Bologna half-day', from: 'Florence', emoji: '🟥' },
    '2026-06-21': { label: 'Tuscany / Chianti day trip', from: 'Florence', emoji: '🍷' },
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
    date: '',
    time: '',
    duration: '3 hours',
    bookingStatus: 'voucher-only',
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
    date: '',
    time: '',
    duration: '30 minutes',
    bookingStatus: 'voucher-only',
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
    date: '',
    time: '',
    duration: '3 hours',
    bookingStatus: 'voucher-only',
    confirmationUrl: '',
    notes: 'Book specific date/time with provider. Likely includes dinner.'
  }
];

// ═══════════════════════════════════════
// TRIP DATE HELPERS
// ═══════════════════════════════════════

function getTripPhase() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(TRIP.startDate);
  const end = new Date(TRIP.endDate);

  if (now < start) {
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return { phase: 'before', daysUntil: diff };
  } else if (now <= end) {
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const today = TRIP.schedule[diff] || TRIP.schedule[TRIP.schedule.length - 1];
    const dayTrip = TRIP.dayTrips[today.date] || null;
    return { phase: 'during', day: today.day, city: today.city, date: today.date, dayTrip: dayTrip };
  } else {
    const diff = Math.ceil((now - end) / (1000 * 60 * 60 * 24));
    return { phase: 'after', daysSince: diff };
  }
}

function getTodayCity() {
  const phase = getTripPhase();
  if (phase.phase === 'during') return phase.city;
  if (phase.phase === 'before') return 'Rome'; // default to first city
  return 'Venice'; // default to last city
}
