// ═══════════════════════════════════════
// SEALED LETTERS — Write, seal, reveal
// ═══════════════════════════════════════

function renderLetters() {
  var content = document.getElementById('letters-content');
  if (!content) return;

  var letters = Storage.getLetters();

  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>💌 Letters</h1>' +
    '<div class="subtitle">Sealed notes for each other</div>' +
    '</div>';

  // Write button
  var writeHTML = '<div class="content-wrap">' +
    '<button class="btn btn-primary btn-full" onclick="showLetterForm()" id="write-letter-btn">✍️ Write a Letter</button>' +
    '</div>';

  // Letter form (hidden by default)
  var formHTML = '<div class="content-wrap" id="letter-form" style="display:none;">' +
    '<div class="card" style="margin-top:12px;">' +
    '<h3 style="margin-bottom:12px;">Write a Sealed Letter</h3>' +
    '<div style="margin-bottom:12px;">' +
    '<label style="font-size:12px;font-weight:700;color:var(--warm-gray);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">To</label>' +
    '<input id="letter-to" type="text" placeholder="Your partner\'s name" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:2px solid var(--light-gray);font-family:var(--font-body);font-size:14px;">' +
    '</div>' +
    '<div style="margin-bottom:12px;">' +
    '<label style="font-size:12px;font-weight:700;color:var(--warm-gray);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Open on (date)</label>' +
    '<input id="letter-date" type="date" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:2px solid var(--light-gray);font-family:var(--font-body);font-size:14px;">' +
    '</div>' +
    '<div style="margin-bottom:12px;">' +
    '<label style="font-size:12px;font-weight:700;color:var(--warm-gray);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Your message</label>' +
    '<textarea id="letter-text" class="journal-textarea" style="min-height:120px;" placeholder="Write something heartfelt..."></textarea>' +
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

      listHTML += '<div class="letter-card" onclick="' + (unlocked ? 'openLetter(\'' + letter.id + '\')' : '') + '">' +
        '<div class="letter-icon">' + (unlocked ? '💌' : '🔒') + '</div>' +
        '<div class="letter-info">' +
        '<div class="letter-recipient">To: ' + (letter.recipient || 'My love') + '</div>' +
        '<div class="letter-date">' + (unlocked ? 'Opens ' + dateStr : 'Sealed until ' + dateStr) + '</div>' +
        '</div>' +
        '<span class="letter-status ' + (unlocked ? 'letter-unlocked' : 'letter-locked') + '">' +
        (unlocked ? (letter.isRead ? 'Read' : 'Open!') : '🔒') + '</span>' +
        '</div>';
    });
  } else {
    listHTML += '<div style="text-align:center;padding:32px;color:var(--warm-gray);">' +
      '<div style="font-size:48px;margin-bottom:12px;">💌</div>' +
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
  var to = document.getElementById('letter-to').value.trim();
  var date = document.getElementById('letter-date').value;
  var text = document.getElementById('letter-text').value.trim();

  if (!text) { showToast('Write a message first!'); return; }
  if (!date) { showToast('Pick an unlock date!'); return; }

  Storage.saveLetter({
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

  var content = document.getElementById('surprise-content');
  content.innerHTML =
    '<div style="text-align:center;">' +
    '<div style="font-size:48px;margin-bottom:12px;" class="anim-bounce-in">💌</div>' +
    '<h2 style="margin-bottom:4px;">A Letter For You</h2>' +
    '<div style="font-size:13px;color:var(--warm-gray);margin-bottom:20px;">To: ' + (letter.recipient || 'My love') + '</div>' +
    '</div>' +
    '<div class="card anim-slide-up" style="padding:24px;">' +
    '<div style="font-size:15px;line-height:1.8;color:var(--espresso);white-space:pre-wrap;">' + letter.text + '</div>' +
    '</div>' +
    '<button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="closeModal(\'surprise-modal\');renderLetters();">Close 💕</button>';

  openModal('surprise-modal');
}
