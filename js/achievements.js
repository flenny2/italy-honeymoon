// ═══════════════════════════════════════
// ACHIEVEMENTS — Video game style!
// ═══════════════════════════════════════

function renderAchievements() {
  var content = document.getElementById('achievements-content');
  if (!content) return;

  var state = Storage.getAchievements();
  // Count excluding platinum (platinum is earned by getting everything else)
  var nonPlatinum = ACHIEVEMENTS.filter(function(a) { return a.rarity !== 'platinum'; });
  var totalUnlocked = nonPlatinum.filter(function(a) { return state[a.id] && state[a.id].unlocked; }).length;
  var total = nonPlatinum.length;
  var pct = total > 0 ? Math.round((totalUnlocked / total) * 100) : 0;

  // Check if platinum should auto-unlock
  if (totalUnlocked === total && !state['platinum']) {
    Storage.unlockAchievement('platinum');
    state = Storage.getAchievements();
  }

  // Header
  var headerHTML = '<div class="page-header">' +
    '<button class="back-btn" onclick="Router.navigate(\'#more\')">← More</button>' +
    '<h1>🏆 Achievements</h1>' +
    '</div>';

  // Stats banner (game-style)
  var statsHTML = '<div class="content-wrap">' +
    '<div class="ach-stats-banner">' +
    '<div class="ach-stats-row">' +
    '<div class="ach-stat">' +
    '<div class="ach-stat-number">' + totalUnlocked + '</div>' +
    '<div class="ach-stat-label">Unlocked</div>' +
    '</div>' +
    '<div class="ach-stat">' +
    '<div class="ach-stat-number">' + (total - totalUnlocked) + '</div>' +
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
    '<div class="ach-progress-label">' + totalUnlocked + ' / ' + total + ' achievements</div>' +
    '</div></div>';

  // Group by category
  var categories = {};
  ACHIEVEMENTS.forEach(function(a) {
    if (!categories[a.category]) categories[a.category] = [];
    categories[a.category].push(a);
  });

  var listHTML = '<div class="content-wrap">';

  // Show platinum card at top
  var platinumAch = ACHIEVEMENTS.find(function(a) { return a.rarity === 'platinum'; });
  if (platinumAch) {
    var platinumUnlocked = state[platinumAch.id] && state[platinumAch.id].unlocked;
    listHTML += '<div class="ach-card ach-platinum-card ' + (platinumUnlocked ? 'ach-platinum-unlocked' : 'ach-platinum-locked') + '">' +
      '<div class="ach-card-icon-wrap ach-platinum-icon-wrap">' +
      '<span class="ach-card-icon">' + platinumAch.icon + '</span>' +
      '</div>' +
      '<div class="ach-card-info">' +
      '<div class="ach-card-title">' + platinumAch.title + '</div>' +
      '<div class="ach-card-challenge">' + (platinumUnlocked ? platinumAch.challenge : 'Unlock every achievement to earn the platinum') + '</div>' +
      '<div class="ach-card-bottom">' +
      '<span class="ach-rarity ach-rarity-platinum">💎 Platinum</span>' +
      (platinumUnlocked ? '<span class="ach-completed">✓ ' + formatDateShort(state[platinumAch.id].unlockedAt) + '</span>' : '<span style="font-size:11px;color:var(--warm-gray);">' + totalUnlocked + ' / ' + total + '</span>') +
      '</div>' +
      '</div>' +
      '</div>';
  }

  // Render each category (exclude platinum)
  Object.keys(ACHIEVEMENT_CATEGORIES).forEach(function(catKey) {
    if (catKey === 'platinum') return;
    var cat = ACHIEVEMENT_CATEGORIES[catKey];
    var achievements = categories[catKey];
    if (!achievements || achievements.length === 0) return;

    var catUnlocked = achievements.filter(function(a) { return state[a.id] && state[a.id].unlocked; }).length;
    var catPct = achievements.length > 0 ? Math.round((catUnlocked / achievements.length) * 100) : 0;

    listHTML += '<div class="ach-category-header">' +
      '<span>' + cat.icon + ' ' + cat.label + '</span>' +
      '<span class="ach-category-count">' + catUnlocked + ' / ' + achievements.length + '</span>' +
      '</div>' +
      '<div class="ach-category-progress"><div class="ach-category-progress-fill" style="width:' + catPct + '%"></div></div>';

    achievements.forEach(function(a) {
      var unlocked = state[a.id] && state[a.id].unlocked;
      var rarity = RARITY[a.rarity] || RARITY['common'];
      var unlockedDate = '';
      if (unlocked && state[a.id].unlockedAt) {
        unlockedDate = formatDateShort(state[a.id].unlockedAt);
      }

      listHTML += '<div class="ach-card ' + (unlocked ? 'ach-unlocked' : 'ach-locked') + ' ach-rarity-tier-' + a.rarity + '" onclick="' + (unlocked ? '' : 'showAchievementDetail(\'' + a.id + '\')') + '">' +
        '<div class="ach-card-icon-wrap ' + (unlocked ? '' : 'ach-icon-locked') + '">' +
        '<span class="ach-card-icon">' + a.icon + '</span>' +
        (!unlocked ? '<span class="ach-lock-overlay">🔒</span>' : '') +
        '</div>' +
        '<div class="ach-card-info">' +
        '<div class="ach-card-title">' + a.title + '</div>' +
        '<div class="ach-card-challenge">' + a.challenge + '</div>' +
        '<div class="ach-card-bottom">' +
        '<span class="ach-rarity" style="background:' + rarity.bg + ';color:' + rarity.color + ';">' + (rarity.icon ? rarity.icon + ' ' : '') + rarity.label + '</span>' +
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
    '<span class="ach-rarity" style="background:' + rarity.bg + ';color:' + rarity.color + ';font-size:11px;">' + (rarity.icon ? rarity.icon + ' ' : '') + rarity.label + '</span>' +
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

  // Celebration!
  fireConfetti();
  showToast('🎉 ' + (a ? a.title : 'Achievement') + ' unlocked!');

  // Check if this completes all non-platinum achievements
  var state = Storage.getAchievements();
  var nonPlatinum = ACHIEVEMENTS.filter(function(x) { return x.rarity !== 'platinum'; });
  var allDone = nonPlatinum.every(function(x) { return state[x.id] && state[x.id].unlocked; });
  if (allDone && !state['platinum']) {
    setTimeout(function() {
      Storage.unlockAchievement('platinum');
      fireConfetti();
      fireConfetti();
      showToast('💎 PLATINUM — Amore Infinito!');
      renderAchievements();
    }, 1500);
  }

  renderAchievements();
}
