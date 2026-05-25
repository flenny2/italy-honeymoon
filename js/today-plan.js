// ═══════════════════════════════════════
// TODAY-PLAN consumers
// Pure read functions. No DOM, no Storage writes.
// Driven by TODAY_PLAN (data-today-plan.js) + TRIP +
// GIFTED_EXPERIENCES + BOOKINGS + DEFAULT_PLACES.
// ═══════════════════════════════════════

// Returns { kind, id, time, kicker, place } for the given date.
// Hybrid: manual TODAY_PLAN[date] wins, else derive.
// Returns null only if no headline can be resolved (shouldn't happen during trip).
function getTodayHeadlinePlace(date) {
  // (1) manual override
  var manual = (typeof TODAY_PLAN !== 'undefined') && TODAY_PLAN[date] && TODAY_PLAN[date].headline;
  if (manual) {
    return Object.assign({}, manual, { place: _findPlace(manual.id) });
  }

  // (2) derive: scheduled gift on this date
  var gifts = (typeof GIFTED_EXPERIENCES !== 'undefined') ? GIFTED_EXPERIENCES : [];
  for (var i = 0; i < gifts.length; i++) {
    var g = gifts[i];
    if (g.date === date && g.time && g.bookingStatus === 'scheduled') {
      var firstLinked = g.linkedPlaces && g.linkedPlaces[0];
      return {
        kind: 'gift', id: g.id, time: g.time,
        kicker: 'GIFT · ' + (g.duration || 'TODAY'),
        place: firstLinked ? _findPlace(firstLinked) : null,
        gift: g
      };
    }
  }

  // (3) derive: pre-booked venue with a scheduled time (we don't track times on venues yet
  // beyond a 'when' string, so this branch effectively no-ops until BOOKINGS grows times).
  // Kept as an explicit comment so future-you knows the slot exists.

  // (4) fallback: first 'essential' place in today's city
  var city = _cityForDate(date);
  if (!city) return null;
  var places = (typeof DEFAULT_PLACES !== 'undefined') ? DEFAULT_PLACES : [];
  var essential = places.find(function(p) {
    return p.city === city && p.verdict === 'essential' && p.category === 'landmark';
  });
  if (!essential) {
    essential = places.find(function(p) { return p.city === city; });
  }
  if (!essential) return null;
  return {
    kind: 'place', id: essential.id,
    time: essential.scheduled_time || null,
    kicker: _kickerFromCategory(essential.category),
    place: essential
  };
}

// Returns { kind, id, time, minutesUntil, place } for the next scheduled item
// after `now` on `date`. Pulls from TODAY_PLAN[date].items + scheduled gifts.
// Returns null if nothing's left for today.
function getUpNext(date, now) {
  now = now || new Date();
  var candidates = [];

  var plan = (typeof TODAY_PLAN !== 'undefined') ? TODAY_PLAN[date] : null;
  if (plan && plan.headline && plan.headline.time) {
    candidates.push({ kind: plan.headline.kind, id: plan.headline.id, time: plan.headline.time });
  }
  if (plan && plan.items) {
    plan.items.forEach(function(it) { candidates.push(it); });
  }

  var gifts = (typeof GIFTED_EXPERIENCES !== 'undefined') ? GIFTED_EXPERIENCES : [];
  gifts.forEach(function(g) {
    if (g.date === date && g.time && g.bookingStatus === 'scheduled') {
      candidates.push({ kind: 'gift', id: g.id, time: g.time });
    }
  });

  if (!candidates.length) return null;

  // Filter to those still in the future
  var future = candidates.filter(function(c) {
    var m = (typeof minutesUntil === 'function') ? minutesUntil(c.time, now) : null;
    return m !== null && m > 0;
  });
  if (!future.length) return null;

  future.sort(function(a, b) {
    return minutesUntil(a.time, now) - minutesUntil(b.time, now);
  });
  var next = future[0];
  var place = (next.kind === 'place') ? _findPlace(next.id) : null;
  return {
    kind: next.kind, id: next.id, time: next.time,
    minutesUntil: minutesUntil(next.time, now),
    place: place
  };
}

function getTomorrowHeadlinePlace(date) {
  var tomorrow = (typeof addDaysISO === 'function') ? addDaysISO(date, 1) : null;
  if (!tomorrow) return null;
  return getTodayHeadlinePlace(tomorrow);
}

// Deterministic phrase-of-day pick. Hashes by trip day so the same day always
// shows the same phrase, but consecutive days differ.
function getPhraseOfDay(date) {
  if (typeof PHRASES === 'undefined' || !PHRASES.length) return null;
  // Flatten all phrases across categories
  var all = [];
  PHRASES.forEach(function(cat) {
    (cat.phrases || []).forEach(function(p) { all.push(p); });
  });
  if (!all.length) return null;
  var d = date ? new Date(date + 'T00:00:00') : new Date();
  var doy = (typeof getDayOfYear === 'function') ? getDayOfYear(d) : d.getDate();
  return all[doy % all.length];
}

// Tonight mode trigger — ≥19:00 Europe/Rome local. Never trusts the user's browser clock.
function getTonightMode(now) {
  if (typeof getRomeNow !== 'function') return false;
  var rome = getRomeNow(now);
  return rome.hour >= 19;
}

// Real Talk content resolver. Three-step fallback:
//   1) TODAY_PLAN[date].headline.realTalk (per-day override)
//   2) headline place's honest_summary first sentence
//   3) CITY_REAL_TALK[city] (per-city evergreen)
function getRealTalk(date, headline, city) {
  var plan = (typeof TODAY_PLAN !== 'undefined') ? TODAY_PLAN[date] : null;
  if (plan && plan.headline && plan.headline.realTalk) {
    return { source: 'day', text: plan.headline.realTalk, headline: null };
  }
  if (headline && headline.place && headline.place.honest_summary) {
    // Avoid lookbehind — older iOS Safari (≤16.3) chokes on it.
    var m = headline.place.honest_summary.match(/^[^.!?]*[.!?]/);
    var first = m ? m[0].trim() : headline.place.honest_summary;
    return { source: 'place', text: first, headline: headline.place.name };
  }
  if (city && typeof CITY_REAL_TALK !== 'undefined' && CITY_REAL_TALK[city]) {
    return { source: 'city', text: CITY_REAL_TALK[city].body, headline: CITY_REAL_TALK[city].headline };
  }
  return null;
}

// ── private ──
function _findPlace(id) {
  var places = (typeof DEFAULT_PLACES !== 'undefined') ? DEFAULT_PLACES : [];
  return places.find(function(p) { return p.id === id; }) || null;
}

function _cityForDate(date) {
  if (typeof TRIP === 'undefined') return null;
  var entry = TRIP.schedule.find(function(s) { return s.date === date; });
  return entry ? entry.city : null;
}

function _kickerFromCategory(cat) {
  if (cat === 'landmark') return 'ENTRY';
  if (cat === 'dining') return 'MEAL';
  if (cat === 'activity') return 'EXPERIENCE';
  if (cat === 'viewpoint') return 'VIEWPOINT';
  return 'TODAY';
}
