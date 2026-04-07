// ═══════════════════════════════════════
// PHRASEBOOK
// ═══════════════════════════════════════

function renderPhrasebook() {
  var content = document.getElementById('phrasebook-content');
  if (!content) return;

  var headerHTML = '<div class="page-header">' +
    '<h1>🇮🇹 Phrasebook</h1>' +
    '<div class="subtitle">' + countTotalPhrases() + ' essential phrases</div>' +
    '</div>';

  var searchHTML = '<div class="content-wrap">' +
    '<input class="pb-search" type="text" placeholder="Search phrases..." ' +
    'oninput="filterPhrasebook(this.value)" id="pb-search-input">' +
    '</div>';

  var listHTML = '<div class="content-wrap" id="pb-list"></div>';

  content.innerHTML = headerHTML + searchHTML + listHTML;
  renderPhraseList('');
}

function renderPhraseList(filter) {
  var list = document.getElementById('pb-list');
  if (!list) return;
  filter = (filter || '').toLowerCase();

  var html = '';
  PHRASES.forEach(function(cat, ci) {
    var filtered = filter
      ? cat.phrases.filter(function(p) {
          return p.it.toLowerCase().indexOf(filter) !== -1 ||
                 p.en.toLowerCase().indexOf(filter) !== -1 ||
                 p.pr.toLowerCase().indexOf(filter) !== -1;
        })
      : cat.phrases;

    if (filter && filtered.length === 0) return;
    var isOpen = filter ? true : false;

    html += '<div class="pb-category">' +
      '<div class="pb-cat-header" onclick="togglePbCategory(' + ci + ')">' +
      '<div class="pb-cat-icon" style="background:' + cat.color + '15;color:' + cat.color + '">' + cat.icon + '</div>' +
      '<div class="pb-cat-name">' + cat.cat + '</div>' +
      '<div class="pb-cat-count">' + filtered.length + '</div>' +
      '<div class="pb-cat-arrow ' + (isOpen ? 'open' : '') + '" id="pb-arrow-' + ci + '">▶</div>' +
      '</div>' +
      '<div class="pb-phrases ' + (isOpen ? 'open' : '') + '" id="pb-phrases-' + ci + '">';

    filtered.forEach(function(p) {
      html += '<div class="pb-phrase">' +
        '<div class="pb-italian">' + p.it + '</div>' +
        '<div class="pb-pronounce">/' + p.pr + '/</div>' +
        '<div class="pb-english">' + p.en + '</div>' +
        '</div>';
    });

    if (cat.tip) {
      html += '<div class="pb-tip">💡 ' + cat.tip + '</div>';
    }

    html += '</div></div>';
  });

  list.innerHTML = html;
}

function togglePbCategory(i) {
  var phrases = document.getElementById('pb-phrases-' + i);
  var arrow = document.getElementById('pb-arrow-' + i);
  if (!phrases) return;
  phrases.classList.toggle('open');
  if (arrow) arrow.classList.toggle('open');
}

function filterPhrasebook(val) {
  renderPhraseList(val);
}

function countTotalPhrases() {
  var count = 0;
  PHRASES.forEach(function(cat) { count += cat.phrases.length; });
  return count;
}
