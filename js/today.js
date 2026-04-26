// ═══════════════════════════════════════
// TODAY VIEW — The home screen
// Split into section renderers for clarity
// ═══════════════════════════════════════

function renderToday() {
  var content = document.getElementById('today-content');
  if (!content) return;

  var phase = getTripPhase();
  var city = getTodayCity();

  var sections = [
    renderTodayHero(phase, city),
    renderTodayLetter(),
    renderTodayCapsuleNudge(),
    renderTodayBooking(phase),
    renderTodayCounters(phase),
    renderTodayPhrase(),
    renderTodayGifts(city),
    renderTodayHotel(city, phase),
    renderTodaySuggestion(city),
    renderTodayPicks(city)
  ];

  content.innerHTML = '<div class="stagger">' +
    sections.map(function(html) {
      return html ? '<div class="today-section">' + html + '</div>' : '';
    }).join('') + '</div>';
}

// Hero composite: typography-led for BEFORE/AFTER (names + flag stripe +
// countdown + optional wedding pill), city-photo backdrop for DURING.
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

  // DURING — current-city photo as backdrop (Stage 6 swaps gradient for real photo)
  if (phase.phase === 'during') {
    var dt = phase.dayTrip;
    var emoji = CITY_EMOJI[phase.city] || '';
    var cityTag = emoji + ' ' + phase.city + ' · Day ' + phase.day;
    var orientation = dt ? dt.emoji + ' ' + dt.label : 'Today in ' + phase.city;
    return '<div class="hero-during anim-bounce-in" data-city="' + phase.city + '">' +
      '<div class="hero-during-bg"></div>' +
      '<div class="hero-during-overlay">' +
      '<span class="hero-city-tag">' + cityTag + '</span>' +
      '<div class="hero-day-orientation">' + orientation + '</div>' +
      '</div></div>';
  }

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
    html += '<div class="card card-gift">' +
      '<div class="gift-card-icon">' + gift.icon + '</div>' +
      '<div class="gift-card-title">' + gift.title + '</div>' +
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

// Check if a place has been booked (from booking checklist)
function isPlaceBooked(placeId) {
  var state = getBookingState();
  for (var i = 0; i < BOOKINGS.length; i++) {
    if (BOOKINGS[i].placeId === placeId && state[BOOKINGS[i].id]) return true;
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
