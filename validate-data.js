#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// validate-data.js — data-invariant checker for the Italy honeymoon PWA.
//
// Run from repo root:   node validate-data.js
//
// MANUAL tool — not wired into Netlify, git hooks, or the service worker. It
// loads the browser-global data modules (js/data-*.js, js/hero-images.js,
// js/bookings.js) by reading their source text and evaluating it once in a
// fresh vm context — these files declare top-level const/var globals and call
// nothing at load time, so they evaluate cleanly in Node. Bindings are captured
// with a trailing expression appended to the SAME concatenated source.
//
// SEVERITY:
//   ERROR   (exit 1) — a real contradiction or silent functional failure:
//                      cross-file DATE disagreement, broken placeId/linkedPlaces
//                      ref, schema drift, invalid verdict key, bad coords/dates,
//                      scheduled_date/scheduled_time pairing violations, and any
//                      date/time conflict between a date-anchored place and the
//                      gift/booking that references it.
//   WARNING (exit 0) — a gap or judgment call: asset/precache gaps (PWA icons,
//                      dead hero images), time disagreement on an UNanchored
//                      place, explicit-timed booking with no place anchor,
//                      missing source / editorial field, stale place count.
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;

// ── result collectors ──────────────────────────────────────────────────────
const errors = [];
const warnings = [];
function err(check, msg) { errors.push({ check, msg }); }
function warn(check, msg) { warnings.push({ check, msg }); }

// ── helpers ─────────────────────────────────────────────────────────────────
function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function exists(rel) {
  const clean = rel.replace(/^\//, ''); // '/img/x' and 'img/x' both resolve from root
  return fs.existsSync(path.join(ROOT, clean));
}
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
function isFiniteNum(n) { return typeof n === 'number' && Number.isFinite(n); }

// ── load the data globals via a single concatenated vm eval ──────────────────
// Order mirrors index.html's <script> order so any cross-file reference resolves.
// No DOM/Storage stubs: top-level eval only declares consts + function bodies;
// nothing that touches document/Storage is invoked here.
let data;
try {
  const dataFiles = [
    'js/data-places.js',
    'js/data-hotels.js',
    'js/data-trip.js',
    'js/data-today-plan.js',
    'js/hero-images.js',
    'js/bookings.js',
  ];
  let src = '';
  for (const f of dataFiles) src += '\n' + read(f);

  // Trailing expression: top-level const/var are in lexical scope here.
  src += '\n;({ DEFAULT_PLACES, TRIP, GIFTED_EXPERIENCES, VERDICTS, BOOKINGS, ' +
         'TODAY_PLAN, HERO_IMAGES })';

  data = vm.runInNewContext(src, vm.createContext({ console }), { filename: 'concat-data.js' });
} catch (e) {
  console.error('FATAL: could not load/evaluate data modules:', e && e.message);
  process.exit(1);
}

const {
  DEFAULT_PLACES, TRIP, GIFTED_EXPERIENCES, VERDICTS, BOOKINGS, TODAY_PLAN, HERO_IMAGES,
} = data;

// Bail loudly if a required global came back undefined (likely a rename).
for (const [name, val] of Object.entries({
  DEFAULT_PLACES, TRIP, GIFTED_EXPERIENCES, VERDICTS, BOOKINGS, TODAY_PLAN, HERO_IMAGES,
})) {
  if (val === undefined) {
    console.error(`FATAL: expected global "${name}" was undefined after eval — did it get renamed?`);
    process.exit(1);
  }
}

// Shared derived sets.
const placeById = new Map(DEFAULT_PLACES.map(p => [p.id, p]));
const placeIds = new Set(placeById.keys());
const verdictKeys = new Set(Object.keys(VERDICTS)); // 5 base keys
const HIDDEN_CATEGORIES = new Set(['transit', 'pharmacy', 'restroom']);

// ═══════════════════════════════════════════════════════════════════════════
// ERR 1 — every place.verdict (when present) is one of the 5 base VERDICTS keys
//          (no space-variants / display-only keys like 'nice-if-nearby').
// ═══════════════════════════════════════════════════════════════════════════
function check1_verdicts() {
  for (const p of DEFAULT_PLACES) {
    if (p.verdict == null) continue;
    if (!verdictKeys.has(p.verdict)) {
      err('verdict-key', `place ${p.id} (${p.name}): verdict "${p.verdict}" is not a base VERDICTS key ` +
        `(expected one of: ${[...verdictKeys].join(', ')})`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERR 2 — date consistency.
//   (a) TRIP.dayTrips Tuscany date == date cited in bk-antinori.when == t1/tr2 notes.
//   (b) every gift.date is '' or valid ISO within startDate..endDate.
//   (c) every gift.time is '' or HH:MM.
// ═══════════════════════════════════════════════════════════════════════════
function check2_dates() {
  // (a) cross-file Tuscany day-trip date.
  const tuscany = Object.entries(TRIP.dayTrips).find(([, v]) => /tuscany|chianti/i.test(v.label || ''));
  if (!tuscany) {
    err('date-tuscany', 'could not find a Tuscany/Chianti entry in TRIP.dayTrips');
  } else {
    const iso = tuscany[0];
    const monthDay = new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }); // "June 20"

    const antinori = BOOKINGS.find(b => b.id === 'bk-antinori');
    if (!antinori) {
      err('date-tuscany', 'bk-antinori not found in BOOKINGS');
    } else if (!String(antinori.when).includes(monthDay)) {
      err('date-tuscany', `bk-antinori.when ("${antinori.when}") disagrees with Tuscany day-trip date ${iso} ("${monthDay}")`);
    }
    for (const id of ['t1', 'tr2']) {
      const p = placeById.get(id);
      if (p && p.notes && /\bjune\b|\bjun\b/i.test(p.notes) && !p.notes.includes(monthDay)) {
        err('date-tuscany', `place ${id} notes cite a June date that disagrees with Tuscany day-trip "${monthDay}": ${JSON.stringify(p.notes)}`);
      }
    }
  }

  // (b)+(c) gift date/time validity + range.
  const { startDate: start, endDate: end } = TRIP;
  for (const g of GIFTED_EXPERIENCES) {
    if (g.date !== '' && g.date != null) {
      if (!ISO_RE.test(g.date)) {
        err('gift-date', `gift ${g.id}: date "${g.date}" is not '' or valid ISO yyyy-mm-dd`);
      } else if (g.date < start || g.date > end) {
        err('gift-date', `gift ${g.id}: date ${g.date} is outside trip window ${start}..${end}`);
      }
    }
    if (g.time !== '' && g.time != null && !TIME_RE.test(g.time)) {
      err('gift-time', `gift ${g.id}: time "${g.time}" is not '' or 24h HH:MM`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERR 3 — shape discipline.
//   - no BOOKINGS object carries source|date|time|bookingStatus (drift; inert).
//   - every gift: source==='registry-gift', valid bookingStatus, linkedPlaces array.
// ═══════════════════════════════════════════════════════════════════════════
function check3_shapes() {
  const forbidden = ['source', 'date', 'time', 'bookingStatus'];
  for (const b of BOOKINGS) {
    for (const k of forbidden) {
      if (Object.prototype.hasOwnProperty.call(b, k)) {
        err('booking-shape', `booking ${b.id} has forbidden key "${k}" ` +
          `(venues get source:'venue' injected by getAllEntries — it must not be stored, and date/time would be inert)`);
      }
    }
  }
  const GIFT_STATUS = new Set(['voucher-only', 'scheduled', 'completed']);
  for (const g of GIFTED_EXPERIENCES) {
    if (g.source !== 'registry-gift') {
      err('gift-shape', `gift ${g.id}: source is "${g.source}", expected 'registry-gift'`);
    }
    if (!GIFT_STATUS.has(g.bookingStatus)) {
      err('gift-shape', `gift ${g.id}: bookingStatus "${g.bookingStatus}" not in {voucher-only, scheduled, completed}`);
    }
    if (!Array.isArray(g.linkedPlaces)) {
      err('gift-shape', `gift ${g.id}: linkedPlaces is not an array (got ${typeof g.linkedPlaces})`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERR 4 — referential + geographic integrity.
//   - every BOOKINGS.placeId and every gift linkedPlaces id resolves to a place.
//   - every place lat/lng is finite and inside Italy's bbox (lat 35–47, lng 6–19).
// ═══════════════════════════════════════════════════════════════════════════
function check4_refs_and_coords() {
  for (const b of BOOKINGS) {
    if (b.placeId && !placeIds.has(b.placeId)) {
      err('booking-ref', `booking ${b.id}: placeId "${b.placeId}" is not a known place id`);
    }
  }
  for (const g of GIFTED_EXPERIENCES) {
    for (const pid of (g.linkedPlaces || [])) {
      if (!placeIds.has(pid)) {
        err('gift-ref', `gift ${g.id}: linkedPlaces id "${pid}" is not a known place id`);
      }
    }
  }
  for (const p of DEFAULT_PLACES) {
    if (!isFiniteNum(p.lat) || !isFiniteNum(p.lng)) {
      err('coords', `place ${p.id} (${p.name}): lat/lng not finite numbers (lat=${p.lat}, lng=${p.lng})`);
      continue;
    }
    if (p.lat < 35 || p.lat > 47 || p.lng < 6 || p.lng > 19) {
      err('coords', `place ${p.id} (${p.name}): coords (${p.lat}, ${p.lng}) outside Italy bbox (lat 35–47, lng 6–19)`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WARN 5 — asset / pre-cache integrity (filesystem-based). All findings WARN:
//   - every APP_FILES entry exists on disk.
//   - every <script src>/<link href> in index.html + every manifest.json icon
//     + every HERO_IMAGES file is listed in APP_FILES (else 404 offline).
//   - APP_FILES hero JPGs that no HERO_IMAGES slot references (dead weight).
// ═══════════════════════════════════════════════════════════════════════════
function check5_assets() {
  const swSrc = read('sw.js');
  const m = swSrc.match(/APP_FILES\s*=\s*\[([\s\S]*?)\]/);
  if (!m) { warn('appfiles', 'could not locate APP_FILES array literal in sw.js'); return; }
  const appFiles = [...m[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map(x => x[1] || x[2]);
  const appSet = new Set(appFiles);
  const inApp = ref => appSet.has(ref) || appSet.has(ref.startsWith('/') ? ref : '/' + ref);

  // (1) APP_FILES entries exist on disk ('/' maps to index.html).
  for (const f of appFiles) {
    if (f === '/') continue;
    if (!exists(f)) warn('appfiles', `APP_FILES lists "${f}" but no such file on disk`);
  }

  // (2) index.html local <script>/<link> refs must be precached.
  const html = read('index.html');
  const refs = new Set();
  for (const mm of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) refs.add(mm[1]);
  for (const mm of html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)) refs.add(mm[1]);
  for (const ref of refs) {
    if (/^https?:\/\//i.test(ref) || ref.startsWith('data:')) continue;
    if (!inApp(ref)) warn('appfiles', `index.html references "${ref}" but it is NOT in APP_FILES (404 offline)`);
  }

  // (2b) manifest.json icons must be precached (index.html only references the 192).
  try {
    const manifest = JSON.parse(read('manifest.json'));
    for (const icon of (manifest.icons || [])) {
      if (icon.src && !inApp(icon.src)) {
        warn('appfiles', `manifest.json icon "${icon.src}" is NOT in APP_FILES (404 offline on a cold install)`);
      }
    }
  } catch (e) {
    warn('appfiles', `could not read/parse manifest.json: ${e && e.message}`);
  }

  // (3) every HERO_IMAGES file must be precached under img/heroes/.
  const heroFiles = new Set(Object.values(HERO_IMAGES));
  for (const file of heroFiles) {
    if (!inApp('/img/heroes/' + file)) {
      warn('appfiles', `HERO_IMAGES uses "${file}" but "/img/heroes/${file}" is NOT in APP_FILES`);
    }
  }

  // (4) APP_FILES hero JPGs no HERO_IMAGES slot references (dead precache weight).
  for (const f of appFiles) {
    if (f.startsWith('/img/heroes/')) {
      const base = f.slice('/img/heroes/'.length);
      if (!heroFiles.has(base)) warn('appfiles-dead', `APP_FILES precaches "${f}" but no HERO_IMAGES slot references it (dead weight)`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6 — scheduled-time-of-day agreement.
//   For any place referenced by a SCHEDULED gift (via linkedPlaces) or by a
//   booking whose `when` carries an explicit HH:MM, flag if the place's own
//   scheduled_time disagrees. ERROR when the place is date-anchored to the
//   same day as the other source (both then feed Up Next — a live functional
//   contradiction); WARN when the place is unanchored (advisory only).
// ═══════════════════════════════════════════════════════════════════════════
function check6_scheduled_times() {
  for (const g of GIFTED_EXPERIENCES) {
    if (g.bookingStatus !== 'scheduled' || !TIME_RE.test(g.time || '')) continue;
    for (const pid of (g.linkedPlaces || [])) {
      const p = placeById.get(pid);
      if (p && p.scheduled_time && p.scheduled_time !== g.time) {
        const report = (p.scheduled_date && p.scheduled_date === g.date) ? err : warn;
        report('sched-time', `place ${pid} scheduled_time "${p.scheduled_time}" disagrees with scheduled gift ${g.id} time "${g.time}"`);
      }
    }
  }
  for (const b of BOOKINGS) {
    if (!b.placeId) continue;
    const p = placeById.get(b.placeId);
    if (!p || !p.scheduled_time) continue;
    const t = parseClock(b.when);
    if (t && t !== p.scheduled_time) {
      const report = (p.scheduled_date && p.scheduled_date === parseSingleDate(b.when)) ? err : warn;
      report('sched-time', `place ${b.placeId} scheduled_time "${p.scheduled_time}" disagrees with booking ${b.id} when-time "${t}" (from "${b.when}")`);
    }
  }
}

// Parse "HH:MM AM/PM" or "HH:MM" out of free text → 24h "HH:MM" or null.
function parseClock(s) {
  if (!s) return null;
  const m = String(s).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mer = m[3] && m[3].toUpperCase();
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + m[2];
}

// Parse a SINGLE explicit "Month D" out of free text → ISO in the trip's year,
// or null. Ranges ("June 18–21", "June 13–17 (dinner)") return null — a range
// is a window, not a date claim, so it can't contradict a scheduled_date.
const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};
function parseSingleDate(s) {
  if (!s) return null;
  if (/\d\s*[–—-]\s*\d/.test(String(s))) return null; // day range → not a single date
  const m = String(s).match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\b/i);
  if (!m) return null;
  const year = TRIP.startDate.slice(0, 4);
  const mo = String(MONTHS[m[1].toLowerCase()]).padStart(2, '0');
  return `${year}-${mo}-${String(parseInt(m[2], 10)).padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERR 8 — date anchors (scheduled_date/scheduled_time) on places.
//   - pairing rule: a place has BOTH scheduled_date and scheduled_time, or
//     NEITHER (a dateless time is exactly the ambiguity that produced the
//     phantom "Colosseum 09:00" on every Rome day).
//   - scheduled_date must be valid ISO and match a TRIP.schedule date.
//   - cross-source DATE agreement (ERROR — these all feed the Today screen):
//       booking.when single explicit date  vs  place.scheduled_date
//       gift.date                          vs  linked place.scheduled_date
//   - WARN: a booking with an explicit date+time whose place is unanchored —
//     legal (slot not confirmed yet), but it won't surface on Today, so flag
//     the missing handoff. (e.g. bk-antinori once a tasting time is booked.)
// ═══════════════════════════════════════════════════════════════════════════
function check8_date_anchors() {
  const scheduleDates = new Set(TRIP.schedule.map(s => s.date));
  for (const p of DEFAULT_PLACES) {
    const hasDate = p.scheduled_date != null && p.scheduled_date !== '';
    const hasTime = p.scheduled_time != null && p.scheduled_time !== '';
    if (hasDate !== hasTime) {
      err('anchor-pair', `place ${p.id} (${p.name}): scheduled_date and scheduled_time must travel together ` +
        `(date=${JSON.stringify(p.scheduled_date)}, time=${JSON.stringify(p.scheduled_time)})`);
    }
    if (hasDate) {
      if (!ISO_RE.test(p.scheduled_date)) {
        err('anchor-date', `place ${p.id}: scheduled_date "${p.scheduled_date}" is not ISO yyyy-mm-dd`);
      } else if (!scheduleDates.has(p.scheduled_date)) {
        err('anchor-date', `place ${p.id}: scheduled_date ${p.scheduled_date} is not a TRIP.schedule date`);
      }
    }
    if (hasTime && !TIME_RE.test(p.scheduled_time)) {
      err('anchor-time', `place ${p.id}: scheduled_time "${p.scheduled_time}" is not 24h HH:MM`);
    }
  }

  for (const b of BOOKINGS) {
    if (!b.placeId) continue;
    const p = placeById.get(b.placeId);
    if (!p) continue; // broken ref already reported by check4
    const iso = parseSingleDate(b.when);
    if (!iso) continue;
    if (p.scheduled_date) {
      if (p.scheduled_date !== iso) {
        err('anchor-date', `booking ${b.id}: when ("${b.when}") cites ${iso} but place ${b.placeId} ` +
          `scheduled_date is ${p.scheduled_date}`);
      }
    } else if (parseClock(b.when)) {
      warn('anchor-date', `booking ${b.id} carries an explicit date+time ("${b.when}") but place ${b.placeId} ` +
        `has no scheduled_date/scheduled_time anchor — it won't surface on Today's Plan / Up Next`);
    }
  }

  for (const g of GIFTED_EXPERIENCES) {
    if (!g.date) continue;
    for (const pid of (g.linkedPlaces || [])) {
      const p = placeById.get(pid);
      if (p && p.scheduled_date && p.scheduled_date !== g.date) {
        err('anchor-date', `gift ${g.id}: date ${g.date} disagrees with linked place ${pid} scheduled_date ${p.scheduled_date}`);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERR 9 — TRIP schedule integrity (guards the Day X / N counter).
//   schedule spans startDate..endDate with consecutive dates, day fields run
//   1..N with no gaps, totalDays === schedule.length, and every dayTrips key
//   is a schedule date.
// ═══════════════════════════════════════════════════════════════════════════
function check9_trip_integrity() {
  const s = TRIP.schedule;
  if (!Array.isArray(s) || !s.length) { err('trip', 'TRIP.schedule is empty'); return; }
  if (s[0].date !== TRIP.startDate) {
    err('trip', `schedule[0].date ${s[0].date} != TRIP.startDate ${TRIP.startDate}`);
  }
  if (s[s.length - 1].date !== TRIP.endDate) {
    err('trip', `last schedule date ${s[s.length - 1].date} != TRIP.endDate ${TRIP.endDate} ` +
      '(every trip date needs an entry or getTripPhase resolves a stale day)');
  }
  for (let i = 0; i < s.length; i++) {
    if (s[i].day !== i + 1) err('trip', `schedule[${i}].day is ${s[i].day}, expected ${i + 1}`);
    if (i > 0 && s[i].date !== nextISO(s[i - 1].date)) {
      err('trip', `schedule dates not consecutive: ${s[i - 1].date} → ${s[i].date}`);
    }
  }
  if (TRIP.totalDays !== s.length) {
    err('trip', `TRIP.totalDays ${TRIP.totalDays} != schedule length ${s.length} (Day X / N denominator drift)`);
  }
  const scheduleDates = new Set(s.map(e => e.date));
  for (const key of Object.keys(TRIP.dayTrips || {})) {
    if (!scheduleDates.has(key)) err('trip', `TRIP.dayTrips key ${key} is not a schedule date`);
  }
}

// ISO date + 1 day, via UTC arithmetic (TZ-independent).
function nextISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════════════
// WARN 7 — editorial completeness + stale header count.
//   - visible places (category not transit/pharmacy/restroom) missing a
//     non-empty honest_summary | verdict | best_for | source.
//   - "N curated places" header comment in data-places.js != actual count.
// ═══════════════════════════════════════════════════════════════════════════
function check7_completeness() {
  const isNonEmpty = v => typeof v === 'string' && v.trim().length > 0;
  for (const p of DEFAULT_PLACES) {
    if (HIDDEN_CATEGORIES.has(p.category)) continue;
    for (const field of ['honest_summary', 'verdict', 'best_for', 'source']) {
      if (!isNonEmpty(p[field])) {
        warn('completeness', `visible place ${p.id} (${p.name}) missing non-empty ${field}`);
      }
    }
  }
  const src = read('js/data-places.js');
  const cm = src.match(/(\d+)\s+curated places/i);
  if (cm) {
    const declared = parseInt(cm[1], 10);
    if (declared !== DEFAULT_PLACES.length) {
      warn('header-count', `data-places.js header says "${declared} curated places" but DEFAULT_PLACES has ${DEFAULT_PLACES.length}`);
    }
  } else {
    warn('header-count', 'could not find an "N curated places" comment in data-places.js header');
  }
}

// ── run all checks ───────────────────────────────────────────────────────────
check1_verdicts();
check2_dates();
check3_shapes();
check4_refs_and_coords();
check5_assets();
check6_scheduled_times();
check7_completeness();
check8_date_anchors();
check9_trip_integrity();

// ── report ───────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log(' validate-data.js — Italy honeymoon data invariants');
console.log('══════════════════════════════════════════════════════');
console.log(`  places: ${DEFAULT_PLACES.length}   bookings: ${BOOKINGS.length}   gifts: ${GIFTED_EXPERIENCES.length}`);
console.log('──────────────────────────────────────────────────────');

if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length}) — non-fatal:`);
  for (const w of warnings) console.log(`  ⚠️  [${w.check}] ${w.msg}`);
}

if (errors.length) {
  console.log(`\nERRORS (${errors.length}) — must fix:`);
  for (const e of errors) console.log(`  ❌ [${e.check}] ${e.msg}`);
} else {
  console.log('\n✅ No errors.');
}

console.log('\n──────────────────────────────────────────────────────');
console.log(` SUMMARY: ${errors.length} error(s), ${warnings.length} warning(s)`);
console.log('══════════════════════════════════════════════════════\n');

process.exit(errors.length > 0 ? 1 : 0);
