// ═══════════════════════════════════════
// PLACE DETAIL VIEW
// ═══════════════════════════════════════

function renderDetail(id) {
  var content = document.getElementById('place-content');
  if (!content) return;

  var places = Storage.getPlaces();
  var p = places.find(function(x) { return x.id === id; });
  if (!p) {
    content.innerHTML = '<div class="content-wrap" style="text-align:center;padding:48px;"><p>Place not found.</p>' +
      '<button class="btn btn-primary" onclick="Router.navigate(\'#explore\')">Back to Explore</button></div>';
    return;
  }

  // Back button
  var backHTML = '<button class="back-btn" onclick="history.back()">← Back</button>';

  // Category badge
  var catHTML = '<div class="detail-category-badge" style="background:' + (CAT_COLORS[p.category] || '#999') + '">' +
    (CAT_ICONS[p.category] || '') + ' ' + p.category + '</div>';

  // Name and city
  var nameHTML = '<div class="detail-name">' + p.name + '</div>' +
    '<div class="detail-city">📍 ' + p.city + '</div>';

  // Source badge
  var sourceHTML = p.source ? '<div style="margin-bottom:16px;"><span class="source-badge">' + p.source + '</span></div>' : '';

  // Mood tags
  var tags = autoTag(p);
  var tagsHTML = '';
  if (tags.length > 0) {
    tagsHTML = '<div class="mood-tags">';
    tags.forEach(function(t) {
      if (MOODS[t]) {
        tagsHTML += '<span class="mood-tag" style="background:' + MOODS[t].color + '15;color:' + MOODS[t].color + ';border:1px solid ' + MOODS[t].color + '30;">' +
          MOODS[t].icon + ' ' + t + '</span>';
      }
    });
    tagsHTML += '</div>';
  }

  // Verdict badge
  var verdictHTML = '';
  if (p.verdict && VERDICTS[p.verdict]) {
    var v = VERDICTS[p.verdict];
    verdictHTML = '<div style="margin-bottom:16px;">' +
      '<span class="verdict-badge verdict-' + p.verdict + '">' + v.icon + ' ' + v.label + ' — ' + v.desc + '</span>' +
      '</div>';
  }

  // Wedding-gift callout — fires if any GIFTED_EXPERIENCES has this place
  // in its linkedPlaces. Sits with verdict (both are "decision info"),
  // above Real Talk (narrative).
  var giftHTML = '';
  if (typeof GIFTED_EXPERIENCES !== 'undefined') {
    var matchingGifts = GIFTED_EXPERIENCES.filter(function(g) {
      return g.linkedPlaces && g.linkedPlaces.indexOf(p.id) !== -1;
    });
    if (matchingGifts.length > 0) {
      matchingGifts.forEach(function(g) {
        var status = (typeof getEntryStatus === 'function') ? getEntryStatus(g) : (g.bookingStatus || 'voucher-only');
        var statusLine = (typeof formatGiftStatus === 'function') ? formatGiftStatus(g) : '';
        var giver = g.giver ? 'A gift from ' + g.giver : 'A gift from …';
        giftHTML += '<div class="detail-gift-callout gift-status-' + status + '">' +
          '<div class="detail-gift-icon">' + (g.icon || '🎁') + '</div>' +
          '<div class="detail-gift-body">' +
          '<strong>' + g.title + '</strong>' +
          '<div class="detail-gift-giver">' + giver + '</div>' +
          '<div class="detail-gift-status">' + statusLine + '</div>' +
          '</div></div>';
      });
    }
  }

  // Real Talk section
  var realTalkHTML = '';
  if (p.honest_summary) {
    realTalkHTML = '<div class="real-talk">' +
      '<div class="real-talk-title">🗣️ The Real Story</div>' +
      '<div class="real-talk-text">' + p.honest_summary + '</div>' +
      (p.best_for ? '<div class="real-talk-best-for">👤 ' + p.best_for + '</div>' : '') +
      '</div>';
  }

  // Description
  var descHTML = '<div class="detail-desc">' + p.description + '</div>';

  // Curator notes (small italic line under description; only if present)
  var notesHTML = p.notes
    ? '<div class="detail-notes">' + p.notes + '</div>'
    : '';

  // Nearby pairings
  var nearby = getNearbyPairings(p);
  var nearbyHTML = '';
  if (nearby.length > 0) {
    nearbyHTML = '<div style="margin-bottom:16px;">' +
      '<div class="section-header">📍 Pair With (nearby)</div>' +
      '<div class="pairing-chips">';
    nearby.forEach(function(n) {
      nearbyHTML += '<span class="pairing-chip" onclick="Router.navigate(\'#place/' + n.id + '\')">' +
        (CAT_ICONS[n.category] || '') + ' ' + n.name + ' · ' + walkMinutes(n.dist) + ' min</span>';
    });
    nearbyHTML += '</div></div>';
  }

  // Visit info card
  var vi = getVisitInfo(p);
  var visitHTML = '<div class="visit-card">' +
    '<div class="visit-card-title">🗓️ Plan Your Visit</div>' +
    '<div class="visit-card-grid">' +
    '<div class="visit-card-item"><div class="visit-card-label">⏱️ Duration</div><div>' + vi.duration + '</div></div>' +
    '<div class="visit-card-item"><div class="visit-card-label">💶 Cost</div><div>' + vi.cost + '</div></div>' +
    '<div class="visit-card-item"><div class="visit-card-label">🎟️ Booking</div><div>' + vi.booking + '</div></div>' +
    '<div class="visit-card-item"><div class="visit-card-label">☀️ Best Time</div><div>' + vi.bestTime + '</div></div>' +
    '</div>';
  if (vi.transport !== '—') {
    visitHTML += '<div class="visit-card-full"><div class="visit-card-label">🚇 Getting There</div><div>' + vi.transport + '</div></div>';
  }
  if (vi.accessibility !== '—') {
    visitHTML += '<div class="visit-card-full"><div class="visit-card-label">♿ Access</div><div>' + vi.accessibility + '</div></div>';
  }
  visitHTML += '</div>';

  // Favorite button
  var saveHTML = '<div class="detail-actions">' +
    '<button class="btn ' + (p.saved ? 'btn-verde' : 'btn-outline') + '" onclick="toggleSave(\'' + p.id + '\', event)">' +
    (p.saved ? '⭐ Favorited' : '☆ Favorite') +
    '</button>' +
    '</div>';

  content.innerHTML = '<div class="detail-content stagger">' +
    backHTML + catHTML + nameHTML + sourceHTML + tagsHTML + verdictHTML +
    giftHTML + realTalkHTML + descHTML + notesHTML + nearbyHTML + visitHTML + saveHTML +
    '</div>';
}

function getVisitInfo(p) {
  var info = {};

  // Values with units/end-times ("3 hrs (08:00–11:00)") render as-is; bare
  // numeric ranges ("90–120") keep the legacy ' min' suffix.
  if (p.duration_min) info.duration = /[a-z]/i.test(String(p.duration_min)) ? p.duration_min : p.duration_min + ' min';
  else if (p.category === 'dining') info.duration = '60–90 min';
  else if (p.category === 'landmark') info.duration = '1–2 hrs';
  else if (p.category === 'viewpoint') info.duration = '20–30 min';
  else if (p.category === 'activity') info.duration = '1–3 hrs';
  else if (p.category === 'transit') info.duration = 'Pass through';
  else info.duration = '30–60 min';

  info.cost = p.cost || (p.category === 'dining' ? '€25–40/person' :
    p.category === 'landmark' ? 'Check ticket price' :
    p.category === 'viewpoint' ? 'Free' : '—');

  info.booking = p.booking || (p.category === 'dining' ? 'Recommended for dinner' :
    p.category === 'landmark' ? 'Book online ahead' : 'Walk in');

  info.bestTime = p.best_time || (p.category === 'viewpoint' ? 'Sunset' :
    p.category === 'landmark' ? 'Early morning' :
    p.category === 'dining' ? 'Check opening hours' : '—');

  info.transport = p.transport || '—';
  info.accessibility = p.accessibility || '—';

  return info;
}
