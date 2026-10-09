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
// you wrote on the phone, so an old copy can never overwrite newer entries,
// and the confirm step shows every part's count before and after.
//
// Tests: tests/keepsakes.test.mjs (the rules; `node --test`) and
// tests/keepsakes-drive.mjs (save → wipe → restore in headless Chrome).

var Keepsakes = (function() {

  // What a copy file says about itself. parseCopy refuses any other version,
  // so a format change must ship with a reader for the old one.
  var FORMAT = { app: 'italy-honeymoon', kind: 'keepsakes', version: 1 };

  var NOTE = 'Keepsakes from our Italy honeymoon app: the journal, love letters, time capsule ' +
    'and the rest. To bring them back, open the app and go to More → Settings → Restore from a ' +
    'copy. The time capsule is sealed inside this file, like the letters.';

  // ── Reading a copy safely ──
  // A copy file is the one way outside data enters this app, and the app
  // renders stored text as HTML (innerHTML throughout). So everything read
  // from a copy is cleaned first — and a genuine copy is never refused:
  //   - Text: a "<" that would open an HTML tag is stored as "&lt;". It shows
  //     the same ("</3" is still "</3"); a typed "<b>" now shows as typed.
  //   - Each field the app reads must have the type the app expects. Ids must
  //     be plain (they land in onclick="…('id')"), photos must be image data
  //     (img src), gift statuses must be known (class="…"). A record that
  //     fails is left out and the confirm step says so; the rest restores.
  //   - Keys that shadow built-ins (__proto__, toString…) are dropped.
  // Sinks were hardened too: names are escaped where they land in an HTML
  // attribute (letters.js, app.js), and getEntryStatus (bookings.js) only
  // returns known statuses. Cases: tests/keepsakes.test.mjs.
  var TAG_OPENER = /<(?=[a-zA-Z\/!?])/g;
  var PLAIN_ID = /^[A-Za-z0-9_-]+$/;
  var IMAGE_DATA_URL = /^data:image\/[a-z.+-]+;base64,[A-Za-z0-9+\/=]*$/;
  var GIFT_STATUSES = ['voucher-only', 'scheduled', 'completed'];

  // The fields the app reads from each record, and what each must be (a
  // field may be absent). Lenient on purpose, so a genuine record is never
  // left out — only what breaks the app or injects is refused:
  //   'plain'  — not an object or list (those crash the pages that print it)
  //   'id'     — a plain id (it lands in onclick="…('id')")
  //   'image'  — a data:image URL or '' (it lands in img src)
  //   'sealed' — base64 text that unseals (a sealed letter)
  //   'string|null' — the capsule's letter and moment, which get .replace()
  var JOURNAL_FIELDS = { id: 'id', timestamp: 'plain', date: 'plain', city: 'plain', day: 'plain',
                         prompt: 'plain', text: 'plain', photo: 'image' };
  var LETTER_FIELDS = { id: 'id', createdAt: 'plain', from: 'plain', recipient: 'plain', unlockDate: 'plain',
                        sealedText: 'sealed', sealed: 'plain', text: 'plain', isRead: 'plain' };
  var CAPSULE_FIELDS = { letter: 'string|null', favoritePlace: 'plain', bestMeal: 'plain', bestMoment: 'string|null',
                         locked: 'plain', lockUntil: 'plain', sealedAt: 'plain', snapshot: 'object|null' };
  var ACHIEVEMENT_FIELDS = { unlocked: 'plain', unlockedAt: 'plain' };
  var TAP_FIELDS = { type: 'plain', ts: 'plain', city: 'plain' };

  // One row per key Storage owns, in the order the confirm step lists them.
  //   clean — copy value → { value, left }: the value made safe (null if the
  //           part can't be read at all) and how many records were left out
  //   count — stored value → the figure Settings and the confirm step show
  //   merge — (phone, copy) → the combined value, add-only. Only called when
  //           both sides hold something (mergeValue covers the rest), and it
  //           returns `phone` itself when it adds nothing — planRestore uses
  //           that to skip keys with nothing to write.
  var PARTS = [
    { key: Storage.KEYS.journal,      label: 'Journal entries',      clean: cleanList(JOURNAL_FIELDS), count: countEntries,  merge: addMissingEntries },
    { key: Storage.KEYS.letters,      label: 'Letters',              clean: cleanList(LETTER_FIELDS),  count: countEntries,  merge: addMissingEntries },
    { key: Storage.KEYS.capsule,      label: 'Time capsule',         clean: cleanCapsule,              count: capsuleState,  merge: keepSealedCapsule },
    { key: Storage.KEYS.places,       label: 'Favorites',            clean: cleanPlaces,               count: countStarred,  merge: addMissingStars },
    { key: Storage.KEYS.achievements, label: 'Achievements',         clean: cleanMap(cleanAchievement), count: countUnlocked, merge: addMissingKeys },
    { key: Storage.KEYS.counters,     label: 'Trip stats',           clean: cleanCounters,             count: countTaps,     merge: addMissingTaps },
    { key: Storage.KEYS.bookings,     label: 'Booking checklist',    clean: cleanMap(cleanBooking),    count: countTicked,   merge: addMissingKeys },
    { key: Storage.KEYS.settings,     label: 'Names, dates & photo', clean: cleanSettings,             count: countFilled,   merge: fillEmptyFields }
  ];

  // A key Storage gains later without a row above is still saved, and is
  // restored only onto a phone that lacks it. The test suite fails until
  // the key gets a real row, so the gap can't go unnoticed.
  function partFor(key) {
    for (var i = 0; i < PARTS.length; i++) {
      if (PARTS[i].key === key) return PARTS[i];
    }
    return { key: key, label: key, clean: cleanAny, count: countPresent, merge: keepPhoneValue };
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
  function isPlainObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function isBuiltInName(key) { return key in Object.prototype; }   // __proto__, constructor, toString…

  // ── Cleaning (see "Reading a copy safely") ──
  function defuse(value) {
    if (typeof value === 'string') return value.replace(TAG_OPENER, '&lt;');
    if (Array.isArray(value)) return value.map(defuse);
    if (isPlainObject(value)) {
      var out = {};
      Object.keys(value).forEach(function(key) {
        if (!isBuiltInName(key)) out[key] = defuse(value[key]);
      });
      return out;
    }
    return value;
  }

  function fieldOk(type, value) {
    return type.split('|').some(function(t) {
      if (t === 'plain') return value === null || typeof value !== 'object';
      if (t === 'null') return value === null;
      if (t === 'object') return isPlainObject(value);
      if (t === 'id') return typeof value === 'string' && PLAIN_ID.test(value);
      if (t === 'image') return typeof value === 'string' && (value === '' || IMAGE_DATA_URL.test(value));
      if (t === 'sealed') return typeof value === 'string' && unsealOrNull(value) !== null;
      return typeof value === t;
    });
  }

  // One record made safe, or null when a field the app reads has the wrong
  // type (the record is left out). Fields the app doesn't read are kept.
  function cleanRecord(record, fields) {
    if (!isPlainObject(record)) return null;
    var out = {};
    var keys = Object.keys(record);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (isBuiltInName(key)) continue;
      var type = has(fields, key) ? fields[key] : null;
      if (type && !fieldOk(type, record[key])) return null;
      out[key] = type === 'sealed' ? resealDefused(record[key]) : defuse(record[key]);
    }
    return out;
  }

  // A sealed letter's text is checked unsealed: sealed again, defused.
  function resealDefused(sealed) {
    var text = unsealOrNull(sealed);
    var safe = defuse(text);
    return safe === text ? sealed : seal(safe);
  }

  function cleanList(fields) {
    return function(list) {
      if (!Array.isArray(list)) return { value: null, left: 'all' };
      var kept = [];
      list.forEach(function(entry) {
        var safe = cleanRecord(entry, fields);
        if (safe) kept.push(safe);
      });
      return { value: kept, left: list.length - kept.length };
    };
  }

  // Maps keyed by id (achievements, bookings): an entry needs a plain id and
  // a value cleanValue accepts (undefined = left out).
  function cleanMap(cleanValue) {
    return function(map) {
      if (!isPlainObject(map)) return { value: null, left: 'all' };
      var out = {};
      var left = 0;
      Object.keys(map).forEach(function(id) {
        var safe = isBuiltInName(id) || !PLAIN_ID.test(id) ? undefined : cleanValue(map[id]);
        if (safe === undefined) left++;
        else out[id] = safe;
      });
      return { value: out, left: left };
    };
  }

  function cleanAchievement(state) {
    var safe = cleanRecord(state, ACHIEVEMENT_FIELDS);
    return safe === null ? undefined : safe;
  }

  // A venue is ticked or not; a gift carries one of the three known statuses.
  function cleanBooking(state) {
    if (typeof state === 'boolean') return state;
    return isPlainObject(state) && GIFT_STATUSES.indexOf(state.status) !== -1 ? defuse(state) : undefined;
  }

  // The capsule is one record: if it can't be read whole, it is left out whole.
  function cleanCapsule(capsule) {
    var safe = cleanRecord(capsule, CAPSULE_FIELDS);
    return safe ? { value: safe, left: 0 } : { value: null, left: 'all' };
  }

  function cleanPlaces(places) {
    var ids = Array.isArray(places)   // legacy full-snapshot shape
      ? places.filter(function(p) { return isPlainObject(p) && p.saved === true; }).map(function(p) { return p.id; })
      : (isPlainObject(places) && Array.isArray(places.starred) ? places.starred : null);
    if (!ids) return { value: null, left: 'all' };
    var kept = ids.filter(function(id) { return typeof id === 'string' && PLAIN_ID.test(id); });
    return { value: { starred: kept }, left: ids.length - kept.length };
  }

  function cleanCounters(counters) {
    if (!isPlainObject(counters)) return { value: null, left: 'all' };
    var out = {};
    var left = 0;
    Object.keys(counters).forEach(function(key) {
      var value = counters[key];
      if (key === 'history') {
        var taps = cleanList(TAP_FIELDS)(value);
        if (taps.value) out.history = taps.value;
        left += taps.value ? taps.left : 1;
      } else if (!isBuiltInName(key) && Number.isInteger(value) && value >= 0) {   // taps come in ones
        out[key] = value;
      } else {
        left++;
      }
    });
    return { value: out, left: left };
  }

  function cleanSettings(settings) {
    if (!isPlainObject(settings)) return { value: null, left: 'all' };
    var out = {};
    var left = 0;
    Object.keys(settings).forEach(function(field) {
      var value = settings[field];
      var ok = !isBuiltInName(field) && typeof value === 'string' &&
        (field !== 'couplePhoto' || fieldOk('image', value));
      if (ok) out[field] = defuse(value);
      else left++;
    });
    return { value: out, left: left };
  }

  function cleanAny(value) { return { value: defuse(value), left: 0 }; }

  // ── Counting (what each part shows) ──
  function countEntries(list) { return Array.isArray(list) ? list.length : 0; }
  function capsuleState(capsule) { return capsule && capsule.locked ? 'sealed' : 'not sealed'; }
  function countStarred(places) { return starredIds(places).length; }
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

  // Ticked venues and tracked gifts; an unticked venue (false) doesn't count.
  function countTicked(state) {
    if (!state) return 0;
    return Object.keys(state).filter(function(id) {
      return state[id] === true || isPlainObject(state[id]);
    }).length;
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
    if (part.clean(phone).value === null) return phone;      // never touch bytes we can't read
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
    return entry && !isBlank(entry.id) ? 'id:' + entry.id : 'json:' + JSON.stringify(entry);
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

  // Names, dates & photo: fill each field that is blank here. A filled field
  // is never changed — except on a phone whose Settings are still exactly the
  // first-run seed (FIRST_RUN_SETTINGS, data-trip.js): app.js writes that on a
  // wiped phone before a restore can run, so there it isn't anything you
  // wrote. The seed values are the real ones (Hope, the wedding date), so a
  // single field matching is not enough; the whole of Settings must.
  function fillEmptyFields(phone, copy) {
    var untouched = isFirstRunSettings(phone);
    var fields = Object.keys(copy).filter(function(field) {
      var replaceable = isBlank(phone[field]) || (untouched && has(FIRST_RUN_SETTINGS, field));
      return replaceable && !isBlank(copy[field]) && copy[field] !== phone[field];
    });
    if (!fields.length) return phone;
    var merged = Object.assign({}, phone);
    fields.forEach(function(field) { merged[field] = copy[field]; });
    return merged;
  }

  // Every seed field holds its seed value and every other field is blank.
  function isFirstRunSettings(settings) {
    return Object.keys(FIRST_RUN_SETTINGS).every(function(field) {
      return settings[field] === FIRST_RUN_SETTINGS[field];
    }) && Object.keys(settings).every(function(field) {
      return has(FIRST_RUN_SETTINGS, field) || isBlank(settings[field]);
    });
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
  function unsealOrNull(text) {
    try { return decodeURIComponent(escape(atob(text))); } catch (e) { return null; }
  }

  function fileName() { return 'italy-keepsakes-' + localISODate() + '.json'; }

  // A copy file's text → { values, leftOut, savedAt } or { error }. Reads
  // only: nothing is written here. `values` holds every owned key, cleaned
  // (null where the copy has nothing usable); `leftOut` names the parts
  // that couldn't be read safely ("Letters (1)"). Keys the app doesn't own
  // are ignored, so a restore never writes them.
  function parseCopy(text) {
    var copy;
    try { copy = JSON.parse(text); } catch (e) { return { error: 'not-a-copy' }; }
    if (!isPlainObject(copy) || copy.app !== FORMAT.app || copy.kind !== FORMAT.kind || !isPlainObject(copy.keys)) {
      return { error: 'not-a-copy' };
    }
    if (copy.version !== FORMAT.version) return { error: 'other-version' };

    var values = {};
    var leftOut = [];
    try {
      ownedKeys().forEach(function(key) {
        var part = partFor(key);
        var raw = has(copy.keys, key) ? copy.keys[key] : null;
        if (raw === null) { values[key] = null; return; }
        if (key === Storage.KEYS.capsule && typeof raw === 'string') {
          var unsealed = unsealOrNull(raw);
          try { raw = unsealed === null ? undefined : JSON.parse(unsealed); } catch (e) { raw = undefined; }
        }
        var cleaned = raw === undefined ? { value: null, left: 'all' } : part.clean(raw);
        values[key] = cleaned.value;
        if (cleaned.left) leftOut.push(cleaned.left === 'all' ? part.label : part.label + ' (' + cleaned.left + ')');
      });
    } catch (e) {
      // Cleaning recurses; an absurdly deep file can overflow the stack. Say
      // so instead of leaving the button looking dead.
      return { error: 'unreadable' };
    }
    return { values: values, leftOut: leftOut, savedAt: copy.savedAt };
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

  // Plan against the phone as it is NOW, then write. The confirm step's plan
  // can be stale (another tab may have saved since), and re-planning keeps the
  // add-only promise whatever happened in between.
  function restoreValues(copyValues) {
    var plan = planRestore(Storage.readAllKeys(), copyValues);
    Storage.writeKeys(plan.writes);
    return plan;
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
  // localStorage holds a few MB at most, so a far bigger file isn't a copy
  // (a video picked by mistake) — and reading it whole could stall the phone.
  var MAX_COPY_BYTES = 20 * 1024 * 1024;

  var pending = null;   // the parsed copy the confirm step showed

  var ERRORS = {
    'not-a-copy':    'That isn\'t a keepsakes copy',
    'other-version': 'That copy is from another app version',
    'too-big':       'That file is too big to be a copy',
    'unreadable':    'Couldn\'t read that file'
  };

  function chooseFile() {
    document.getElementById('keepsakes-file').click();
  }

  function handleFile(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    if (file.size > MAX_COPY_BYTES) { input.value = ''; showToast(ERRORS['too-big']); return; }
    var reader = new FileReader();
    reader.onload = function() { showRestore(parseCopy(String(reader.result))); };
    reader.onerror = function() { showToast(ERRORS.unreadable); };
    // Cleared once read, so picking the same file again still fires onchange
    reader.onloadend = function() { input.value = ''; };
    reader.readAsText(file);
  }

  function showRestore(parsed) {
    if (parsed.error) { showToast(ERRORS[parsed.error]); return; }
    var plan = planRestore(Storage.readAllKeys(), parsed.values);
    pending = plan.changed ? parsed : null;

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
    var title = plan.changed ? 'Restore from this copy?'
      : (parsed.leftOut.length ? 'Nothing new to restore' : 'Already on this phone');
    var note = plan.changed
      ? 'Restoring only adds what\'s missing. Nothing you wrote on this phone is changed or removed.'
      : 'Everything ' + (parsed.leftOut.length ? 'else ' : '') + 'in this copy is already here.';
    // Labels and counts only: nothing from the file reaches this HTML
    var leftOut = parsed.leftOut.length
      ? '<p class="keepsakes-note keepsakes-leftout">Left out, couldn\'t be read safely: ' + parsed.leftOut.join(', ') + '.</p>'
      : '';
    var buttons = plan.changed
      ? '<button class="btn btn-ghost btn-full" onclick="Keepsakes.cancelRestore()">Cancel</button>' +
        '<button class="btn btn-primary btn-full" onclick="Keepsakes.confirmRestore()">Restore</button>'
      : '<button class="btn btn-primary btn-full" onclick="Keepsakes.cancelRestore()">Close</button>';

    document.getElementById('surprise-content').innerHTML =
      '<div class="keepsakes-modal-head">' +
      '<div class="modal-icon-md">💝</div>' +
      '<h2>' + title + '</h2>' +
      '<div class="modal-meta">' + savedLine + '</div>' +
      '</div>' +
      '<table class="keepsakes-table">' +
      '<tr class="keepsakes-head"><td></td><td class="keepsakes-num">Now</td><td></td><td class="keepsakes-num">After</td></tr>' +
      rows +
      '</table>' +
      '<p class="keepsakes-note">' + note + '</p>' +
      leftOut +
      '<div class="keepsakes-actions">' + buttons + '</div>';
    openModal('surprise-modal');
  }

  function confirmRestore() {
    var parsed = pending;
    pending = null;
    closeModal('surprise-modal');
    if (!parsed) return;
    try {
      restoreValues(parsed.values);
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
    restoreValues: restoreValues,
    summary: summary,
    fileName: fileName
  };
})();
