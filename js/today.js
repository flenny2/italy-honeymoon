// ═══════════════════════════════════════
// TODAY VIEW — The home screen
// Split into section renderers for clarity
// ═══════════════════════════════════════

function renderToday() {
  var content = document.getElementById('today-content');
  if (!content) return;

  var phase = getTripPhase();
  var city = getTodayCity();

  content.innerHTML = (phase.phase === 'during')
    ? renderTodayDuring(phase, city)
    : renderTodayBeforeAfter(phase, city);
}

// ── DURING (Hairline Editorial tile grid — v11 Hero only; v12–v14 fill the rest) ──
function renderTodayDuring(phase, city) {
  return '<div class="today-grid">' +
           renderTodayHeroDuring(phase, city) +
           // Status strip, Today's Plan, Real Talk, Home Base, Phrasebook,
           // Saved Places footer all land in subsequent commits.
         '</div>';
}

// ── BEFORE / AFTER (legacy section list — unchanged) ──
function renderTodayBeforeAfter(phase, city) {
  var sections = [
    renderTodayHero(phase, city),
    renderTodayLetter(),
    renderTodayCapsuleNudge(),
    renderTodayBooking(phase),
    renderTodayGiftCallout(phase),  // self-guards: '' if not DURING
    renderTodayCounters(phase),     // self-guards: '' if not DURING
    renderTodayPhrase(),
    renderTodayGifts(city),
    renderTodayHotel(city, phase),
    renderTodaySuggestion(city),
    renderTodayPicks(city)
  ];

  return '<div class="stagger">' +
    sections.map(function(html) {
      return html ? '<div class="today-section">' + html + '</div>' : '';
    }).join('') + '</div>';
}

// Hero composite — typography-led for BEFORE/AFTER (names + flag stripe +
// countdown + optional wedding pill). DURING is now handled by
// renderTodayHeroDuring (Hairline Editorial tile, v11+).
// No couple photo — "more pictures = locations, not us."
function renderTodayHero(phase, city) {
  var s = Storage.getSettings();
  var name1 = s.userName || '';
  var name2 = s.partnerName || '';
  var namesHTML = '';
  if (name1 && name2) {
    namesHTML = '<div class="hero-names">' + name1 +
      '<span class="hero-names-amp">&amp;</span>' + name2 + '</div>';
  } else if (name1 || name2) {
    namesHTML = '<div class="hero-names">' + (name1 || name2) + '</div>';
  }

  var flagHTML = '<div class="hero-flag-bar">' +
    '<span class="hero-flag-bar-r"></span>' +
    '<span class="hero-flag-bar-w"></span>' +
    '<span class="hero-flag-bar-g"></span>' +
    '</div>';

  // BEFORE / AFTER — typography-led
  var phaseClass = phase.phase === 'after' ? 'hero-type after' : 'hero-type';
  var bigNum, label;
  var weddingPill = '';

  if (phase.phase === 'before') {
    bigNum = phase.daysUntil;
    label = 'days until Italy 🇮🇹';
    if (s.weddingDate) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var wedding = new Date(s.weddingDate);
      wedding.setHours(0, 0, 0, 0);
      var daysToWedding = Math.ceil((wedding - today) / (1000 * 60 * 60 * 24));
      if (daysToWedding > 0) {
        weddingPill = '<div class="hero-wedding-pill">💍 ' + daysToWedding +
          ' days until the wedding</div>';
      } else if (daysToWedding === 0) {
        weddingPill = '<div class="hero-wedding-pill">🎉 WEDDING DAY!</div>';
      }
    }
  } else {
    bigNum = phase.daysSince;
    label = 'days since Italy 💕';
  }

  return '<div class="' + phaseClass + ' anim-bounce-in">' +
    namesHTML +
    flagHTML +
    '<div class="hero-since-row">' +
    '<div class="hero-big-num">' + bigNum + '</div>' +
    '<div class="hero-label">' + label + '</div>' +
    '</div>' +
    weddingPill +
    '</div>';
}

function renderTodayLetter() {
  if (typeof Storage.getLetters !== 'function') return '';
  var letters = Storage.getLetters();
  if (!letters || letters.length === 0) return '';

  var todayISO = new Date().toISOString().split('T')[0];
  var ready = letters.filter(function(l) {
    if (l.isRead) return false;
    if (!l.unlockDate) return false;
    return l.unlockDate <= todayISO;
  });
  if (ready.length === 0) return '';

  ready.sort(function(a, b) { return (b.unlockDate || '').localeCompare(a.unlockDate || ''); });
  var l = ready[0];
  var fromLabel = l.from ? 'from ' + l.from : 'for you';
  var suffix = ready.length > 1 ? ' (+' + (ready.length - 1) + ' more)' : '';

  return '<div class="today-letter-alert" onclick="openLetter(\'' + l.id + '\')">' +
    '<div class="today-letter-icon">💌</div>' +
    '<div class="today-letter-text">' +
    '<strong>A new letter is ready</strong>' +
    fromLabel + suffix + ' — tap to open' +
    '</div>' +
    '<div class="today-letter-arrow">→</div>' +
    '</div>';
}

function renderTodayCounters(phase) {
  if (!phase || phase.phase !== 'during') return '';
  if (typeof renderCounterChips !== 'function') return '';
  return renderCounterChips();
}

// ── Capsule nudge on the last night + departure day, only if unsealed ──
function renderTodayCapsuleNudge() {
  if (typeof Storage.getCapsule !== 'function') return '';
  var capsule = Storage.getCapsule();
  if (capsule.locked) return '';

  var todayISO = new Date().toISOString().split('T')[0];
  // Last night in Venice (Jun 26) + departure day (Jun 27)
  var isLastNight = (todayISO === '2026-06-26');
  var isDepartureDay = (todayISO === '2026-06-27');
  if (!isLastNight && !isDepartureDay) return '';

  var headline, subtext;
  if (isLastNight) {
    headline = 'Tonight\'s the night';
    subtext = 'Your last night in Italy — seal the time capsule together 💕';
  } else {
    headline = 'Last chance before you leave';
    subtext = 'Seal the capsule before you board — opens June 27, 2027';
  }

  return '<div class="today-capsule-nudge" onclick="Router.navigate(\'#capsule\')">' +
    '<div class="today-capsule-icon">🔮</div>' +
    '<div class="today-capsule-text">' +
    '<strong>' + headline + '</strong>' +
    subtext +
    '</div>' +
    '<div class="today-capsule-arrow">→</div>' +
    '</div>';
}

// ── Section renderers ──

// Hotel — one-line strip during BEFORE; full card during DURING (Item 10
// will give DURING a richer "Tonight" treatment in a later commit).
function renderTodayHotel(city, phase) {
  var hotel = HOTELS[city];
  if (!hotel) return '';

  if (phase && phase.phase === 'before') {
    return '<div class="hotel-strip">' +
      '<span class="hotel-strip-icon">' + (hotel.emoji || '🏨') + '</span>' +
      '<span class="hotel-strip-name">' + hotel.name + '</span>' +
      '<span class="hotel-strip-dot">·</span>' +
      '<span>' + city + '</span>' +
      '<span class="hotel-strip-dot">·</span>' +
      '<span>' + hotel.dates + '</span>' +
      '</div>';
  }

  return '<div class="hotel-card">' +
    '<div class="hotel-emoji">' + (hotel.emoji || '🏨') + '</div>' +
    '<div class="hotel-info">' +
    '<div class="hotel-name">' + hotel.name + '</div>' +
    '<div class="hotel-dates">' + hotel.dates + ' (' + hotel.nights + ' nights)</div>' +
    '<div class="hotel-address">📍 ' + hotel.address + '</div>' +
    '</div></div>';
}

function renderTodayBooking(phase) {
  if (phase.phase !== 'before') return '';
  var bStats = getBookingStats();
  if (bStats.remaining <= 0) return '';
  return '<div class="card" style="border-left:4px solid var(--rosso);cursor:pointer;" onclick="Router.navigate(\'#bookings\')">' +
    '<div class="today-booking-nag">' +
    '<span class="today-booking-nag-icon">📋</span>' +
    '<div style="flex:1;">' +
    '<div class="today-booking-nag-title">Booking Checklist</div>' +
    '<div class="today-booking-nag-count">' + bStats.remaining + ' of ' + bStats.total + ' still need booking</div>' +
    '</div><span class="today-booking-nag-arrow">→</span></div></div>';
}

// Day-of (and softer day-before) gift callout — fires only during the trip,
// matched against gift.date. Shares the "action card" slot with the booking
// nag (which only fires BEFORE the trip), so they never compete visually.
function renderTodayGiftCallout(phase) {
  if (phase.phase !== 'during' || typeof GIFTED_EXPERIENCES === 'undefined') return '';
  var todayISO = phase.date;
  var tomorrowISO = (typeof addDaysISO === 'function') ? addDaysISO(todayISO, 1) : '';

  var todayGift = null, tomorrowGift = null;
  for (var i = 0; i < GIFTED_EXPERIENCES.length; i++) {
    var g = GIFTED_EXPERIENCES[i];
    if (!g.date) continue;
    if (g.date === todayISO) { todayGift = g; break; }
    if (g.date === tomorrowISO) tomorrowGift = g;
  }

  if (todayGift) {
    var timeLine = todayGift.time ? '<div class="today-gift-callout-time">' + todayGift.time + '</div>' : '';
    var giverLine = todayGift.giver
      ? '<div class="today-gift-callout-giver">A gift from ' + todayGift.giver + '</div>' : '';
    return '<div class="today-gift-callout today-gift-callout-today">' +
      '<div class="today-gift-callout-icon">' + (todayGift.icon || '🎁') + '</div>' +
      '<div class="today-gift-callout-body">' +
      '<div class="today-gift-callout-eyebrow">Today</div>' +
      '<div class="today-gift-callout-title">' + todayGift.title + '</div>' +
      timeLine + giverLine +
      '</div></div>';
  }

  if (tomorrowGift) {
    var t2 = tomorrowGift.time ? ' at ' + tomorrowGift.time : '';
    return '<div class="today-gift-callout today-gift-callout-tomorrow">' +
      '<div class="today-gift-callout-icon">' + (tomorrowGift.icon || '🎁') + '</div>' +
      '<div class="today-gift-callout-body">' +
      '<div class="today-gift-callout-eyebrow">Tomorrow' + t2 + '</div>' +
      '<div class="today-gift-callout-title">' + tomorrowGift.title + '</div>' +
      '</div></div>';
  }

  return '';
}

function renderTodayPhrase() {
  var allPhrases = [];
  PHRASES.forEach(function(cat) { cat.phrases.forEach(function(p) { allPhrases.push(p); }); });
  var phrase = allPhrases[getDayOfYear() % allPhrases.length];
  return '<div class="phrase-of-day">' +
    '<div class="phrase-of-day-bg"></div>' +
    '<div class="phrase-of-day-italian">' + phrase.it + '</div>' +
    '<div class="phrase-of-day-pronounce">/' + phrase.pr + '/</div>' +
    '<div class="phrase-of-day-english">' + phrase.en + '</div></div>';
}

function renderTodayGifts(city) {
  var cityGifts = GIFTED_EXPERIENCES.filter(function(g) { return g.city === city; });
  if (cityGifts.length === 0) return '';
  var html = '<div class="section-header">🎁 Wedding Gifts</div>';
  cityGifts.forEach(function(gift) {
    var status = (typeof getEntryStatus === 'function') ? getEntryStatus(gift) : (gift.bookingStatus || 'voucher-only');
    var statusLine = (typeof formatGiftStatus === 'function') ? formatGiftStatus(gift) : '';
    var giverLine = gift.giver ? '<div class="gift-card-giver">A gift from ' + gift.giver + '</div>' : '';
    html += '<div class="card card-gift gift-status-' + status + '">' +
      '<div class="gift-card-icon">' + gift.icon + '</div>' +
      '<div class="gift-card-title">' + gift.title + '</div>' +
      giverLine +
      '<div class="gift-card-status">' + statusLine + '</div>' +
      '<div class="gift-card-desc">' + gift.description + '</div>' +
      '<div class="gift-card-tip">' + gift.notes + '</div></div>';
  });
  return html;
}

function renderTodaySuggestion(city) {
  var tips = getSmartSuggestions(city);
  if (tips.length === 0) return '';
  var html = '';
  tips.forEach(function(tip) {
    html += '<div class="card' + (tip.placeId ? ' card-interactive" onclick="Router.navigate(\'#place/' + tip.placeId + '\')"' : '"') +
      ' style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">' +
      '<span class="tip-icon-box" style="background:' + tip.color + '15;">' + tip.icon + '</span>' +
      '<span class="tip-text">' + tip.text + '</span>' +
      (tip.placeId ? '<span style="color:var(--light-gray);">→</span>' : '') + '</div>';
  });
  return html;
}

function renderTodayPicks(city) {
  var places = Storage.getPlaces();
  var essentials = places.filter(function(p) {
    return p.city === city && p.verdict === 'essential';
  }).slice(0, 4);
  if (essentials.length === 0) return '';
  var html = '<div class="section-header">⭐ Don\'t Miss in ' + city + '</div>';
  essentials.forEach(function(p) { html += buildPlaceCard(p); });
  return html;
}

// ── Shared place card builder ──
function buildPlaceCard(p) {
  var v = p.verdict && VERDICTS[p.verdict] ? VERDICTS[p.verdict] : null;
  var booked = isPlaceBooked(p.id);
  var verdictClass = p.verdict ? ' place-card-' + p.verdict : '';
  return '<div class="place-card' + verdictClass + '" onclick="Router.navigate(\'#place/' + p.id + '\')">' +
    '<div class="place-card-dot" style="background:' + (CAT_COLORS[p.category] || '#999') + '"></div>' +
    '<div class="place-card-info">' +
    '<div class="place-card-name">' + (CAT_ICONS[p.category] || '') + ' ' + p.name + '</div>' +
    '<div class="place-card-meta">' +
    '<span>' + p.category + '</span>' +
    (p.source ? '<span>· ' + p.source + '</span>' : '') +
    (booked ? '<span class="place-booked-badge">✓ Booked</span>' : '') +
    (v ? '<span class="verdict-badge verdict-badge-sm verdict-' + p.verdict + '">' + v.icon + ' ' + v.label + '</span>' : '') +
    '</div></div>' +
    '<span class="place-card-star ' + (p.saved ? 'saved' : '') + '" onclick="toggleSave(\'' + p.id + '\', event)">' + (p.saved ? '⭐' : '☆') + '</span></div>';
}

// Check if a place has been booked — checks both venue BOOKINGS state
// AND gift bookingStatus (scheduled/completed counts as booked for the
// "✓ Booked" badge, since the user has a ticket via the gift).
function isPlaceBooked(placeId) {
  var state = getBookingState();
  for (var i = 0; i < BOOKINGS.length; i++) {
    if (BOOKINGS[i].placeId === placeId && state[BOOKINGS[i].id]) return true;
  }
  if (typeof GIFTED_EXPERIENCES !== 'undefined' && typeof getEntryStatus === 'function') {
    for (var j = 0; j < GIFTED_EXPERIENCES.length; j++) {
      var g = GIFTED_EXPERIENCES[j];
      if (!g.linkedPlaces || g.linkedPlaces.indexOf(placeId) === -1) continue;
      var st = getEntryStatus(g);
      if (st === 'scheduled' || st === 'completed') return true;
    }
  }
  return false;
}

function toggleSave(id, evt) {
  if (evt) { evt.stopPropagation(); evt.preventDefault(); }
  var places = Storage.getPlaces();
  var p = places.find(function(x) { return x.id === id; });
  if (!p) return;
  p.saved = !p.saved;
  Storage.savePlaces(places);

  // Update the element that fired the event in place — no full re-render,
  // so scroll position is preserved. Two element shapes:
  //   - .place-card-star span (Today picks, City list)
  //   - .btn save button (Place detail page)
  var el = evt && evt.currentTarget;
  if (el && el.classList) {
    if (el.classList.contains('place-card-star')) {
      el.classList.toggle('saved', p.saved);
      el.textContent = p.saved ? '⭐' : '☆';
    } else if (el.classList.contains('btn')) {
      el.classList.toggle('btn-verde', p.saved);
      el.classList.toggle('btn-outline', !p.saved);
      el.textContent = p.saved ? '⭐ Saved' : '☆ Save';
    }
  }

  showToast(p.saved ? '⭐ Saved!' : 'Unsaved');
}

// ═══════════════════════════════════════
// DURING HERO — Hairline Editorial tile (v11)
// Priority resolver: gift today > gift tomorrow > move day > normal headline.
// Tonight-mode rerouting lands v14.
// ═══════════════════════════════════════

function renderTodayHeroDuring(phase, city) {
  var state = _pickHeroState(phase);
  switch (state.kind) {
    case 'gift-today':    return _heroGiftToday(state.gift, city);
    case 'gift-tomorrow': return _heroGiftTomorrow(state.gift, city);
    case 'move-am':       return _heroMoveAM(state.from, state.to, state.transit);
    case 'move-pm':       return _heroMovePM(state.from, state.to, state.transit);
    default:              return _heroNormal(state.headline, city);
  }
}

function _pickHeroState(phase) {
  var today = phase.date;
  var tomorrow = (typeof addDaysISO === 'function') ? addDaysISO(today, 1) : '';
  var gifts = (typeof GIFTED_EXPERIENCES !== 'undefined') ? GIFTED_EXPERIENCES : [];

  // 1. Gift today
  for (var i = 0; i < gifts.length; i++) {
    if (gifts[i].date === today && gifts[i].bookingStatus === 'scheduled') {
      return { kind: 'gift-today', gift: gifts[i] };
    }
  }
  // 2. Gift tomorrow
  for (var j = 0; j < gifts.length; j++) {
    if (gifts[j].date === tomorrow && gifts[j].bookingStatus === 'scheduled') {
      return { kind: 'gift-tomorrow', gift: gifts[j] };
    }
  }

  // 3. Move day — today equals a hotel's checkOut AND another hotel's checkIn.
  // Cutoff between AM (last morning in departure) and PM (welcome to arrival)
  // is 12:00 Europe/Rome. Hotels with adjacent stays both fire on this date.
  var depart = null, arrive = null;
  if (typeof HOTELS !== 'undefined') {
    for (var cityName in HOTELS) {
      var h = HOTELS[cityName];
      if (h.checkOut === today) depart = cityName;
      if (h.checkIn === today) arrive = cityName;
    }
  }
  if (depart && arrive && depart !== arrive) {
    var rome = (typeof getRomeNow === 'function') ? getRomeNow() : { hour: 12 };
    var transit = (typeof TRANSITS !== 'undefined') ? TRANSITS[today] : null;
    return rome.hour < 12
      ? { kind: 'move-am', from: depart, to: arrive, transit: transit }
      : { kind: 'move-pm', from: depart, to: arrive, transit: transit };
  }

  // 4. Normal — headline place via TODAY_PLAN > derived fallback chain.
  var headline = (typeof getTodayHeadlinePlace === 'function') ? getTodayHeadlinePlace(today) : null;
  return { kind: 'normal', headline: headline };
}

// ── Hero builders ──

function _heroBgStyle(bgState) {
  var bg = (typeof getHeroBackground === 'function') ? getHeroBackground(bgState) : null;
  if (bg && bg.url) return 'background-image: url(\'' + bg.url + '\')';
  if (bg && bg.gradient) return 'background-color: ' + bg.gradient;
  return 'background-color: #7D7882';
}

function _heroPlaceholderIcon(bgState) {
  var bg = (typeof getHeroBackground === 'function') ? getHeroBackground(bgState) : null;
  if (!bg || bg.url) return '';
  return '<svg class="hero-placeholder-icon" aria-hidden="true"><use href="#' + bg.icon + '"/></svg>';
}

function _cityLabel(city) {
  return _cityLabelMixed(city).toUpperCase();
}

// Italian display name in title case ('Firenze' not 'Florence'). Used for
// move-day PM "Benvenuti a Firenze" title where the kicker is uppercased
// but the title needs proper-case Italian.
function _cityLabelMixed(city) {
  return (typeof CITY_COLORS !== 'undefined' && CITY_COLORS[city] && CITY_COLORS[city].label)
    ? CITY_COLORS[city].label
    : (city || '');
}

function _heroNormal(headline, city) {
  var bgState = headline && headline.place
    ? { kind: 'place', id: headline.id, city: city, category: headline.place.category }
    : { kind: 'place', id: '', city: city, category: 'landmark' };
  var title = (headline && headline.place) ? headline.place.name : 'Today in ' + city;
  return '<div class="tile tile--image tile--hero" style="' + _heroBgStyle(bgState) + '">' +
           _heroPlaceholderIcon(bgState) +
           '<div class="hero-kicker">TODAY · ' + _cityLabel(city) + '</div>' +
           '<h1 class="hero-title">' + title + '</h1>' +
         '</div>';
}

function _heroGiftToday(gift, city) {
  // gift.id is already namespaced ('gift-1'). Strip the 'gift-' prefix before
  // passing so getHeroBackground composes 'gift-1' (matches HERO_IMAGES key),
  // not 'gift-gift-1' (double-prefix miss → falls through to city-default).
  var bareId = (gift.id || '').replace(/^gift-/, '');
  var bgState = { kind: 'gift', id: bareId, city: city };
  var title = gift.heroTitle || gift.title;
  var subtitle = gift.heroSubtitle || '';
  var kicker = 'A GIFT' + (gift.time ? ' · OPENS ' + gift.time : ' · TODAY');
  return '<div class="tile tile--image tile--hero tile--hero-tall" style="' + _heroBgStyle(bgState) + '">' +
           _heroPlaceholderIcon(bgState) +
           '<div class="hero-kicker">' + kicker + '</div>' +
           '<h1 class="hero-title">' + title + '</h1>' +
           (subtitle ? '<div class="hero-body">' + subtitle + '</div>' : '') +
         '</div>';
}

function _heroGiftTomorrow(gift, city) {
  // See _heroGiftToday — same prefix-strip rationale.
  var bareId = (gift.id || '').replace(/^gift-/, '');
  var bgState = { kind: 'gift', id: bareId, city: city };
  var title = 'Tomorrow: ' + (gift.heroTitle || gift.title);
  var kicker = 'A GIFT' + (gift.time ? ' · TOMORROW ' + gift.time : ' · TOMORROW');
  return '<div class="tile tile--image tile--hero" style="' + _heroBgStyle(bgState) + '">' +
           _heroPlaceholderIcon(bgState) +
           '<div class="hero-kicker">' + kicker + '</div>' +
           '<h1 class="hero-title">' + title + '</h1>' +
         '</div>';
}

// Slug for HERO_IMAGES move-day keys: Italian lowercase city name.
// 'Rome' → 'roma', 'Florence' → 'firenze', 'Lake Como' → 'como', etc.
function _moveSlug(city) {
  return _cityLabelMixed(city).toLowerCase();
}

function _heroMoveAM(from, to, transit) {
  // move-{from-slug}-{to-slug}-am, e.g. 'move-roma-firenze-am'.
  // city = `from` so city-default fallback shows departure (we're leaving Rome).
  var bgState = {
    kind: 'move',
    id: _moveSlug(from) + '-' + _moveSlug(to) + '-am',
    city: from,
    category: 'landmark'
  };
  var kicker = 'MOVE DAY · ' + _cityLabel(from) + ' → ' + _cityLabel(to);
  var body = (transit && transit.train) ? transit.train : '';
  return '<div class="tile tile--image tile--hero tile--hero-tall" style="' + _heroBgStyle(bgState) + '">' +
           _heroPlaceholderIcon(bgState) +
           '<div class="hero-kicker">' + kicker + '</div>' +
           '<h1 class="hero-title">Last morning in ' + from + '</h1>' +
           (body ? '<div class="hero-body">' + body + '</div>' : '') +
         '</div>';
}

function _heroMovePM(from, to, transit) {
  // move-{from-slug}-{to-slug}-pm. city = `to` so city-default fallback
  // shows arrival (we're now in Florence).
  var bgState = {
    kind: 'move',
    id: _moveSlug(from) + '-' + _moveSlug(to) + '-pm',
    city: to,
    category: 'landmark'
  };
  var kicker = 'WELCOME · ' + _cityLabel(to);
  var body = (transit && transit.arrivalNote) ? transit.arrivalNote : '';
  return '<div class="tile tile--image tile--hero tile--hero-tall" style="' + _heroBgStyle(bgState) + '">' +
           _heroPlaceholderIcon(bgState) +
           '<div class="hero-kicker">' + kicker + '</div>' +
           '<h1 class="hero-title">Benvenuti a ' + _cityLabelMixed(to) + '</h1>' +
           (body ? '<div class="hero-body">' + body + '</div>' : '') +
         '</div>';
}
