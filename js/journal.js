// ═══════════════════════════════════════
// JOURNAL — Daily prompts & entries
// ═══════════════════════════════════════

function renderJournal() {
  var content = document.getElementById('journal-content');
  if (!content) return;

  var phase = getTripPhase();
  var journal = Storage.getJournal();

  // Pick today's prompt (rotate through list using day of year)
  var promptIndex = getDayOfYear() % JOURNAL_PROMPTS.length;
  var todayPrompt = JOURNAL_PROMPTS[promptIndex];

  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>📝 Journal</h1>' +
    '<div class="subtitle">Capture your memories</div>' +
    '</div>';

  // Today's prompt
  var promptHTML = '<div class="content-wrap">' +
    '<div class="journal-prompt-card">' +
    '<div class="journal-prompt-text">' + todayPrompt + '</div>' +
    '<textarea class="journal-textarea" id="journal-input" placeholder="Write your thoughts..."></textarea>' +
    '<div style="margin-top:8px;display:flex;gap:8px;">' +
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
        '<div class="journal-entry-text">' + entry.text + '</div>' +
        '</div>';
    });
    entriesHTML += '</div>';
  }

  content.innerHTML = headerHTML + promptHTML + entriesHTML;
}

function saveJournalFromInput() {
  var input = document.getElementById('journal-input');
  if (!input || !input.value.trim()) {
    showToast('Write something first!');
    return;
  }

  var phase = getTripPhase();
  var promptIndex = getDayOfYear() % JOURNAL_PROMPTS.length;

  Storage.saveJournalEntry({
    date: new Date().toISOString().split('T')[0],
    city: phase.phase === 'during' ? phase.city : '',
    day: phase.phase === 'during' ? phase.day : null,
    prompt: JOURNAL_PROMPTS[promptIndex],
    text: input.value.trim()
  });

  showToast('Journal entry saved! 📝');
  renderJournal();
}
