// ═══════════════════════════════════════
// KEEPSAKES — "Save a copy" / "Restore from a copy" (on Settings)
// ═══════════════════════════════════════
//
// The journal, letters and time capsule live ONLY in this phone's browser
// storage: clearing site data or losing the phone loses them for good
// (fleet audit FA-23). "Save a copy" puts every key Storage owns into one
// dated JSON file; "Restore from a copy" reads one back.
//
// Restore only ADDS what is missing. It never changes or removes anything
// already on the phone, so an old copy can never overwrite newer entries,
// and the confirm step shows every part's count before and after.
//
// Tests: tests/keepsakes.test.mjs (the rules; `node --test tests/`) and
// tests/keepsakes-drive.mjs (save → wipe → restore in headless Chrome).

var Keepsakes = (function() {

  // What a copy file says about itself. parseCopy refuses any other version,
  // so a format change must ship with a reader for the old one.
  var FORMAT = { app: 'italy-honeymoon', kind: 'keepsakes', version: 1 };

  var NOTE = 'Keepsakes from our Italy honeymoon app: the journal, love letters, time capsule ' +
    'and the rest. To bring them back, open the app and go to More → Settings → Restore from a ' +
    'copy. The time capsule is sealed inside this file, like the letters.';

  // One row per key Storage owns, in the order the confirm step lists them.
  //   shape — what a stored value must look like for a copy to be accepted
  //   count — stored value → the figure Settings and the confirm step show
  //   merge — (phone, copy) → the combined value, add-only. Only called when
  //           both sides hold something (mergeValue covers the rest), and it
  //           returns `phone` itself when it adds nothing — planRestore uses
  //           that to skip keys with nothing to write.
  var PARTS = [
    { key: Storage.KEYS.journal,      label: 'Journal entries',      shape: 'list',   count: countEntries,  merge: addMissingEntries },
    { key: Storage.KEYS.letters,      label: 'Letters',              shape: 'list',   count: countEntries,  merge: addMissingEntries },
    { key: Storage.KEYS.capsule,      label: 'Time capsule',         shape: 'object', count: capsuleState,  merge: keepSealedCapsule },
    { key: Storage.KEYS.places,       label: 'Favorites',            shape: 'places', count: countStarred,  merge: addMissingStars },
    { key: Storage.KEYS.achievements, label: 'Achievements',         shape: 'object', count: countUnlocked, merge: addMissingKeys },
    { key: Storage.KEYS.counters,     label: 'Trip stats',           shape: 'object', count: countTaps,     merge: addMissingTaps },
    { key: Storage.KEYS.bookings,     label: 'Booking checklist',    shape: 'object', count: countKeys,     merge: addMissingKeys },
    { key: Storage.KEYS.settings,     label: 'Names, dates & photo', shape: 'object', count: countFilled,   merge: fillEmptyFields }
  ];

  // A key Storage gains later without a row above is still saved, and is
  // restored only onto a phone that lacks it. The test suite fails until
  // the key gets a real row, so the gap can't go unnoticed.
  function partFor(key) {
    for (var i = 0; i < PARTS.length; i++) {
      if (PARTS[i].key === key) return PARTS[i];
    }
    return { key: key, label: key, shape: 'any', count: countPresent, merge: keepPhoneValue };
  }

  // Every key Storage owns, in PARTS order (a key without a row goes last).
  function ownedKeys() {
    var owned = Object.values(Storage.KEYS);
    var keys = PARTS.map(function(part) { return part.key; })
      .filter(function(key) { return owned.indexOf(key) !== -1; });
    owned.forEach(function(key) { if (keys.indexOf(key) === -1) keys.push(key); });
    return keys;
  }

  function has(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }
  function isBlank(value) { return value === undefined || value === null || value === ''; }

  // ── Counting (what each part shows) ──
  function countEntries(list) { return Array.isArray(list) ? list.length : 0; }
  function capsuleState(capsule) { return capsule && capsule.locked ? 'sealed' : 'not sealed'; }
  function countStarred(places) { return starredIds(places).length; }
  function countKeys(map) { return map ? Object.keys(map).length : 0; }
  function countPresent(value) { return value === null || value === undefined ? 0 : 1; }

  function countUnlocked(state) {
    if (!state) return 0;
    return Object.keys(state).filter(function(id) { return state[id] && state[id].unlocked; }).length;
  }

  function countTaps(counters) {
    if (!counters) return 0;
    return Object.keys(counters).reduce(function(sum, type) {
      return sum + (type !== 'history' && typeof counters[type] === 'number' ? counters[type] : 0);
    }, 0);
  }

  function countFilled(settings) {
    if (!settings) return 0;
    return Object.keys(settings).filter(function(field) { return !isBlank(settings[field]); }).length;
  }

  function starredIds(places) {
    if (Array.isArray(places)) {   // legacy full-snapshot shape (Storage.getPlaces migrates it)
      return places.filter(function(p) { return p && p.saved; }).map(function(p) { return p.id; });
    }
    return places && Array.isArray(places.starred) ? places.starred : [];
  }

  // ── Merging (restore only adds) ──
  function mergeValue(part, phone, copy) {
    if (copy === null || copy === undefined) return phone;   // the copy has nothing here
    if (phone === null || phone === undefined) return copy;  // the phone has nothing: take the copy whole
    if (!shapeOk(part.shape, phone)) return phone;           // never touch bytes we can't read
    return part.merge(phone, copy);
  }

  function keepPhoneValue(phone) { return phone; }

  // Filter for the copy's items: keeps each one this phone lacks, once.
  function notYetIn(seen, identity) {
    return function(item) {
      var id = identity(item);
      if (seen[id]) return false;
      seen[id] = true;
      return true;
    };
  }

  // Journal entries and letters: add the copy's entries this phone lacks. An
  // entry already here stays exactly as it is (a letter opened on this phone
  // stays opened). Matched by id — every entry has had one since the first
  // build — falling back to the whole entry.
  function addMissingEntries(phone, copy) {
    var seen = {};
    phone.forEach(function(entry) { seen[entryIdentity(entry)] = true; });
    var missing = copy.filter(notYetIn(seen, entryIdentity));
    return missing.length ? phone.concat(missing) : phone;
  }

  function entryIdentity(entry) {
    return isBlank(entry.id) ? 'json:' + JSON.stringify(entry) : 'id:' + entry.id;
  }

  // The capsule is sealed once. A sealed capsule here is never replaced; an
  // unsealed one (nothing in it yet) takes the copy's sealed capsule.
  function keepSealedCapsule(phone, copy) {
    return !phone.locked && copy.locked ? copy : phone;
  }

  // Favorites: star the copy's starred places too.
  function addMissingStars(phone, copy) {
    var mine = starredIds(phone);
    var seen = {};
    mine.forEach(function(id) { seen[id] = true; });
    var missing = starredIds(copy).filter(notYetIn(seen, String));
    return missing.length ? { starred: mine.concat(missing) } : phone;
  }

  // Achievements and the booking checklist: add the ids this phone lacks. An
  // id already here keeps its value (a booking unticked here stays unticked).
  function addMissingKeys(phone, copy) {
    var missing = Object.keys(copy).filter(function(id) { return !has(phone, id); });
    if (!missing.length) return phone;
    var merged = Object.assign({}, phone);
    missing.forEach(function(id) { merged[id] = copy[id]; });
    return merged;
  }

  // Trip stats: add the copy's taps this phone lacks (a tap = its type, time
  // and city). Each count ends at the highest of the phone's, the copy's, or
  // the taps now on record, so no count ever goes down.
  function addMissingTaps(phone, copy) {
    var mine = Array.isArray(phone.history) ? phone.history : [];
    var seen = {};
    mine.forEach(function(tap) { seen[tapIdentity(tap)] = true; });
    var missing = (Array.isArray(copy.history) ? copy.history : []).filter(notYetIn(seen, tapIdentity));

    var merged = Object.assign({}, phone);
    if (missing.length) merged.history = mine.concat(missing);
    var changed = missing.length > 0;
    Object.keys(copy).forEach(function(type) {
      if (type === 'history' || typeof copy[type] !== 'number') return;
      var onRecord = (merged.history || []).filter(function(tap) { return tap && tap.type === type; }).length;
      var here = typeof phone[type] === 'number' ? phone[type] : 0;
      var count = Math.max(here, copy[type], onRecord);
      if (count !== phone[type]) { merged[type] = count; changed = true; }
    });
    return changed ? merged : phone;
  }

  function tapIdentity(tap) {
    return tap ? tap.type + '|' + tap.ts + '|' + (tap.city || '') : String(tap);
  }

  // Names, dates & photo: fill the fields that are blank here; a filled field
  // is never changed. (On a wiped phone the first-run seed in app.js fills
  // names, wedding date, hometown and airport before a restore can run, so
  // those keep the seed's values; the photo and pet name come back.)
  function fillEmptyFields(phone, copy) {
    var blanks = Object.keys(copy).filter(function(field) {
      return isBlank(phone[field]) && !isBlank(copy[field]);
    });
    if (!blanks.length) return phone;
    var merged = Object.assign({}, phone);
    blanks.forEach(function(field) { merged[field] = copy[field]; });
    return merged;
  }

  function shapeOk(shape, value) {
    if (value === null || value === undefined) return true;
    var isObject = typeof value === 'object' && !Array.isArray(value);
    if (shape === 'list') {
      return Array.isArray(value) && value.every(function(entry) {
        return entry !== null && typeof entry === 'object' && !Array.isArray(entry);
      });
    }
    if (shape === 'object') return isObject;
    if (shape === 'places') return isObject || Array.isArray(value);
    return true;   // 'any'
  }

  // ── The copy file ──
  // `values` is Storage.readAllKeys(); `savedAt` epoch ms, like every other
  // timestamp the app stores.
  function buildCopy(values, savedAt) {
    var keys = {};
    ownedKeys().forEach(function(key) {
      var value = has(values, key) ? values[key] : null;
      // The time capsule stays sealed in the file too: base64, the same gentle
      // seal the letters use, so opening the file can't spoil it before 2027.
      keys[key] = key === Storage.KEYS.capsule && value !== null ? seal(JSON.stringify(value)) : value;
    });
    return {
      app: FORMAT.app,
      kind: FORMAT.kind,
      version: FORMAT.version,
      savedAt: savedAt,
      note: NOTE,
      keys: keys
    };
  }

  // UTF-8-safe base64, the same encoding Storage.saveLetter uses for sealedText.
  function seal(text) { return btoa(unescape(encodeURIComponent(text))); }
  function unseal(text) { return decodeURIComponent(escape(atob(text))); }

  function fileName() { return 'italy-keepsakes-' + localISODate() + '.json'; }

  // A copy file's text → { values, savedAt } (every owned key, null where the
  // copy has none) or { error }. Reads only: nothing is written here. Keys the
  // app doesn't own are ignored, so a restore never writes them.
  function parseCopy(text) {
    var copy;
    try { copy = JSON.parse(text); } catch (e) { return { error: 'not-a-copy' }; }
    if (!copy || copy.app !== FORMAT.app || copy.kind !== FORMAT.kind ||
        !copy.keys || typeof copy.keys !== 'object' || Array.isArray(copy.keys)) {
      return { error: 'not-a-copy' };
    }
    if (copy.version !== FORMAT.version) return { error: 'other-version' };

    var values = {};
    var damaged = false;
    ownedKeys().forEach(function(key) {
      var value = has(copy.keys, key) ? copy.keys[key] : null;
      if (key === Storage.KEYS.capsule && typeof value === 'string') {
        try { value = JSON.parse(unseal(value)); } catch (e) { damaged = true; }
      }
      if (!shapeOk(partFor(key).shape, value)) damaged = true;
      values[key] = value;
    });
    return damaged ? { error: 'damaged' } : { values: values, savedAt: copy.savedAt };
  }

  // Work out a restore without writing anything: the values to write (only
  // keys that change) and each part's count on this phone before and after.
  function planRestore(phoneValues, copyValues) {
    var writes = {};
    var rows = ownedKeys().map(function(key) {
      var part = partFor(key);
      var phone = has(phoneValues, key) ? phoneValues[key] : null;
      var merged = mergeValue(part, phone, has(copyValues, key) ? copyValues[key] : null);
      if (merged !== phone) writes[key] = merged;
      return { label: part.label, before: part.count(phone), after: part.count(merged) };
    });
    return { writes: writes, rows: rows, changed: Object.keys(writes).length > 0 };
  }

  // ['3 journal entries', '2 letters', 'capsule sealed'] — what's on this phone.
  function summaryParts(values) {
    var journal = countEntries(values[Storage.KEYS.journal]);
    var letters = countEntries(values[Storage.KEYS.letters]);
    return [
      journal + (journal === 1 ? ' journal entry' : ' journal entries'),
      letters + (letters === 1 ? ' letter' : ' letters'),
      'capsule ' + capsuleState(values[Storage.KEYS.capsule])
    ];
  }

  function summary(values) { return summaryParts(values).join(' · '); }

  // ── Settings card ──
  // The file input has no accept= filter on purpose: iOS greys out .json
  // files under some accept values, which would leave no way to pick the
  // copy. parseCopy checks the content once a file is picked instead.
  function renderCard() {
    return '<div class="card settings-card keepsakes-card">' +
      '<div class="settings-section">' +
      '<div class="settings-section-title">Keepsakes</div>' +
      '<p class="keepsakes-text">Your journal, love letters and time capsule live only on this phone. ' +
      'Save a copy somewhere safe, like iCloud Drive, so they\'re never lost.</p>' +
      // each part stays on one line; the line breaks only between parts
      '<div class="keepsakes-summary">On this phone: ' + summaryParts(Storage.readAllKeys()).map(function(part) {
        return '<span>' + part + '</span>';
      }).join(' · ') + '</div>' +
      '<button type="button" class="btn btn-primary btn-full keepsakes-save-btn" onclick="Keepsakes.save()">💝 Save a copy</button>' +
      '<button type="button" class="btn btn-ghost btn-full keepsakes-restore-btn" onclick="Keepsakes.chooseFile()">Restore from a copy</button>' +
      '<input type="file" id="keepsakes-file" style="display:none;" onchange="Keepsakes.handleFile(this)">' +
      '</div>' +
      '</div>';
  }

  // ── Save a copy ──
  // iPhone: the share sheet (Save to Files, AirDrop, Mail) is the dependable
  // way out of a home-screen app; a plain download there opens a file preview
  // that can leave you stuck (WebKit bug 275288, closed as Safari's design).
  // So when the sheet fails, the copy is NOT downloaded instead — the toast
  // says to try again. WebKit's share() also needs the tap's own user
  // activation, so everything before it stays synchronous: an await in
  // between and iOS refuses with NotAllowedError.
  // Where files can't be shared (desktop; Android too, since Chrome won't
  // share .json files) the copy downloads.
  function save() {
    var text = JSON.stringify(buildCopy(Storage.readAllKeys(), Date.now()), null, 2);
    var file = new File([text], fileName(), { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).then(function() {
        showToast('Copy saved 💝');
      }).catch(function(err) {
        showToast(err && err.name === 'AbortError'
          ? 'No copy saved'                          // share sheet closed
          : 'Couldn\'t save the copy, try again');
      });
      return;
    }
    download(file);
  }

  function download(file) {
    var url = URL.createObjectURL(file);
    var link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoking straight away can cancel the download in some browsers
    setTimeout(function() { URL.revokeObjectURL(url); }, 60000);
    showToast('Copy downloaded 💝');
  }

  // ── Restore from a copy ──
  var pending = null;   // the plan the confirm step showed; written on "Restore"

  var ERRORS = {
    'not-a-copy':    'That isn\'t a keepsakes copy',
    'other-version': 'That copy is from another app version',
    'damaged':       'That copy looks damaged',
    'unreadable':    'Couldn\'t read that file'
  };

  function chooseFile() {
    document.getElementById('keepsakes-file').click();
  }

  function handleFile(input) {
    var file = input.files && input.files[0];
    input.value = '';   // so picking the same file again still fires onchange
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function() { showRestore(parseCopy(String(reader.result))); };
    reader.onerror = function() { showToast(ERRORS.unreadable); };
    reader.readAsText(file);
  }

  function showRestore(parsed) {
    if (parsed.error) { showToast(ERRORS[parsed.error]); return; }
    var plan = planRestore(Storage.readAllKeys(), parsed.values);
    pending = plan.changed ? plan : null;

    var rows = plan.rows.map(function(row) {
      return '<tr' + (row.after !== row.before ? ' class="keepsakes-row-changed"' : '') + '>' +
        '<td>' + row.label + '</td>' +
        '<td class="keepsakes-num">' + row.before + '</td>' +
        '<td class="keepsakes-arrow">→</td>' +
        '<td class="keepsakes-num">' + row.after + '</td>' +
        '</tr>';
    }).join('');

    var savedLine = typeof parsed.savedAt === 'number'
      ? 'Copy saved ' + formatDateFull(parsed.savedAt)
      : 'A keepsakes copy';
    var buttons = plan.changed
      ? '<button class="btn btn-ghost btn-full" onclick="Keepsakes.cancelRestore()">Cancel</button>' +
        '<button class="btn btn-primary btn-full" onclick="Keepsakes.confirmRestore()">Restore</button>'
      : '<button class="btn btn-primary btn-full" onclick="Keepsakes.cancelRestore()">Close</button>';

    document.getElementById('surprise-content').innerHTML =
      '<div class="keepsakes-modal-head">' +
      '<div class="modal-icon-md">💝</div>' +
      '<h2>' + (plan.changed ? 'Restore from this copy?' : 'Already on this phone') + '</h2>' +
      '<div class="modal-meta">' + savedLine + '</div>' +
      '</div>' +
      '<table class="keepsakes-table">' +
      '<tr class="keepsakes-head"><td></td><td class="keepsakes-num">Now</td><td></td><td class="keepsakes-num">After</td></tr>' +
      rows +
      '</table>' +
      '<p class="keepsakes-note">' + (plan.changed
        ? 'Restoring only adds what\'s missing. Nothing on this phone is changed or removed.'
        : 'Everything in this copy is already here. Nothing to restore.') + '</p>' +
      '<div class="keepsakes-actions">' + buttons + '</div>';
    openModal('surprise-modal');
  }

  function confirmRestore() {
    var plan = pending;
    pending = null;
    closeModal('surprise-modal');
    if (!plan) return;
    try {
      Storage.writeKeys(plan.writes);
    } catch (e) {
      // writeKeys has already put every key back: nothing changed
      showToast(e && (e.name === 'QuotaExceededError' || e.code === 22)
        ? 'Phone storage full, nothing changed'
        : 'Couldn\'t restore, nothing changed');
      return;
    }
    showToast('Restored 💝');
    renderSettings();
  }

  function cancelRestore() {
    pending = null;
    closeModal('surprise-modal');
  }

  return {
    // Settings screen
    renderCard: renderCard,
    save: save,
    chooseFile: chooseFile,
    handleFile: handleFile,
    confirmRestore: confirmRestore,
    cancelRestore: cancelRestore,

    // The rules, exposed for tests/keepsakes.test.mjs
    PARTS: PARTS,
    buildCopy: buildCopy,
    parseCopy: parseCopy,
    planRestore: planRestore,
    summary: summary,
    fileName: fileName
  };
})();
