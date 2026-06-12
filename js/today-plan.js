// ═══════════════════════════════════════
// TODAY-PLAN consumers
// Pure read functions. No DOM, no Storage writes.
// Driven by TODAY_PLAN (data-today-plan.js) + TRIP +
// GIFTED_EXPERIENCES + BOOKINGS + DEFAULT_PLACES.
// ═══════════════════════════════════════

// All time-anchored items for a date, soonest-first.
// Sources, deduped by kind:id —
//   (1) TODAY_PLAN[date] manual layer (headline + items, when timed)
//   (2) scheduled gifts whose date matches
//   (3) places date-anchored to this day (scheduled_date + scheduled_time)
// A place's time is only ever surfaced when its scheduled_date matches `date`.
function getTimedItemsForDate(date) {
  var items = [];
  var seen = {};
  function push(it) {
    var key = it.kind + ':' + it.id;
    if (seen[key] || !it.time) return;
    seen[key] = true;
    items.push(it);
  }

  var plan = (typeof TODAY_PLAN !== 'undefined') ? TODAY_PLAN[date] : null;
  if (plan && plan.headline && plan.headline.time) {
    push({ kind: plan.headline.kind, id: plan.headline.id, time: plan.headline.time,
           place: plan.headline.kind === 'place' ? _findPlace(plan.headline.id) : null });
  }
  if (plan && plan.items) {
    plan.items.forEach(function(it) {
      push({ kind: it.kind, id: it.id, time: it.time,
             place: it.kind === 'place' ? _findPlace(it.id) : null });
    });
  }

  var gifts = (typeof GIFTED_EXPERIENCES !== 'undefined') ? GIFTED_EXPERIENCES : [];
  gifts.forEach(function(g) {
    if (g.date === date && g.time && g.bookingStatus === 'scheduled') {
      var firstLinked = g.linkedPlaces && g.linkedPlaces[0];
      push({ kind: 'gift', id: g.id, time: g.time, gift: g,
             place: firstLinked ? _findPlace(firstLinked) : null });
    }
  });

  var places = (typeof DEFAULT_PLACES !== 'undefined') ? DEFAULT_PLACES : [];
  places.forEach(function(p) {
    if (p.scheduled_date === date && p.scheduled_time) {
      push({ kind: 'place', id: p.id, time: p.scheduled_time, place: p });
    }
  });

  // 'HH:MM' 24h strings sort correctly as plain strings.
  items.sort(function(a, b) { return a.time.localeCompare(b.time); });
  return items;
}

// Returns { kind, id, time, kicker, place } for the given date.
// Hybrid: manual TODAY_PLAN[date] wins, else derive.
// Returns null on a genuinely free day — no phantom plan is invented.
function getTodayHeadlinePlace(date) {
  // (1) manual override
  var manual = (typeof TODAY_PLAN !== 'undefined') && TODAY_PLAN[date] && TODAY_PLAN[date].headline;
  if (manual) {
    return Object.assign({}, manual, { place: _findPlace(manual.id) });
  }

  // (2) earliest time-anchored item of the day (gifts + anchored places)
  var timed = getTimedItemsForDate(date);
  if (timed.length) {
    var t = timed[0];
    if (t.kind === 'gift') {
      return {
        kind: 'gift', id: t.id, time: t.time,
        kicker: 'GIFT · ' + ((t.gift && t.gift.duration) || 'TODAY'),
        place: t.place, gift: t.gift
      };
    }
    return {
      kind: 'place', id: t.id, time: t.time,
      kicker: t.place ? _kickerFromCategory(t.place.category) : 'TODAY',
      place: t.place
    };
  }

  // (3) untimed day trip — anchor on the trip city's first essential place
  var dayTrip = (typeof TRIP !== 'undefined' && TRIP.dayTrips) ? TRIP.dayTrips[date] : null;
  if (dayTrip && dayTrip.city) {
    var anchor = pickCityAnchor(dayTrip.city, [], date);
    if (anchor) {
      return { kind: 'place', id: anchor.id, time: null, kicker: 'DAY TRIP', place: anchor };
    }
  }

  // (4) nothing anchored — free day. (The old "first essential landmark in
  // today's city" fallback is gone: it invented a plan, complete with a
  // dateless scheduled_time, on every unplanned day.)
  return null;
}

// Returns { kind, id, time, minutesUntil, place } for the next scheduled item
// after `now` on `date`. Soonest-first across the manual layer, gifts, and
// date-anchored places. Returns null if nothing's left for today.
function getUpNext(date, now) {
  now = now || new Date();
  var candidates = getTimedItemsForDate(date);
  if (!candidates.length) return null;

  // Filter to those still in the future (already sorted soonest-first)
  var future = candidates.filter(function(c) {
    var m = (typeof minutesUntil === 'function') ? minutesUntil(c.time, now) : null;
    return m !== null && m > 0;
  });
  if (!future.length) return null;

  var next = future[0];
  return {
    kind: next.kind, id: next.id, time: next.time,
    minutesUntil: minutesUntil(next.time, now),
    place: next.place || null
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

// Best fallback place in a city: essential landmark → any essential → anything.
// Never borrows a place date-anchored to a different day (the Jun-18 Vatican
// must not surface as a Jun-14 suggestion). Shared by the day-trip headline
// anchor above and the gift/move Plan-tile fallback in today.js.
function pickCityAnchor(city, excludeIds, date) {
  var places = (typeof DEFAULT_PLACES !== 'undefined') ? DEFAULT_PLACES : [];
  function ok(p) {
    return p.city === city && excludeIds.indexOf(p.id) === -1 &&
           (!p.scheduled_date || p.scheduled_date === date);
  }
  return places.find(function(p) { return ok(p) && p.verdict === 'essential' && p.category === 'landmark'; })
      || places.find(function(p) { return ok(p) && p.verdict === 'essential'; })
      || places.find(ok) || null;
}

// ── private ──
function _findPlace(id) {
  var places = (typeof DEFAULT_PLACES !== 'undefined') ? DEFAULT_PLACES : [];
  return places.find(function(p) { return p.id === id; }) || null;
}

function _kickerFromCategory(cat) {
  if (cat === 'landmark') return 'ENTRY';
  if (cat === 'dining') return 'MEAL';
  if (cat === 'activity') return 'EXPERIENCE';
  if (cat === 'viewpoint') return 'VIEWPOINT';
  return 'TODAY';
}
