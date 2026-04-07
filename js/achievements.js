// ═══════════════════════════════════════
// ACHIEVEMENTS — Video game style!
// ═══════════════════════════════════════

function renderAchievements() {
  var content = document.getElementById('achievements-content');
  if (!content) return;

  var state = Storage.getAchievements();
  var counts = Storage.getAchievementCount();
  var pct = counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;

  // Header with XP-style progress
  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>🏆 Achievements</h1>' +
    '</div>';

  // Stats banner (game-style)
  var statsHTML = '<div class="content-wrap">' +
    '<div class="ach-stats-banner">' +
    '<div class="ach-stats-row">' +
    '<div class="ach-stat">' +
    '<div class="ach-stat-number">' + counts.unlocked + '</div>' +
    '<div class="ach-stat-label">Unlocked</div>' +
    '</div>' +
    '<div class="ach-stat">' +
    '<div class="ach-stat-number">' + (counts.total - counts.unlocked) + '</div>' +
    '<div class="ach-stat-label">Remaining</div>' +
    '</div>' +
    '<div class="ach-stat">' +
    '<div class="ach-stat-number">' + pct + '%</div>' +
    '<div class="ach-stat-label">Complete</div>' +
    '</div>' +
    '</div>' +
    '<div class="ach-progress-bar">' +
    '<div class="ach-progress-fill" style="width:' + pct + '%"></div>' +
    '</div>' +
    '<div class="ach-progress-label">' + counts.unlocked + ' / ' + counts.total + ' achievements</div>' +
    '</div></div>';

  // Group by category
  var categories = {};
  ACHIEVEMENTS.forEach(function(a) {
    if (!categories[a.category]) categories[a.category] = [];
    categories[a.category].push(a);
  });

  var listHTML = '<div class="content-wrap">';

  Object.keys(ACHIEVEMENT_CATEGORIES).forEach(function(catKey) {
    var cat = ACHIEVEMENT_CATEGORIES[catKey];
    var achievements = categories[catKey];
    if (!achievements || achievements.length === 0) return;

    var catUnlocked = achievements.filter(function(a) { return state[a.id] && state[a.id].unlocked; }).length;

    listHTML += '<div class="ach-category-header">' +
      '<span>' + cat.icon + ' ' + cat.label + '</span>' +
      '<span class="ach-category-count">' + catUnlocked + ' / ' + achievements.length + '</span>' +
      '</div>';

    achievements.forEach(function(a) {
      var unlocked = state[a.id] && state[a.id].unlocked;
      var rarity = RARITY[a.rarity] || RARITY['common'];
      var unlockedDate = '';
      if (unlocked && state[a.id].unlockedAt) {
        var d = new Date(state[a.id].unlockedAt);
        unlockedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      listHTML += '<div class="ach-card ' + (unlocked ? 'ach-unlocked' : 'ach-locked') + '" onclick="' + (unlocked ? '' : 'showAchievementDetail(\'' + a.id + '\')') + '">' +
        '<div class="ach-card-icon-wrap ' + (unlocked ? '' : 'ach-icon-locked') + '">' +
        '<span class="ach-card-icon">' + a.icon + '</span>' +
        (!unlocked ? '<span class="ach-lock-overlay">🔒</span>' : '') +
        '</div>' +
        '<div class="ach-card-info">' +
        '<div class="ach-card-title">' + a.title + '</div>' +
        '<div class="ach-card-challenge">' + a.challenge + '</div>' +
        '<div class="ach-card-bottom">' +
        '<span class="ach-rarity" style="background:' + rarity.bg + ';color:' + rarity.color + ';">' + rarity.label + '</span>' +
        (unlocked ? '<span class="ach-completed">✓ ' + unlockedDate + '</span>' : '<span class="ach-tap-hint">Tap for details</span>') +
        '</div>' +
        '</div>' +
        '</div>';
    });
  });

  listHTML += '</div>';

  content.innerHTML = headerHTML + statsHTML + listHTML;
}

function showAchievementDetail(id) {
  var a = ACHIEVEMENTS.find(function(x) { return x.id === id; });
  if (!a) return;
  var rarity = RARITY[a.rarity] || RARITY['common'];

  var content = document.getElementById('surprise-content');
  content.innerHTML =
    '<div style="text-align:center;">' +
    '<div class="ach-detail-icon anim-bounce-in">' + a.icon + '</div>' +
    '<h2 style="margin-bottom:2px;">' + a.title + '</h2>' +
    '<span class="ach-rarity" style="background:' + rarity.bg + ';color:' + rarity.color + ';font-size:11px;">' + rarity.label + '</span>' +
    '</div>' +
    '<div class="ach-detail-section">' +
    '<div class="ach-detail-label">🎯 Challenge</div>' +
    '<div class="ach-detail-text">' + a.challenge + '</div>' +
    '</div>' +
    '<div class="ach-detail-section">' +
    '<div class="ach-detail-label">📋 How to Complete</div>' +
    '<div class="ach-detail-text">' + a.howTo + '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:20px;">' +
    '<button class="btn btn-ghost btn-full" onclick="closeModal(\'surprise-modal\')">Not Yet</button>' +
    '<button class="btn btn-verde btn-full" onclick="doUnlock(\'' + id + '\')">✓ I Did This!</button>' +
    '</div>';

  openModal('surprise-modal');
}

function doUnlock(id) {
  Storage.unlockAchievement(id);
  closeModal('surprise-modal');

  var a = ACHIEVEMENTS.find(function(x) { return x.id === id; });
  showToast('🎉 ' + (a ? a.title : 'Achievement') + ' unlocked!');

  renderAchievements();
}
