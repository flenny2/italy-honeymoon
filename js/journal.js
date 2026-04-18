// ═══════════════════════════════════════
// JOURNAL — Daily prompts, text & photos
// ═══════════════════════════════════════

var _pendingPhoto = null;

function renderJournal() {
  var content = document.getElementById('journal-content');
  if (!content) return;

  var phase = getTripPhase();
  var journal = Storage.getJournal();
  var s = Storage.getSettings();
  _pendingPhoto = null;

  // Pick today's prompt (rotate through list using day of year)
  var promptIndex = getDayOfYear() % JOURNAL_PROMPTS.length;
  var todayPrompt = JOURNAL_PROMPTS[promptIndex];

  var subtitle = 'Capture your memories';
  if (s.userName && s.partnerName) {
    subtitle = 'Memories from ' + s.userName + ' &amp; ' + s.partnerName;
  }

  var headerHTML = '<div class="page-header">' +
    '<h1>📝 Journal</h1>' +
    '<div class="subtitle">' + subtitle + '</div>' +
    '</div>';

  // Today's prompt + form
  var promptHTML = '<div class="content-wrap">' +
    '<div class="journal-prompt-card">' +
    '<div class="journal-prompt-text">' + todayPrompt + '</div>' +
    '<textarea class="journal-textarea" id="journal-input" autocapitalize="sentences" placeholder="Write your thoughts..."></textarea>' +
    '<div id="journal-photo-preview" class="journal-photo-preview"></div>' +
    '<input type="file" id="journal-photo-input" accept="image/*" style="display:none;" onchange="handleJournalPhoto(this)">' +
    '<div class="journal-actions">' +
    '<button class="btn btn-ghost btn-sm" onclick="document.getElementById(\'journal-photo-input\').click()">📷 Add Photo</button>' +
    '<button class="btn btn-primary btn-full" onclick="saveJournalFromInput()">Save Entry ✨</button>' +
    '</div>' +
    '</div>' +
    '</div>';

  // Past entries
  var entriesHTML = '';
  if (journal.length > 0) {
    entriesHTML = '<div class="content-wrap"><div class="section-header">Past Entries</div>';
    // Sort newest first
    var sorted = journal.slice().sort(function(a, b) { return b.timestamp - a.timestamp; });
    sorted.forEach(function(entry) {
      var dateStr = formatDateLong(entry.timestamp);
      entriesHTML += '<div class="journal-entry">' +
        '<div class="journal-entry-date">' + dateStr + (entry.city ? ' · ' + entry.city : '') + (entry.day ? ' · Day ' + entry.day : '') + '</div>' +
        '<div class="journal-entry-prompt">' + (entry.prompt || '') + '</div>' +
        (entry.photo ? '<div class="journal-entry-photo"><img src="' + entry.photo + '" alt="Journal photo" onclick="openJournalPhoto(this.src)"></div>' : '') +
        '<div class="journal-entry-text">' + entry.text + '</div>' +
        '</div>';
    });
    entriesHTML += '</div>';
  }

  content.innerHTML = headerHTML + promptHTML + entriesHTML;
}

function handleJournalPhoto(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];

  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      // Resize to max 800px on longest side
      var maxSize = 800;
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
      _pendingPhoto = canvas.toDataURL('image/jpeg', 0.7);

      // Show preview
      var preview = document.getElementById('journal-photo-preview');
      if (preview) {
        preview.innerHTML = '<div class="journal-photo-thumb">' +
          '<img src="' + _pendingPhoto + '" alt="Photo preview">' +
          '<button class="journal-photo-remove" onclick="removeJournalPhoto()">✕</button>' +
          '</div>';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeJournalPhoto() {
  _pendingPhoto = null;
  var preview = document.getElementById('journal-photo-preview');
  if (preview) preview.innerHTML = '';
  var input = document.getElementById('journal-photo-input');
  if (input) input.value = '';
}

function openJournalPhoto(src) {
  var overlay = document.createElement('div');
  overlay.className = 'journal-photo-overlay';
  overlay.onclick = function() { document.body.removeChild(overlay); };
  overlay.innerHTML = '<img src="' + src + '" alt="Journal photo">';
  document.body.appendChild(overlay);
}

function saveJournalFromInput() {
  var input = document.getElementById('journal-input');
  var hasText = input && input.value.trim();
  var hasPhoto = !!_pendingPhoto;

  if (!hasText && !hasPhoto) {
    showToast('Write something or add a photo!');
    return;
  }

  var phase = getTripPhase();
  var promptIndex = getDayOfYear() % JOURNAL_PROMPTS.length;

  var entry = {
    date: new Date().toISOString().split('T')[0],
    city: phase.phase === 'during' ? phase.city : '',
    day: phase.phase === 'during' ? phase.day : null,
    prompt: JOURNAL_PROMPTS[promptIndex],
    text: (input && input.value.trim()) || ''
  };

  if (_pendingPhoto) {
    entry.photo = _pendingPhoto;
  }

  Storage.saveJournalEntry(entry);
  _pendingPhoto = null;
  showToast('Journal entry saved! 📝');
  renderJournal();
}
