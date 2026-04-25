// ═══════════════════════════════════════
// SURPRISE ME — Random place picker
// ═══════════════════════════════════════

function openSurprise(city) {
  var places = Storage.getPlaces();
  var candidates = places.filter(isVisiblePlace);

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
    '<div class="modal-icon-md anim-bounce-in" style="margin-bottom:12px;">🎲</div>' +
    '<h2 style="margin-bottom:4px;">Surprise!</h2>' +
    '<div class="modal-meta" style="margin-bottom:20px;">How about this...</div>' +
    '</div>' +
    '<div class="card anim-slide-up" style="text-align:center;padding:24px;">' +
    '<div class="modal-icon-sm" style="margin-bottom:8px;">' + (CAT_ICONS[pick.category] || '📍') + '</div>' +
    '<div class="modal-place-name" style="margin-bottom:4px;">' + pick.name + '</div>' +
    '<div class="modal-meta" style="margin-bottom:12px;">📍 ' + pick.city + ' · ' + pick.category + '</div>' +
    (v ? '<div class="verdict-badge verdict-' + pick.verdict + '" style="margin-bottom:12px;">' + v.icon + ' ' + v.label + '</div>' : '') +
    (pick.honest_summary ? '<div class="modal-body-text" style="margin-bottom:16px;">' + pick.honest_summary.substring(0, 150) + '...</div>' : '') +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:16px;">' +
    '<button class="btn btn-ghost btn-full" onclick="closeModal(\'surprise-modal\')">Maybe Later</button>' +
    '<button class="btn btn-primary btn-full" onclick="closeModal(\'surprise-modal\');Router.navigate(\'#place/' + pick.id + '\')">Let\'s Go! 🎉</button>' +
    '</div>';

  openModal('surprise-modal');
}
