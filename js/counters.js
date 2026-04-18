// ═══════════════════════════════════════
// COUNTERS — One-tap gelato/pasta/pizza/espresso/cappuccino/wine counters
// Stats dashboard + one-sentence summary for the More tab
// ═══════════════════════════════════════

// Row of tap-chips on Today (during-trip only)
function renderCounterChips() {
  var counters = Storage.getCounters();
  var html = '<div class="section-header">🍽️ Trip Counters</div>' +
    '<div class="counter-chips">';
  COUNTER_TYPES.forEach(function(t) {
    var n = counters[t.key] || 0;
    html += '<button class="counter-chip ' + (n > 0 ? 'has-count' : '') + '" ' +
      'id="chip-' + t.key + '" ' +
      'onclick="tapCounter(\'' + t.key + '\')">' +
      '<span class="counter-pop">+1</span>' +
      '<span class="counter-chip-emoji">' + t.icon + '</span>' +
      '<span class="counter-chip-count">' + n + '</span>' +
      '<span class="counter-chip-label">' + t.label + '</span>' +
      '</button>';
  });
  html += '</div>';
  return html;
}

function tapCounter(type) {
  var phase = (typeof getTripPhase === 'function') ? getTripPhase() : { city: '' };
  var city = phase.phase === 'during' ? phase.city : '';
  var updated = Storage.incrementCounter(type, city);
  var count = updated[type] || 0;

  var chip = document.getElementById('chip-' + type);
  if (chip) {
    var countEl = chip.querySelector('.counter-chip-count');
    if (countEl) countEl.textContent = count;
    chip.classList.add('has-count');
    chip.classList.remove('just-counted');
    void chip.offsetWidth;
    chip.classList.add('just-counted');
    setTimeout(function() {
      if (chip) chip.classList.remove('just-counted');
    }, 500);
  }
}

function getStatsSummary() {
  var counters = Storage.getCounters();
  var total = 0;
  COUNTER_TYPES.forEach(function(t) { total += counters[t.key] || 0; });
  if (total === 0) return 'Tap, track, toast 🥂';
  var top = COUNTER_TYPES.slice().sort(function(a, b) {
    return (counters[b.key] || 0) - (counters[a.key] || 0);
  })[0];
  return total + ' moments · top: ' + top.icon + ' ' + top.label;
}

function renderStats() {
  var content = document.getElementById('stats-content');
  if (!content) return;

  var counters = Storage.getCounters();
  var total = 0;
  COUNTER_TYPES.forEach(function(t) { total += counters[t.key] || 0; });

  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>📊 Trip Stats</h1>' +
    '<div class="subtitle">Every bite, every sip, counted</div>' +
    '</div>';

  if (total === 0) {
    content.innerHTML = headerHTML +
      '<div class="content-wrap">' +
      '<div class="stats-empty">' +
      '<div class="stats-empty-emoji">🍽️</div>' +
      '<div style="font-size:16px;font-weight:600;margin-bottom:6px;">No counts yet</div>' +
      '<div style="font-size:13px;line-height:1.5;">During the trip, tap the chips on your Today screen every time you have a gelato, pasta, espresso, or a glass of wine. They will stack up here.</div>' +
      '</div>' +
      '</div>';
    return;
  }

  var maxCount = 1;
  COUNTER_TYPES.forEach(function(t) {
    if ((counters[t.key] || 0) > maxCount) maxCount = counters[t.key];
  });

  var gridHTML = '<div class="stats-grid">';
  COUNTER_TYPES.forEach(function(t) {
    var n = counters[t.key] || 0;
    gridHTML += '<div class="stats-tile">' +
      '<div class="stats-tile-emoji">' + t.icon + '</div>' +
      '<div class="stats-tile-count">' + n + '</div>' +
      '<div class="stats-tile-label">' + t.label + '</div>' +
      '</div>';
  });
  gridHTML += '</div>';

  var barsHTML = '<div class="section-header">Breakdown</div>';
  COUNTER_TYPES.forEach(function(t) {
    var n = counters[t.key] || 0;
    var pct = maxCount > 0 ? Math.round((n / maxCount) * 100) : 0;
    barsHTML += '<div class="stats-bar-row">' +
      '<span class="stats-bar-label">' + t.icon + ' ' + t.label + '</span>' +
      '<span class="stats-bar-track"><span class="stats-bar-fill" style="width:' + pct + '%;background:' + t.color + ';"></span></span>' +
      '<span class="stats-bar-count">' + n + '</span>' +
      '</div>';
  });

  var cityHTML = '';
  if (counters.history && counters.history.length > 0) {
    var byCity = {};
    counters.history.forEach(function(h) {
      var key = h.city || 'Unknown';
      byCity[key] = (byCity[key] || 0) + 1;
    });
    var cityKeys = Object.keys(byCity).sort(function(a, b) { return byCity[b] - byCity[a]; });
    if (cityKeys.length > 0) {
      cityHTML = '<div class="section-header" style="margin-top:24px;">By City</div>';
      cityKeys.forEach(function(k) {
        var cityEmoji = (typeof CITY_EMOJI !== 'undefined' && CITY_EMOJI[k]) ? CITY_EMOJI[k] + ' ' : '';
        cityHTML += '<div class="stats-bar-row">' +
          '<span class="stats-bar-label">' + cityEmoji + k + '</span>' +
          '<span class="stats-bar-track"><span class="stats-bar-fill" style="width:' + Math.round((byCity[k] / counters.history.length) * 100) + '%;background:var(--rosso);"></span></span>' +
          '<span class="stats-bar-count">' + byCity[k] + '</span>' +
          '</div>';
      });
    }
  }

  var totalHTML = '<div class="card" style="text-align:center;padding:var(--space-lg);margin-bottom:var(--space-md);">' +
    '<div style="font-family:var(--font-display);font-size:44px;font-weight:700;color:var(--rosso);line-height:1;">' + total + '</div>' +
    '<div style="font-size:13px;color:var(--warm-gray);text-transform:uppercase;letter-spacing:1.5px;margin-top:4px;">moments tracked</div>' +
    '</div>';

  content.innerHTML = headerHTML + '<div class="content-wrap">' +
    totalHTML + gridHTML + barsHTML + cityHTML +
    '</div>';
}
