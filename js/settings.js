// ═══════════════════════════════════════
// SETTINGS — Personal details (names, wedding date, hometown, photo)
// All data stays local in localStorage.
// ═══════════════════════════════════════

var _pendingCouplePhoto = null;

function renderSettings() {
  var content = document.getElementById('settings-content');
  if (!content) return;

  var s = Storage.getSettings();
  _pendingCouplePhoto = null;

  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>⚙️ Settings</h1>' +
    '<div class="subtitle">Make the app yours</div>' +
    '</div>';

  var photoPreview = s.couplePhoto
    ? '<div class="settings-photo-preview"><img src="' + s.couplePhoto + '" alt="The two of you"><button type="button" class="settings-photo-remove" onclick="removeCouplePhoto()">✕</button></div>'
    : '<div class="settings-photo-empty">📷 No photo yet</div>';

  var bodyHTML = '<div class="content-wrap">' +
    '<div class="card settings-card">' +

    '<div class="settings-section">' +
    '<div class="settings-section-title">Us</div>' +

    '<label class="settings-label">Your name</label>' +
    '<input id="set-user-name" class="settings-input" type="text" autocomplete="given-name" autocapitalize="words" value="' + esc(s.userName) + '" placeholder="Dylan">' +

    '<label class="settings-label">Partner\'s name</label>' +
    '<input id="set-partner-name" class="settings-input" type="text" autocomplete="given-name" autocapitalize="words" value="' + esc(s.partnerName) + '" placeholder="Hope">' +

    '<label class="settings-label">Pet name / term of endearment <span class="settings-label-hint">(optional)</span></label>' +
    '<input id="set-pet-name" class="settings-input" type="text" autocapitalize="none" value="' + esc(s.petName) + '" placeholder="my love, amore, bug...">' +

    '<label class="settings-label">A photo of you two <span class="settings-label-hint">(optional)</span></label>' +
    '<div id="settings-photo-wrap">' + photoPreview + '</div>' +
    '<input type="file" id="set-photo-input" accept="image/*" style="display:none;" onchange="handleCouplePhoto(this)">' +
    '<button type="button" class="btn btn-ghost btn-sm" style="margin-top:6px;" onclick="document.getElementById(\'set-photo-input\').click()">' +
    (s.couplePhoto ? '🔄 Replace photo' : '📷 Add photo') +
    '</button>' +

    '</div>' +

    '<div class="settings-section">' +
    '<div class="settings-section-title">Milestones</div>' +

    '<label class="settings-label">Wedding date</label>' +
    '<input id="set-wedding-date" class="settings-input" type="date" value="' + esc(s.weddingDate) + '">' +
    '<div class="settings-label-hint" style="margin-top:4px;">Shown as a second countdown on Today before the trip.</div>' +

    '</div>' +

    '<div class="settings-section">' +
    '<div class="settings-section-title">Flying from</div>' +

    '<label class="settings-label">Hometown</label>' +
    '<input id="set-hometown" class="settings-input" type="text" autocapitalize="words" value="' + esc(s.hometown) + '" placeholder="Brea, CA">' +

    '<label class="settings-label">Departure airport</label>' +
    '<input id="set-airport" class="settings-input" type="text" autocapitalize="characters" value="' + esc(s.departureAirport) + '" placeholder="LAX" maxlength="5">' +

    '</div>' +

    '<button class="btn btn-primary btn-full" style="margin-top:20px;" onclick="saveSettingsFromForm()">💾 Save Settings</button>' +

    '</div>' +
    '</div>';

  content.innerHTML = headerHTML + bodyHTML;
}

function esc(val) {
  if (val === undefined || val === null) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function handleCouplePhoto(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];

  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var maxSize = 600;
      var w = img.width;
      var h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      _pendingCouplePhoto = canvas.toDataURL('image/jpeg', 0.75);

      var wrap = document.getElementById('settings-photo-wrap');
      if (wrap) {
        wrap.innerHTML = '<div class="settings-photo-preview">' +
          '<img src="' + _pendingCouplePhoto + '" alt="The two of you">' +
          '<button type="button" class="settings-photo-remove" onclick="removeCouplePhoto()">✕</button>' +
          '</div>';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeCouplePhoto() {
  _pendingCouplePhoto = '__REMOVE__';
  var wrap = document.getElementById('settings-photo-wrap');
  if (wrap) wrap.innerHTML = '<div class="settings-photo-empty">📷 No photo yet</div>';
  var input = document.getElementById('set-photo-input');
  if (input) input.value = '';
}

function saveSettingsFromForm() {
  var existing = Storage.getSettings();
  var photo = existing.couplePhoto;
  if (_pendingCouplePhoto === '__REMOVE__') photo = '';
  else if (_pendingCouplePhoto) photo = _pendingCouplePhoto;

  var updated = {
    userName:         (document.getElementById('set-user-name').value || '').trim(),
    partnerName:      (document.getElementById('set-partner-name').value || '').trim(),
    petName:          (document.getElementById('set-pet-name').value || '').trim(),
    weddingDate:      (document.getElementById('set-wedding-date').value || '').trim(),
    hometown:         (document.getElementById('set-hometown').value || '').trim(),
    departureAirport: ((document.getElementById('set-airport').value || '').trim()).toUpperCase(),
    couplePhoto:      photo
  };

  Storage.saveSettings(updated);
  _pendingCouplePhoto = null;
  showToast('💾 Saved!');
  renderSettings();
}
