// ═══════════════════════════════════════
// SURPRISE ME — Random place picker
// ═══════════════════════════════════════

function openSurprise(city) {
  var places = Storage.getPlaces();
  var candidates = places.filter(function(p) {
    return p.category !== 'transit' && p.category !== 'pharmacy' && p.category !== 'restroom';
  });

  if (city && city !== 'all') {
    candidates = candidates.filter(function(p) { return p.city === city; });
  }

  if (candidates.length === 0) {
    showToast('No places to surprise you with!');
    return;
  }

  var pick = candidates[Math.floor(Math.random() * candidates.length)];
  var v = pick.verdict && VERDICTS[pick.verdict] ? VERDICTS[pick.verdict] : null;

  var content = document.getElementById('surprise-content');
  content.innerHTML =
    '<div style="text-align:center;">' +
    '<div style="font-size:48px;margin-bottom:12px;" class="anim-bounce-in">🎲</div>' +
    '<h2 style="margin-bottom:4px;">Surprise!</h2>' +
    '<div style="font-size:13px;color:var(--warm-gray);margin-bottom:20px;">How about this...</div>' +
    '</div>' +
    '<div class="card anim-slide-up" style="text-align:center;padding:24px;">' +
    '<div style="font-size:32px;margin-bottom:8px;">' + (CAT_ICONS[pick.category] || '📍') + '</div>' +
    '<div style="font-family:var(--font-display);font-size:20px;font-weight:700;margin-bottom:4px;">' + pick.name + '</div>' +
    '<div style="font-size:13px;color:var(--warm-gray);margin-bottom:12px;">📍 ' + pick.city + ' · ' + pick.category + '</div>' +
    (v ? '<div class="verdict-badge verdict-' + pick.verdict + '" style="margin-bottom:12px;">' + v.icon + ' ' + v.label + '</div>' : '') +
    (pick.honest_summary ? '<div style="font-size:13px;line-height:1.6;color:var(--espresso);margin-bottom:16px;">' + pick.honest_summary.substring(0, 150) + '...</div>' : '') +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:16px;">' +
    '<button class="btn btn-ghost btn-full" onclick="closeModal(\'surprise-modal\')">Maybe Later</button>' +
    '<button class="btn btn-primary btn-full" onclick="closeModal(\'surprise-modal\');Router.navigate(\'#place/' + pick.id + '\')">Let\'s Go! 🎉</button>' +
    '</div>';

  openModal('surprise-modal');
}
