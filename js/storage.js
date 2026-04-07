// ═══════════════════════════════════════
// STORAGE LAYER
// All localStorage read/write in one place
// ═══════════════════════════════════════

var Storage = (function() {
  var KEYS = {
    places:       'italy-places-v3',
    journal:      'italy-journal-v1',
    letters:      'italy-letters-v1',
    achievements: 'italy-achievements-v1',
    capsule:      'italy-capsule-v1',
    settings:     'italy-settings-v1'
  };

  // ── Helpers ──
  function read(key) {
    try {
      var data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage read error:', key, e);
      return null;
    }
  }

  function write(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage write error:', key, e);
    }
  }

  // ── Places ──
  function getPlaces() {
    return read(KEYS.places) || DEFAULT_PLACES.map(function(p) {
      return Object.assign({}, p, { saved: false });
    });
  }

  function savePlaces(places) {
    write(KEYS.places, places);
  }

  function resetPlaces() {
    localStorage.removeItem(KEYS.places);
  }

  // ── Journal ──
  function getJournal() {
    return read(KEYS.journal) || [];
  }

  function saveJournalEntry(entry) {
    var journal = getJournal();
    // Add id and timestamp if not present
    if (!entry.id) entry.id = 'j-' + Date.now();
    if (!entry.timestamp) entry.timestamp = Date.now();
    journal.push(entry);
    write(KEYS.journal, journal);
    return entry;
  }

  function deleteJournalEntry(id) {
    var journal = getJournal().filter(function(e) { return e.id !== id; });
    write(KEYS.journal, journal);
  }

  // ── Letters ──
  function getLetters() {
    return read(KEYS.letters) || [];
  }

  function saveLetter(letter) {
    var letters = getLetters();
    if (!letter.id) letter.id = 'letter-' + Date.now();
    if (!letter.createdAt) letter.createdAt = Date.now();
    // Base64 encode the text as a gentle seal
    if (letter.text && !letter.sealed) {
      letter.sealedText = btoa(unescape(encodeURIComponent(letter.text)));
      delete letter.text;
      letter.sealed = true;
    }
    letters.push(letter);
    write(KEYS.letters, letters);
    return letter;
  }

  function unsealLetter(id) {
    var letters = getLetters();
    var letter = letters.find(function(l) { return l.id === id; });
    if (letter && letter.sealed && letter.sealedText) {
      letter.text = decodeURIComponent(escape(atob(letter.sealedText)));
      letter.isRead = true;
    }
    write(KEYS.letters, letters);
    return letter;
  }

  function isLetterUnlocked(letter) {
    if (!letter.unlockDate) return true;
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var unlock = new Date(letter.unlockDate);
    return now >= unlock;
  }

  // ── Achievements ──
  function getAchievements() {
    return read(KEYS.achievements) || {};
  }

  function unlockAchievement(id) {
    var state = getAchievements();
    state[id] = { unlocked: true, unlockedAt: Date.now() };
    write(KEYS.achievements, state);
    return state[id];
  }

  function isAchievementUnlocked(id) {
    var state = getAchievements();
    return state[id] && state[id].unlocked;
  }

  function getAchievementCount() {
    var state = getAchievements();
    var unlocked = 0;
    for (var key in state) {
      if (state[key] && state[key].unlocked) unlocked++;
    }
    return { unlocked: unlocked, total: ACHIEVEMENTS.length };
  }

  // ── Time Capsule ──
  function getCapsule() {
    return read(KEYS.capsule) || {
      locked: false,
      lockUntil: null,
      favoriteVotes: {},
      letterToFutureSelf: {},
      snapshot: null
    };
  }

  function sealCapsule(data) {
    var capsule = Object.assign({}, data, {
      locked: true,
      lockUntil: '2027-06-27',
      sealedAt: Date.now(),
      snapshot: {
        journal: getJournal(),
        achievements: getAchievements()
      }
    });
    write(KEYS.capsule, capsule);
    return capsule;
  }

  function isCapsuleUnlocked() {
    var capsule = getCapsule();
    if (!capsule.locked) return false; // not sealed yet
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var unlock = new Date(capsule.lockUntil);
    return now >= unlock;
  }

  // ── Settings ──
  function getSettings() {
    return read(KEYS.settings) || { partnerName: '' };
  }

  function saveSettings(settings) {
    write(KEYS.settings, settings);
  }

  // ── Reset All ──
  function resetAll() {
    Object.values(KEYS).forEach(function(key) {
      localStorage.removeItem(key);
    });
  }

  // ── Public API ──
  return {
    getPlaces: getPlaces,
    savePlaces: savePlaces,
    resetPlaces: resetPlaces,

    getJournal: getJournal,
    saveJournalEntry: saveJournalEntry,
    deleteJournalEntry: deleteJournalEntry,

    getLetters: getLetters,
    saveLetter: saveLetter,
    unsealLetter: unsealLetter,
    isLetterUnlocked: isLetterUnlocked,

    getAchievements: getAchievements,
    unlockAchievement: unlockAchievement,
    isAchievementUnlocked: isAchievementUnlocked,
    getAchievementCount: getAchievementCount,

    getCapsule: getCapsule,
    sealCapsule: sealCapsule,
    isCapsuleUnlocked: isCapsuleUnlocked,

    getSettings: getSettings,
    saveSettings: saveSettings,

    resetAll: resetAll
  };
})();
