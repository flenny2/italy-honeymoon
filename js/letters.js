// ═══════════════════════════════════════
// SEALED LETTERS — Write, seal, reveal
// ═══════════════════════════════════════

function renderLetters() {
  var content = document.getElementById('letters-content');
  if (!content) return;

  var letters = Storage.getLetters();
  var s = Storage.getSettings();

  var subtitle = 'Sealed notes for each other';
  if (s.userName && s.partnerName) {
    subtitle = 'Sealed notes between ' + s.userName + ' &amp; ' + s.partnerName;
  }

  var headerHTML = '<div class="page-header">' +
    '<h1>💌 Letters</h1>' +
    '<div class="subtitle">' + subtitle + '</div>' +
    '</div>';

  // Write button
  var writeHTML = '<div class="content-wrap">' +
    '<button class="btn btn-primary btn-full" onclick="showLetterForm()" id="write-letter-btn">✍️ Write a Letter</button>' +
    '</div>';

  // Letter form (hidden by default) — reuses .settings-label + .settings-input
  // for consistency with the Settings page form fields.
  var fromDefault = s.userName ? s.userName : '';
  var toDefault = s.partnerName ? s.partnerName : '';

  var formHTML = '<div class="content-wrap" id="letter-form" style="display:none;">' +
    '<div class="card" style="margin-top:12px;">' +
    '<h3 style="margin-bottom:12px;">Write a Sealed Letter</h3>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
    '<div style="flex:1;">' +
    '<label class="settings-label">From</label>' +
    '<input id="letter-from" class="settings-input" type="text" autocapitalize="words" placeholder="Your name" value="' + fromDefault + '">' +
    '</div>' +
    '<div style="flex:1;">' +
    '<label class="settings-label">To</label>' +
    '<input id="letter-to" class="settings-input" type="text" autocapitalize="words" placeholder="Partner\'s name" value="' + toDefault + '">' +
    '</div>' +
    '</div>' +
    '<div style="margin-bottom:12px;">' +
    '<label class="settings-label">Open on (date)</label>' +
    '<input id="letter-date" class="settings-input" type="date">' +
    '</div>' +
    '<div style="margin-bottom:12px;">' +
    '<label class="settings-label">Your message</label>' +
    '<textarea id="letter-text" class="journal-textarea" style="min-height:120px;" autocapitalize="sentences" placeholder="Write something heartfelt..."></textarea>' +
    '</div>' +
    '<div style="display:flex;gap:8px;">' +
    '<button class="btn btn-ghost btn-full" onclick="hideLetterForm()">Cancel</button>' +
    '<button class="btn btn-primary btn-full" onclick="sealLetter()">🔒 Seal It</button>' +
    '</div>' +
    '</div></div>';

  // Existing letters
  var listHTML = '<div class="content-wrap">';
  if (letters.length > 0) {
    listHTML += '<div class="section-header" style="margin-top:16px;">Your Letters</div>';
    letters.forEach(function(letter) {
      var unlocked = Storage.isLetterUnlocked(letter);
      var dateStr = formatDateFull(letter.unlockDate);

      var meta = letter.from
        ? 'From ' + letter.from + ' · To ' + (letter.recipient || 'My love')
        : 'To: ' + (letter.recipient || 'My love');
      listHTML += '<div class="letter-card" onclick="' + (unlocked ? 'openLetter(\'' + letter.id + '\')' : '') + '">' +
        '<div class="letter-icon">' + (unlocked ? '💌' : '🔒') + '</div>' +
        '<div class="letter-info">' +
        '<div class="letter-recipient">' + meta + '</div>' +
        '<div class="letter-date">' + (unlocked ? 'Opens ' + dateStr : 'Sealed until ' + dateStr) + '</div>' +
        '</div>' +
        '<span class="letter-status ' + (unlocked ? 'letter-unlocked' : 'letter-locked') + '">' +
        (unlocked ? (letter.isRead ? 'Read' : 'Open!') : '🔒') + '</span>' +
        '</div>';
    });
  } else {
    listHTML += '<div style="text-align:center;padding:32px;color:var(--warm-gray);">' +
      '<div class="modal-icon-md" style="margin-bottom:12px;">💌</div>' +
      '<div>No letters yet. Write one for your partner!</div>' +
      '</div>';
  }
  listHTML += '</div>';

  content.innerHTML = headerHTML + writeHTML + formHTML + listHTML;
}

function showLetterForm() {
  document.getElementById('letter-form').style.display = 'block';
  document.getElementById('write-letter-btn').style.display = 'none';
}

function hideLetterForm() {
  document.getElementById('letter-form').style.display = 'none';
  document.getElementById('write-letter-btn').style.display = 'block';
}

function sealLetter() {
  var from = (document.getElementById('letter-from').value || '').trim();
  var to = (document.getElementById('letter-to').value || '').trim();
  var date = document.getElementById('letter-date').value;
  var text = document.getElementById('letter-text').value.trim();

  if (!text) { showToast('Write a message first!'); return; }
  if (!date) { showToast('Pick an unlock date!'); return; }

  Storage.saveLetter({
    from: from,
    recipient: to || 'My love',
    unlockDate: date,
    text: text
  });

  showToast('Letter sealed! 🔒💌');
  renderLetters();
}

function openLetter(id) {
  var letter = Storage.unsealLetter(id);
  if (!letter) return;

  var meta = letter.from
    ? 'From ' + letter.from + ' · To ' + (letter.recipient || 'My love')
    : 'To: ' + (letter.recipient || 'My love');

  var content = document.getElementById('surprise-content');
  var body =
    '<div style="text-align:center;">' +
    '<div class="modal-icon-md anim-bounce-in" style="margin-bottom:12px;">💌</div>' +
    '<h2 style="margin-bottom:4px;">A Letter For You</h2>' +
    '<div class="modal-meta" style="margin-bottom:20px;">' + meta + '</div>' +
    '</div>' +
    '<div class="card anim-slide-up" style="padding:24px;">' +
    '<div class="letter-body">' + letter.text + '</div>' +
    '</div>' +
    '<button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="closeModal(\'surprise-modal\');if(typeof renderLetters===\'function\')renderLetters();Router.navigate();">Close 💕</button>';
  content.innerHTML = body;

  openModal('surprise-modal');
}
