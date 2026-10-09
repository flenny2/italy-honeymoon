// tests/keepsakes.test.mjs — the rules behind Settings → "Save a copy" and
// "Restore from a copy" (js/keepsakes.js, Storage.readAllKeys/writeKeys).
//
// Run from the repo root:   node --test
// No installs. The app's own scripts load into a sandbox the way index.html
// runs them (plain scripts sharing one scope), over an in-memory stand-in
// for the phone's localStorage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { keepsakeSeed, CAPSULE_SECRET } from './keepsakes-fixture.mjs';

// index.html order: data before storage, helpers before bookings
const SCRIPTS = ['js/data-trip.js', 'js/storage.js', 'js/helpers.js', 'js/bookings.js', 'js/keepsakes.js'];
const SOURCES = SCRIPTS.map((file) => [file, readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')]);

// localStorage in memory. With `quota` (characters) set, setItem throws the
// way a full phone does.
function fakeLocalStorage(quota = Infinity) {
  const items = new Map();
  const used = () => [...items].reduce((n, [key, value]) => n + key.length + value.length, 0);
  return {
    items,
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem(key, value) {
      value = String(value);
      const old = items.has(key) ? key.length + items.get(key).length : 0;
      if (used() - old + key.length + value.length > quota) {
        throw Object.assign(new Error('The quota has been exceeded.'), { name: 'QuotaExceededError' });
      }
      items.set(key, value);
    },
    removeItem: (key) => { items.delete(key); },
  };
}

// A phone: the app's scripts over a localStorage holding `values`
// (storage key → value, stored the way the app stores it).
function phone(values = {}, quota) {
  const localStorage = fakeLocalStorage(quota);
  for (const [key, value] of Object.entries(values)) localStorage.setItem(key, JSON.stringify(value));
  const sandbox = createContext({ localStorage, btoa, atob, console });
  for (const [file, source] of SOURCES) runInContext(source, sandbox, { filename: file });
  return {
    localStorage, sandbox,
    Storage: sandbox.Storage, Keepsakes: sandbox.Keepsakes,
    get: (name) => runInContext(name, sandbox),   // a top-level const, e.g. FIRST_RUN_SETTINGS
  };
}

// Sandbox objects carry the sandbox's prototypes, which deepStrictEqual
// counts as a difference; compare through JSON.
const plain = (value) => JSON.parse(JSON.stringify(value));
const SAVED_AT = Date.parse('2026-10-09T09:00:00-07:00');

// The text of the file "Save a copy" makes on a phone holding `values`.
function savedCopy(values) {
  const { Storage, Keepsakes } = phone(values);
  return JSON.stringify(Keepsakes.buildCopy(Storage.readAllKeys(), SAVED_AT), null, 2);
}

// Restore `fileText` onto phone `p` the way confirmRestore does.
function restore(p, fileText) {
  const parsed = p.Keepsakes.parseCopy(fileText);
  assert.equal(parsed.error, undefined, `copy refused: ${parsed.error}`);
  const plan = p.Keepsakes.restoreValues(parsed.values);
  return Object.assign(plan, { leftOut: plain(parsed.leftOut) });
}

// A wiped phone by the time Settings opens: app.js has written the seed.
function seededPhone(quota) {
  const p = phone({}, quota);
  p.Storage.saveSettings(p.get('FIRST_RUN_SETTINGS'));
  return p;
}

// The confirm step's table: label → [now, after]
const rowsOf = (plan) => Object.fromEntries(plan.rows.map((row) => [row.label, [row.before, row.after]]));
const stored = (p, key) => JSON.parse(p.localStorage.getItem(key));
const snapshot = (p) => new Map(p.localStorage.items);

// Every stored string that would open an HTML tag once rendered (sealed
// letters are checked unsealed).
const TAG = /<[a-zA-Z\/!?]/;
function tagsIn(value, field = '') {
  if (typeof value === 'string') {
    const text = field === 'sealedText' ? Buffer.from(value, 'base64').toString('utf8') : value;
    return TAG.test(text) ? [text] : [];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) => tagsIn(v, Array.isArray(value) ? field : key));
  }
  return [];
}

const SEED = keepsakeSeed();
const OWNED = Object.values(phone().Storage.KEYS).sort();

// ── What a copy holds ──

test('a copy holds every key the app owns, and nothing else', () => {
  const p = phone(SEED);
  p.localStorage.setItem('some-other-app', '"not ours"');
  const copy = plain(p.Keepsakes.buildCopy(p.Storage.readAllKeys(), SAVED_AT));
  assert.equal(OWNED.length, 8);
  assert.deepEqual(Object.keys(copy.keys).sort(), OWNED);
  assert.deepEqual([copy.app, copy.kind, copy.version, copy.savedAt], ['italy-honeymoon', 'keepsakes', 1, SAVED_AT]);
  for (const key of OWNED.filter((k) => k !== 'italy-capsule-v1')) assert.deepEqual(copy.keys[key], SEED[key], key);
});

test('every key the app owns has a restore rule', () => {
  // A key added to Storage later must get a row in Keepsakes' PARTS.
  assert.deepEqual(plain(phone().Keepsakes.PARTS.map((part) => part.key)).sort(), OWNED);
});

test('a key never written is saved as null and restores as nothing', () => {
  const p = phone({ 'italy-journal-v1': SEED['italy-journal-v1'] });
  const copy = plain(p.Keepsakes.buildCopy(p.Storage.readAllKeys(), SAVED_AT));
  assert.equal(copy.keys['italy-letters-v1'], null);
  assert.equal(copy.keys['italy-capsule-v1'], null);
  const empty = phone();
  const plan = restore(empty, JSON.stringify(copy));
  assert.deepEqual(Object.keys(plan.writes), ['italy-journal-v1']);
  assert.equal(empty.localStorage.getItem('italy-letters-v1'), null);
});

test('the time capsule stays sealed inside the file', () => {
  const text = savedCopy(SEED);
  assert.ok(!text.includes(CAPSULE_SECRET), 'capsule words are readable in the file');
  assert.equal(typeof JSON.parse(text).keys['italy-capsule-v1'], 'string');
  const parsed = phone().Keepsakes.parseCopy(text);
  assert.deepEqual(plain(parsed.values['italy-capsule-v1']), SEED['italy-capsule-v1']);
});

// ── Restoring: wiped phones ──

test('wiped phone: restore brings every key back byte for byte', () => {
  const original = phone(SEED);
  const wiped = phone();
  const plan = restore(wiped, savedCopy(SEED));
  for (const key of OWNED) assert.equal(wiped.localStorage.getItem(key), original.localStorage.getItem(key), key);
  assert.deepEqual(plan.leftOut, []);
  assert.deepEqual(rowsOf(plan), {
    'Journal entries': [0, 3],
    'Letters': [0, 2],
    'Time capsule': ['not sealed', 'sealed'],
    'Favorites': [0, 3],
    'Achievements': [0, 3],
    'Trip stats': [0, 4],
    'Booking checklist': [0, 3],
    'Names, dates & photo': [0, 7],
  });
});

test('wiped phone after first launch: the copy\'s own names, photo and pet name come back', () => {
  // app.js seeds Settings on first launch, before Settings can be opened, so
  // a seeded field counts as blank (the fixture's names differ from the seed).
  const p = seededPhone();
  const plan = restore(p, savedCopy(SEED));
  assert.equal(p.localStorage.getItem('italy-settings-v1'), phone(SEED).localStorage.getItem('italy-settings-v1'));
  assert.deepEqual(rowsOf(plan)['Names, dates & photo'], [5, 7]);
});

test('names, dates & photo: once Settings has been touched, only blank fields fill', () => {
  const p = seededPhone();
  p.Storage.saveSettings({ hometown: 'Anaheim, CA' });   // typed on this phone
  restore(p, savedCopy(SEED));
  const settings = stored(p, 'italy-settings-v1');
  assert.equal(settings.hometown, 'Anaheim, CA');
  assert.equal(settings.userName, 'Dylan');                // equals the seed, but Settings were touched
  assert.equal(settings.petName, 'amore');                 // was blank
  assert.equal(settings.couplePhoto, SEED['italy-settings-v1'].couplePhoto);
});

test('a name kept on purpose is never overwritten, even when it equals the seed', () => {
  // The seed values are the real ones (Hope, the wedding date): matching the
  // seed field by field must not make a field look blank.
  const p = seededPhone();
  p.Storage.saveSettings({ petName: 'tesoro' });          // he has used Settings
  restore(p, savedCopy(SEED));                             // the copy says 'Hopie'
  assert.equal(stored(p, 'italy-settings-v1').partnerName, 'Hope');
});

// ── Restoring: phones that already hold things ──

test('newer phone, older copy: nothing on the phone changes', () => {
  const older = keepsakeSeed();
  const newer = structuredClone(older);
  newer['italy-journal-v1'].push({ date: '2026-07-04', city: '', day: null, prompt: 'Home again.',
    text: 'Unpacked, still dreaming in Italian.', id: 'j-1783180800000', timestamp: 1783180800000 });
  Object.assign(newer['italy-letters-v1'][0], { text: 'opened early', isRead: true });
  newer['italy-settings-v1'].petName = 'tesoro';
  newer['italy-counters-v1'].gelato = 3;
  newer['italy-counters-v1'].history.push({ type: 'gelato', ts: 1783180900000, city: '' });
  newer['italy-bookings-v1']['bk-pantheon'] = false;

  const p = phone(newer);
  const before = snapshot(p);
  const plan = restore(p, savedCopy(older));
  assert.equal(plan.changed, false);
  assert.deepEqual(snapshot(p), before);
  assert.deepEqual(rowsOf(plan)['Journal entries'], [4, 4]);
});

test('restoring the same copy twice changes nothing the second time', () => {
  const p = seededPhone();
  restore(p, savedCopy(SEED));
  const before = snapshot(p);
  assert.equal(restore(p, savedCopy(SEED)).changed, false);
  assert.deepEqual(snapshot(p), before);
});

test('restore plans again at the moment it writes: an entry saved after the file was picked survives', () => {
  // Two tabs: the confirm is open in one while the other saves an entry.
  const p = phone();
  const parsed = p.Keepsakes.parseCopy(savedCopy(SEED));
  p.Storage.saveJournalEntry({ text: 'written in the other tab', id: 'j-other', timestamp: 1 });
  p.Keepsakes.restoreValues(parsed.values);
  const ids = stored(p, 'italy-journal-v1').map((e) => e.id);
  assert.ok(ids.includes('j-other'), 'the newer entry was overwritten');
  assert.equal(ids.length, 4);
});

test('two phones: restore adds the copy\'s extras and keeps everything here', () => {
  const base = keepsakeSeed();
  const mine = structuredClone(base);
  const hers = structuredClone(base);
  mine['italy-journal-v1'].push({ text: 'mine', id: 'j-1', timestamp: 1 });
  hers['italy-journal-v1'].push({ text: 'hers', id: 'j-2', timestamp: 2 });
  hers['italy-letters-v1'].push({ from: 'Hope', recipient: 'Dylan', unlockDate: '2027-06-27', id: 'letter-9', createdAt: 9, sealedText: 'eA==', sealed: true });
  mine['italy-places-v3'].starred.push('g1');
  hers['italy-places-v3'].starred.push('g2');
  hers['italy-achievements-v1']['trevi-coin'] = { unlocked: true, unlockedAt: 5 };      // same id, other time
  hers['italy-achievements-v1']['duomo-steps'] = { unlocked: true, unlockedAt: 6 };
  hers['italy-counters-v1'].wine = 2;
  hers['italy-counters-v1'].history.push({ type: 'wine', ts: 7, city: 'Venice' });
  hers['italy-bookings-v1']['bk-vatican'] = true;

  const p = phone(mine);
  const plan = restore(p, savedCopy(hers));
  assert.deepEqual(stored(p, 'italy-journal-v1').map((e) => e.id).slice(-2), ['j-1', 'j-2']);
  assert.equal(stored(p, 'italy-letters-v1').length, 3);
  assert.deepEqual(stored(p, 'italy-places-v3').starred, ['l1', 'r1', 'f9', 'g1', 'g2']);
  assert.deepEqual(stored(p, 'italy-achievements-v1')['trevi-coin'], mine['italy-achievements-v1']['trevi-coin']);
  assert.ok(stored(p, 'italy-achievements-v1')['duomo-steps'].unlocked);
  assert.equal(stored(p, 'italy-counters-v1').wine, 2);
  assert.equal(stored(p, 'italy-counters-v1').history.length, 5);
  assert.equal(stored(p, 'italy-bookings-v1')['bk-vatican'], true);
  assert.deepEqual(rowsOf(plan)['Journal entries'], [4, 5]);
});

test('an entry on both sides keeps the phone\'s version', () => {
  const copyValues = keepsakeSeed();
  copyValues['italy-journal-v1'][0].text = 'an older draft';
  copyValues['italy-letters-v1'][1] = { ...copyValues['italy-letters-v1'][1], isRead: false };
  const p = phone(SEED);
  assert.equal(restore(p, savedCopy(copyValues)).changed, false);
  assert.equal(stored(p, 'italy-journal-v1')[0].text, SEED['italy-journal-v1'][0].text);
  assert.equal(stored(p, 'italy-letters-v1')[1].isRead, true);
});

test('time capsule: one sealed here is never replaced; an empty one takes the copy\'s', () => {
  const other = { ...SEED['italy-capsule-v1'], letter: 'a different capsule', sealedAt: 1 };
  const sealedHere = phone({ 'italy-capsule-v1': other });
  restore(sealedHere, savedCopy(SEED));
  assert.equal(stored(sealedHere, 'italy-capsule-v1').letter, 'a different capsule');

  const unsealedHere = phone({ 'italy-capsule-v1': { locked: false, lockUntil: null, snapshot: null } });
  const plan = restore(unsealedHere, savedCopy(SEED));
  assert.deepEqual(stored(unsealedHere, 'italy-capsule-v1'), SEED['italy-capsule-v1']);
  assert.deepEqual(rowsOf(plan)['Time capsule'], ['not sealed', 'sealed']);
});

test('trip stats: taps join up and no count ever goes down', () => {
  const p = phone({ 'italy-counters-v1': { gelato: 5, pasta: 0, pizza: 0, espresso: 0, cappuccino: 0, wine: 0, history: [] } });
  restore(p, savedCopy(SEED));
  const counters = stored(p, 'italy-counters-v1');
  assert.equal(counters.gelato, 5);          // the phone's 5 beats the copy's 2
  assert.equal(counters.wine, 1);            // the copy's tap came in
  assert.equal(counters.history.length, 4);
});

test('restore only adds: a star removed since the copy comes back, and the count says so', () => {
  const p = phone({ 'italy-places-v3': { starred: ['l1', 'r1'] } });
  const plan = restore(p, savedCopy(SEED));
  assert.deepEqual(stored(p, 'italy-places-v3').starred, ['l1', 'r1', 'f9']);
  assert.deepEqual(rowsOf(plan)['Favorites'], [2, 3]);
});

test('favorites: the old full-list shape on the phone still merges', () => {
  const legacy = [{ id: 'l1', saved: true, name: 'Colosseum' }, { id: 'g1', saved: false }];
  const p = phone({ 'italy-places-v3': legacy });
  restore(p, savedCopy(SEED));
  assert.deepEqual(stored(p, 'italy-places-v3'), { starred: ['l1', 'r1', 'f9'] });
});

test('trip stats: a count that isn\'t a whole number is left out', () => {
  const p = phone();
  const plan = restore(p, savedCopy({ 'italy-counters-v1': { ...SEED['italy-counters-v1'], pasta: 1.5 } }));
  assert.deepEqual(plan.leftOut, ['Trip stats (1)']);
  assert.ok(!('pasta' in stored(p, 'italy-counters-v1')));
});

test('the booking checklist counts ticked items, not unticked ones', () => {
  const p = phone();
  const plan = restore(p, savedCopy({ 'italy-bookings-v1': { 'bk-a': false, 'bk-b': false, 'bk-c': true } }));
  assert.deepEqual(rowsOf(plan)['Booking checklist'], [0, 1]);
});

// ── Files that are not genuine copies ──

test('files that are not keepsakes copies are refused', () => {
  const { Keepsakes } = phone();
  const good = JSON.parse(savedCopy(SEED));
  const cases = [
    ['not JSON at all', 'hello', 'not-a-copy'],
    ['some other JSON file', '{"name":"Italy Honeymoon","display":"standalone"}', 'not-a-copy'],
    ['keys is a list', { ...good, keys: [] }, 'not-a-copy'],
    ['a future format', { ...good, version: 2 }, 'other-version'],
  ];
  for (const [name, input, error] of cases) {
    assert.equal(Keepsakes.parseCopy(typeof input === 'string' ? input : JSON.stringify(input)).error, error, name);
  }
});

test('a damaged part is left out and named; the rest still restores', () => {
  const good = JSON.parse(savedCopy(SEED));
  const letter = good.keys['italy-letters-v1'][0];
  const damaged = { ...good, keys: { ...good.keys,
    'italy-journal-v1': 'oops',
    'italy-letters-v1': [1, letter],
    'italy-capsule-v1': '%%%',
    'italy-settings-v1': [] } };
  const p = phone();
  const plan = restore(p, JSON.stringify(damaged));
  assert.deepEqual(plan.leftOut, ['Journal entries', 'Letters (1)', 'Time capsule', 'Names, dates & photo']);
  assert.deepEqual(stored(p, 'italy-letters-v1'), [letter]);
  assert.deepEqual(stored(p, 'italy-places-v3'), SEED['italy-places-v3']);
  assert.equal(p.localStorage.getItem('italy-journal-v1'), null);
});

test('a copy carrying markup restores with it defused: nothing it holds can run', () => {
  // Each line is an attack the 2026-10-09 cold read tried; the app renders
  // stored text as HTML, so any of these, stored as-is, would run as code.
  const values = structuredClone(SEED);
  values['italy-journal-v1'][0].text = 'hi <img src=x onerror=alert(1)>';
  values['italy-journal-v1'].push({ text: { toString: 1 }, id: 'j-crash', timestamp: 3 });       // crashes the page
  values['italy-journal-v1'].push({ text: 'x', photo: 'x" onerror="alert(1)', id: 'j-src', timestamp: 4 });
  values['italy-letters-v1'][0].sealedText = Buffer.from('<script>alert(1)</script>').toString('base64');
  values['italy-letters-v1'].push({ ...SEED['italy-letters-v1'][1], id: "x');alert(1);('" });     // breaks onclick
  values['italy-letters-v1'].push({ ...SEED['italy-letters-v1'][1], id: { toString: 'x' } });
  values['italy-letters-v1'].push({ ...SEED['italy-letters-v1'][1], id: 'letter-bad', sealedText: '%%%' });
  values['italy-capsule-v1'].bestMeal = '<svg onload=alert(1)>';
  values['italy-counters-v1'].history[0].city = '</div><b>';
  values['italy-bookings-v1']['gift-2'] = { status: 'x" onanimationstart="alert(1)' };             // class="…"
  values['italy-settings-v1'].userName = 'D&lt;img src=x onerror=alert(1)&gt;';                    // value="…"
  values['italy-settings-v1'].partnerName = 'H" autofocus onfocus="alert(1)';
  const copy = JSON.parse(savedCopy(values));
  copy.keys['italy-achievements-v1'] = JSON.parse('{"__proto__":{"unlocked":true,"unlockedAt":1},' +
    JSON.stringify(SEED['italy-achievements-v1']).slice(1));

  const p = phone();
  const plan = restore(p, JSON.stringify(copy));
  assert.deepEqual(plan.leftOut, ['Journal entries (2)', 'Letters (3)', 'Achievements (1)', 'Booking checklist (1)']);
  const everything = Object.fromEntries(OWNED.map((key) => [key, stored(p, key)]));
  assert.deepEqual(tagsIn(everything), [], 'a tag survived the restore');
  assert.equal(stored(p, 'italy-journal-v1')[0].text, 'hi &lt;img src=x onerror=alert(1)>');
  assert.ok(!('gift-2' in stored(p, 'italy-bookings-v1')));
  assert.equal(Object.getPrototypeOf(stored(p, 'italy-achievements-v1')), Object.prototype);
  // Names stay as written: they are escaped where they land in an attribute.
  assert.equal(stored(p, 'italy-settings-v1').partnerName, 'H" autofocus onfocus="alert(1)');
});

test('"<3" and quotes come back exactly; "</3" and "<b>" come back looking the same', () => {
  const values = structuredClone(SEED);
  values['italy-journal-v1'][0].text = 'I <3 you, "amore" - 5 > 4 & always';
  values['italy-journal-v1'][1].text = 'Last night in Venice </3 <b>ciao</b>';
  values['italy-letters-v1'][0].sealedText = Buffer.from('Ti amo <3 </3').toString('base64');
  const p = phone();
  const plan = restore(p, savedCopy(values));
  assert.deepEqual(plan.leftOut, []);
  const journal = stored(p, 'italy-journal-v1');
  assert.equal(journal[0].text, 'I <3 you, "amore" - 5 > 4 & always');
  assert.equal(journal[1].text, 'Last night in Venice &lt;/3 &lt;b>ciao&lt;/b>');   // innerHTML shows "</3 <b>ciao</b>"
  assert.equal(Buffer.from(stored(p, 'italy-letters-v1')[0].sealedText, 'base64').toString('utf8'), 'Ti amo <3 &lt;/3');
});

test('an absurdly deep file ends in a message, not a dead button', () => {
  const copy = JSON.parse(savedCopy(SEED));
  const deep = '['.repeat(200000) + ']'.repeat(200000);
  const text = JSON.stringify(copy).replace('"text":"The Colosseum', `"extra":${deep},"text":"The Colosseum`);
  assert.equal(phone().Keepsakes.parseCopy(text).error, 'unreadable');
});

test('a gift status the app doesn\'t know never reaches the page', () => {
  // Defence behind the restore: getEntryStatus only returns the known three.
  const p = phone();
  p.Storage.saveBookings({ 'gift-1': { status: 'x" onanimationstart="alert(1)' } });
  const gift = p.sandbox.getAllEntries().find((entry) => entry.id === 'gift-1');
  assert.ok(['voucher-only', 'scheduled', 'completed'].includes(p.sandbox.getEntryStatus(gift)));
});

test('a key the app does not own is never written', () => {
  const copy = JSON.parse(savedCopy(SEED));
  copy.keys['someone-elses-key'] = { hello: true };
  const p = phone();
  restore(p, JSON.stringify(copy));
  assert.equal(p.localStorage.getItem('someone-elses-key'), null);
});

// ── A full phone ──

test('a full phone: the restore lands whole or not at all', () => {
  const start = { 'italy-journal-v1': [SEED['italy-journal-v1'][0]] };
  const text = savedCopy(SEED);

  // Find a quota that fits the first writes but not all of them, so the
  // rollback has real work to undo.
  const probe = phone(start);
  const plan = probe.Keepsakes.planRestore(probe.Storage.readAllKeys(), probe.Keepsakes.parseCopy(text).values);
  const keys = Object.keys(plan.writes);
  const sizes = keys.map((key) => key.length + JSON.stringify(plan.writes[key]).length);
  const startSize = [...probe.localStorage.items].reduce((n, [k, v]) => n + k.length + v.length, 0);
  const journalOld = 'italy-journal-v1'.length + probe.localStorage.getItem('italy-journal-v1').length;
  const quota = startSize - journalOld + sizes[0] + sizes[1] + 10;   // room for 2 of the writes

  const full = phone(start, quota);
  const before = snapshot(full);
  const parsed = full.Keepsakes.parseCopy(text);
  assert.throws(() => full.Keepsakes.restoreValues(parsed.values), { name: 'QuotaExceededError' });
  assert.deepEqual(snapshot(full), before);
  assert.ok(keys.length > 2, 'the test needs a write to fail after two succeed');
});

test('a full phone, even when a write shrank a key first: everything goes back', () => {
  // The phone still holds the old full favorites list; the restore shrinks it
  // to starred ids, adds achievements, then the big photo won't fit.
  const legacy = Array.from({ length: 40 }, (_, i) => ({ id: `p${i}`, saved: i === 0, name: 'x'.repeat(120) }));
  const start = { 'italy-places-v3': legacy };
  const copyValues = {
    'italy-places-v3': { starred: ['p1'] },
    'italy-achievements-v1': SEED['italy-achievements-v1'],
    'italy-settings-v1': { ...SEED['italy-settings-v1'], couplePhoto: 'data:image/jpeg;base64,' + 'A'.repeat(9000) },
  };
  const probe = phone(start);
  const used = [...probe.localStorage.items].reduce((n, [k, v]) => n + k.length + v.length, 0);
  const full = phone(start, used + 10);
  const before = snapshot(full);
  const parsed = full.Keepsakes.parseCopy(savedCopy(copyValues));
  assert.throws(() => full.Keepsakes.restoreValues(parsed.values), { name: 'QuotaExceededError' });
  assert.deepEqual(snapshot(full), before);
});

// ── Small things the card shows ──

test('the line on Settings counts what is on this phone', () => {
  const { Keepsakes } = phone();
  assert.equal(Keepsakes.summary({}), '0 journal entries · 0 letters · capsule not sealed');
  assert.equal(Keepsakes.summary(SEED), '3 journal entries · 2 letters · capsule sealed');
  assert.equal(Keepsakes.summary({ 'italy-journal-v1': [{}], 'italy-letters-v1': [{}] }),
    '1 journal entry · 1 letter · capsule not sealed');
});

test('the file is named by the local date', () => {
  const name = phone().Keepsakes.fileName();
  const now = new Date();
  const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
  assert.equal(name, `italy-keepsakes-${today}.json`);
});
