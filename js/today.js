// ═══════════════════════════════════════
// TODAY VIEW — The home screen
// Split into section renderers for clarity
// ═══════════════════════════════════════

function renderToday() {
  var content = document.getElementById('today-content');
  if (!content) return;

  var phase = getTripPhase();
  var city = getTodayCity();

  if (phase.phase === 'during') {
    content.innerHTML = renderTodayDuring(phase, city);
    _installTodayTick();              // live Up Next counter (during only)
  } else {
    content.innerHTML = renderTodayBeforeAfter(phase, city);
    _clearTodayTick();                // no tick on before/after
  }
}

// ── DURING (Hairline Editorial tile grid — full inventory as of v13) ──
function renderTodayDuring(phase, city) {
  // Resolve the Hero state ONCE so the Plan tile knows what the Hero already
  // shows (avoids stacking two identical photos on a normal day).
  var heroState = _pickHeroState(phase);
  return '<div class="today-grid">' +
           renderTodayHeroDuring(phase, city, heroState) +
           renderTodayStatusStrip(phase, city) +
           renderTodayPlanTile(phase, city, heroState) +
           renderTodayRealTalk(phase) +
           '<div class="today-row--split">' +
             renderTodayHomeBase(phase) +
             renderTodayPhrasebook(phase) +
           '</div>' +
           renderTodaySavedFooter() +
           (typeof renderCounterChips === 'function' ? renderCounterChips() : '') +
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

// (renderTodayCounters removed in v13 — counters now render as an editorial chip
// row inside the DURING grid via renderCounterChips(); see counters.js.)

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
      el.textContent = p.saved ? '⭐ Favorited' : '☆ Favorite';
    }
  }

  showToast(p.saved ? 'Added to favorites' : 'Removed from favorites');

  // If the Favorites page is currently open, re-render it so the list reflects
  // the change immediately (toggleSave is also reachable from there via detail).
  if (typeof Router !== 'undefined' && Router.getCurrentPage &&
      Router.getCurrentPage() === 'favorites' && typeof renderFavorites === 'function') {
    renderFavorites();
  }
}

// ═══════════════════════════════════════
// DURING HERO — Hairline Editorial tile (v11)
// Priority resolver: gift today > gift tomorrow > move day > normal headline.
// Tonight-mode rerouting lands v14.
// ═══════════════════════════════════════

function renderTodayHeroDuring(phase, city, state) {
  state = state || _pickHeroState(phase);
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

// ═══════════════════════════════════════
// STATUS STRIP (v12) — Day · Weather · Up Next, 3 equal flat tiles.
// ═══════════════════════════════════════

function renderTodayStatusStrip(phase, city) {
  return '<div class="today-row--triple">' +
           _statusDayTile(phase) +
           _statusWeatherTile(phase) +
           _statusUpNextTile(phase) +
         '</div>';
}

// Day X / N — Playfair italic numeral, city-tinted label, 3-line flag stripe.
function _statusDayTile(phase) {
  var tint = (typeof CITY_COLORS !== 'undefined' && CITY_COLORS[phase.city])
    ? CITY_COLORS[phase.city].hex : '#42404B';
  var total = (typeof TRIP !== 'undefined')
    ? (TRIP.totalDays || (TRIP.schedule ? TRIP.schedule.length : '')) : '';
  var cityLine = phase.dayTrip ? phase.dayTrip.label : phase.city;
  return '<div class="tile tile--flat day-numeral-tile">' +
           '<div class="day-numeral-label">DAY</div>' +
           '<div class="day-numeral-row">' +
             '<span class="day-numeral-big">' + phase.day + '</span>' +
             '<span class="day-numeral-of">/ ' + total + '</span>' +
           '</div>' +
           '<div class="day-numeral-city" style="color:' + tint + '">' + cityLine + '</div>' +
           '<div class="flag-stripe-3">' +
             '<span class="flag-stripe-3-g"></span>' +
             '<span class="flag-stripe-3-w"></span>' +
             '<span class="flag-stripe-3-r"></span>' +
           '</div>' +
         '</div>';
}

// Weather — OFFLINE STUB (typical June climatology, not a live forecast).
function _statusWeatherTile(phase) {
  var w = (typeof WEATHER_TYPICAL !== 'undefined') ? WEATHER_TYPICAL[phase.city] : null;
  // Day-trip days (Bologna/Tuscany) keep phase.city = Florence — try the day-trip label.
  if (!w && phase.dayTrip && typeof WEATHER_TYPICAL !== 'undefined') {
    var lbl = phase.dayTrip.label || '';
    for (var k in WEATHER_TYPICAL) {
      if (lbl.indexOf(k) !== -1) { w = WEATHER_TYPICAL[k]; break; }
    }
  }
  if (!w) w = { hi: '—', lo: '—', icon: '' };
  return '<div class="tile tile--flat weather-tile">' +
           '<div class="status-tile-label">TYPICAL JUNE</div>' +
           '<div class="weather-temp">' + (w.icon ? w.icon + ' ' : '') + w.hi + '°</div>' +
           '<div class="weather-lo">low ' + w.lo + '°</div>' +
         '</div>';
}

// Up Next — live counter; id lets the minute-tick refresh just this tile.
function _statusUpNextTile(phase) {
  return '<div class="tile tile--flat upnext-tile" id="today-upnext">' +
           _upNextInner(phase) +
         '</div>';
}

function _upNextInner(phase) {
  var next = (typeof getUpNext === 'function') ? getUpNext(phase.date, _todayNow()) : null;
  if (!next) {
    return '<div class="status-tile-label">UP NEXT</div>' +
           '<div class="upnext-empty">Free time</div>';
  }
  var name = next.place ? next.place.name : (next.kind === 'gift' ? 'Your gift' : 'Next stop');
  var rel = (typeof formatRelativeTime === 'function') ? formatRelativeTime(next.minutesUntil) : '';
  return '<div class="status-tile-label">UP NEXT</div>' +
         '<div class="upnext-time">' + next.time + '</div>' +
         '<div class="upnext-name">' + name + '</div>' +
         '<div class="upnext-rel">' + rel + '</div>';
}

// Real wall clock by default; on localhost honor the ?date=…THH:MM mock so Up
// Next math matches the previewed scenario.
function _todayNow() {
  var mock = (typeof _readMockParams === 'function') ? _readMockParams() : null;
  if (mock && mock.date) {
    var d = new Date(mock.date + 'T00:00:00');
    if (mock.rome) d.setHours(mock.rome.hour, mock.rome.minute, 0, 0);
    return d;
  }
  return new Date();
}

// ═══════════════════════════════════════
// TODAY'S PLAN tile (v12) — .tile--span-2, conditional image.
//   normal day → flat (no photo): the Hero already shows this place.
//   gift/move  → image of the day's first real place to visit (distinct from
//                the gift/move Hero), so two identical photos never stack.
// ═══════════════════════════════════════

function renderTodayPlanTile(phase, city, heroState) {
  var isNormal = (heroState.kind === 'normal');
  var plan = isNormal
    ? (heroState.headline || (typeof getTodayHeadlinePlace === 'function' ? getTodayHeadlinePlace(phase.date) : null))
    : _planPlaceGiftMove(phase, heroState);
  if (!plan || !plan.place) return '';

  var p = plan.place;
  var kicker = _composePlanKicker(plan);
  var time = plan.time ? '<span class="plan-time">' + plan.time + '</span>' : '';

  if (isNormal) {
    var pill = p.verdict ? renderVerdictPill(p.verdict) : '';
    var bestFor = p.best_for ? '<div class="plan-bestfor">' + p.best_for + '</div>' : '';
    return '<div class="tile tile--flat tile--span-2 plan-tile plan-tile--flat">' +
             '<div class="plan-eyebrow">TODAY’S PLAN' + (pill ? ' ' + pill : '') + '</div>' +
             '<div class="plan-headline-row"><h2 class="plan-name">' + p.name + '</h2>' + time + '</div>' +
             (kicker ? '<div class="plan-kicker">' + kicker + '</div>' : '') +
             bestFor +
           '</div>';
  }

  var bgState = { kind: 'place', id: p.id, city: city, category: p.category };
  return '<div class="tile tile--image tile--span-2 plan-tile plan-tile--image" style="' + _heroBgStyle(bgState) + '">' +
           _heroPlaceholderIcon(bgState) +
           '<div class="plan-eyebrow">TODAY’S PLAN</div>' +
           '<div class="plan-headline-row"><h2 class="plan-name">' + p.name + '</h2>' + time + '</div>' +
           (kicker ? '<div class="plan-kicker">' + kicker + '</div>' : '') +
         '</div>';
}

// On gift/move-Hero days, surface the day's first real place to visit, excluding
// any place the gift Hero already represents (so the photos differ).
function _planPlaceGiftMove(phase, heroState) {
  var exclude = (heroState.gift && heroState.gift.linkedPlaces)
    ? heroState.gift.linkedPlaces.slice() : [];
  var places = (typeof DEFAULT_PLACES !== 'undefined') ? DEFAULT_PLACES : [];
  var pick = places.find(function(p) {
    return p.city === phase.city && p.verdict === 'essential' && p.category === 'landmark'
           && exclude.indexOf(p.id) === -1;
  }) || places.find(function(p) {
    return p.city === phase.city && exclude.indexOf(p.id) === -1;
  });
  if (!pick) return null;
  return { kind: 'place', id: pick.id, time: pick.scheduled_time || null, kicker: null, place: pick };
}

// 'OPEN · ENTRY · PRE-BOOKED' from hours + category + booking state.
// A manual TODAY_PLAN[date].headline.kicker wins verbatim.
function _composePlanKicker(plan) {
  if (plan.kicker) return plan.kicker;
  var p = plan.place;
  if (!p) return '';
  var segs = [];
  var open = _openSegment(p);
  if (open) segs.push(open);
  if (typeof _kickerFromCategory === 'function' && p.category) segs.push(_kickerFromCategory(p.category));
  if (typeof isPlaceBooked === 'function' && isPlaceBooked(p.id)) segs.push('PRE-BOOKED');
  return segs.join(' · ');
}

// OPEN / OPENS HH:MM / CLOSED from hours_open/hours_close vs the Rome clock.
function _openSegment(p) {
  if (!p.hours_open && !p.hours_close) return '';
  var rome = (typeof getRomeNow === 'function') ? getRomeNow() : { hour: 12, minute: 0 };
  var nowMin = rome.hour * 60 + rome.minute;
  var o = _hhmmToMin(p.hours_open), c = _hhmmToMin(p.hours_close);
  if (o !== null && nowMin < o) return 'OPENS ' + p.hours_open;
  if (c !== null && nowMin >= c) return 'CLOSED';
  return 'OPEN';
}

function _hhmmToMin(s) {
  if (!s || typeof s !== 'string') return null;
  var parts = s.split(':');
  if (parts.length !== 2) return null;
  var h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

// ═══════════════════════════════════════
// Minute-tick (v12) — refresh only the Up Next tile so scroll position and
// in-place star-save state survive. Self-clears when the user leaves Today.
// ═══════════════════════════════════════

function _refreshUpNext() {
  var el = document.getElementById('today-upnext');
  if (!el) return;
  var phase = getTripPhase();
  if (phase.phase !== 'during') return;
  el.innerHTML = _upNextInner(phase);
}

function _installTodayTick() {
  _clearTodayTick();
  window._todayTick = setInterval(function() {
    if (typeof Router !== 'undefined' && Router.getCurrentPage && Router.getCurrentPage() === 'today') {
      _refreshUpNext();
    } else {
      _clearTodayTick();
    }
  }, 60000);
}

function _clearTodayTick() {
  if (window._todayTick) { clearInterval(window._todayTick); window._todayTick = null; }
}

// ═══════════════════════════════════════
// REAL TALK · HOME BASE · PHRASEBOOK · SAVED (v13)
// ═══════════════════════════════════════

// Full-width flat tile, no photo. Headline (Playfair, a sanctioned ≥22px use)
// + body, via the 3-step getRealTalk fallback (day override → place
// honest_summary 1st sentence → CITY_REAL_TALK).
function renderTodayRealTalk(phase) {
  var headline = (typeof getTodayHeadlinePlace === 'function') ? getTodayHeadlinePlace(phase.date) : null;
  var rt = (typeof getRealTalk === 'function') ? getRealTalk(phase.date, headline, phase.city) : null;
  if (!rt || !rt.text) return '';
  return '<div class="tile tile--flat realtalk-tile">' +
           '<div class="tile-eyebrow">REAL TALK · TODAY</div>' +
           (rt.headline ? '<h2 class="realtalk-headline">' + rt.headline + '</h2>' : '') +
           '<p class="realtalk-body">' + rt.text + '</p>' +
         '</div>';
}

// 2-col flat tile. Editorial/compact — name + "{neighborhood} · {N} min to
// center". Stays present with a "Hotel TBD" placeholder if the city has no
// booked hotel yet (consistency: the tile never disappears).
function renderTodayHomeBase(phase) {
  var hotel = (typeof HOTELS !== 'undefined') ? HOTELS[phase.city] : null;
  var name, where;
  if (!hotel) {
    name = 'Hotel TBD';
    where = 'Booking pending';
  } else {
    name = hotel.name || 'Hotel TBD';
    if (hotel.neighborhood && hotel.walk_time_min) {
      where = hotel.neighborhood + ' · ' + hotel.walk_time_min + ' min to center';
    } else if (hotel.neighborhood) {
      where = hotel.neighborhood;
    } else if (hotel.walk_time_min) {
      where = hotel.walk_time_min + ' min to center';
    } else {
      where = 'Neighborhood TBD';
    }
  }
  return '<div class="tile tile--flat homebase-tile">' +
           '<div class="tile-eyebrow">HOME BASE</div>' +
           '<div class="homebase-name">' + name + '</div>' +
           '<div class="homebase-where">' + where + '</div>' +
         '</div>';
}

// 2-col flat tile, tappable → #phrasebook (route confirmed to exist).
// Deterministic phrase-of-day; 🇮🇹 stamp is sanctioned architectural flag use.
function renderTodayPhrasebook(phase) {
  var ph = (typeof getPhraseOfDay === 'function') ? getPhraseOfDay(phase.date) : null;
  if (!ph) return '';
  return '<div class="tile tile--flat phrasebook-tile" onclick="Router.navigate(\'#phrasebook\')">' +
           '<div class="tile-eyebrow">PHRASEBOOK <span class="flag-stamp">🇮🇹</span></div>' +
           '<div class="phrasebook-it">' + ph.it + '</div>' +
           '<div class="phrasebook-pr">/' + ph.pr + '/</div>' +
           '<div class="phrasebook-en">' + ph.en + '</div>' +
         '</div>';
}

// All favorited (starred) places across the trip, ordered by trip-city order
// then name. Shared by the Today footer and the #favorites page (one builder).
function getFavoritePlaces() {
  var places = (typeof Storage !== 'undefined') ? Storage.getPlaces() : [];
  var fav = places.filter(function(p) {
    return p.saved && (typeof isVisiblePlace !== 'function' || isVisiblePlace(p));
  });
  var order = (typeof CITIES !== 'undefined') ? CITIES : [];
  fav.sort(function(a, b) {
    var d = order.indexOf(a.city) - order.indexOf(b.city);
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });
  return fav;
}

// One favorite row — a flex container (NOT a button, so it can hold a nested
// remove button): the main area taps through to detail; the ✕ unfavorites
// in place. Shared by the Today footer and the #favorites page.
function buildFavoriteRow(p) {
  var pill = (typeof renderVerdictPill === 'function' && p.verdict) ? renderVerdictPill(p.verdict) : '';
  return '<div class="saved-row">' +
           '<button class="saved-row-main" onclick="Router.navigate(\'#place/' + p.id + '\')">' +
             '<span class="saved-row-name">' + p.name + '</span>' +
             '<span class="saved-row-city">' + p.city + '</span>' +
             pill +
           '</button>' +
           '<button class="saved-row-remove" aria-label="Remove from favorites" ' +
             'onclick="removeFavorite(\'' + p.id + '\', event)">✕</button>' +
         '</div>';
}

// Unfavorite in place from a favorite row, then re-render the active surface
// (Favorites page or Today) so the row disappears immediately.
function removeFavorite(id, evt) {
  if (evt) { evt.stopPropagation(); evt.preventDefault(); }
  var places = Storage.getPlaces();
  var p = places.find(function(x) { return x.id === id; });
  if (!p) return;
  p.saved = false;
  Storage.savePlaces(places);
  showToast('Removed from favorites');
  var page = (typeof Router !== 'undefined' && Router.getCurrentPage) ? Router.getCurrentPage() : '';
  if (page === 'favorites' && typeof renderFavorites === 'function') renderFavorites();
  else if (page === 'today' && typeof renderToday === 'function') renderToday();
}

// Full-width flat tile, CONDITIONAL (absent if nothing favorited). Lists ALL
// favorites across the trip. Mirrors the #favorites page (More tab) via the
// shared getFavoritePlaces()/buildFavoriteRow() builders.
function renderTodaySavedFooter() {
  var fav = getFavoritePlaces();
  if (!fav.length) return '';
  return '<div class="tile tile--flat saved-tile">' +
           '<div class="tile-eyebrow">FAVORITES</div>' +
           '<div class="saved-list">' + fav.map(buildFavoriteRow).join('') + '</div>' +
         '</div>';
}
