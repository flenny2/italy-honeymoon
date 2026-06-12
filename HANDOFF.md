# Session Handoff

> Live work-in-progress state. CLAUDE.md is the stable spec; this is the
> "what's the cursor on" doc. Update it after every session — header date
> below should always reflect the last touch.

**Last updated:** 2026-06-12 (final pre-trip session — trip starts tomorrow)
**Branch:** `main`. `pre-trip-polish` merged + pushed as the first action (insurance: the TZ fixes ship no matter what), then **13 more commits straight on `main`**, all pushed. Netlify live. CACHE v22 → **v23**. `validate-data.js`: **0 errors, 0 warnings.** See the 2026-06-12 entry below.

### HELD — during/post-trip work (in rough priority)
1. ~~**Bologna b1–b5 `source`**~~ — ✅ **DONE 2026-06-12** (`source:"Trip planning"`, Dylan's call; validator now fully clean).
2. **Antinori tasting-slot anchor (t3) — narrowed 2026-06-11.** The Jun 20 *departure* (8:30 AM, booked per Dylan's itinerary) is anchored on **t1**, so Jun 20's Up Next shows 08:30 the way Jun 16 shows 07:10. The only remaining bit: if a specific Antinori tasting slot ever gets booked, add `scheduled_date:"2026-06-20"` + `scheduled_time` to **t3** and put the time in `bk-antinori.when` (the validator WARNs the moment `when` gains a time while t3 stays unanchored).
3. **Florence hotel** HOTELS entry / **photos** per TODO-photos.md mostly unfilled.
4. **(observation, pre-existing — cosmetic)** Derived timed headlines carry a category kicker (`EXPERIENCE` etc.) which `_composePlanKicker` honors verbatim, so the Plan tile never appends `· PRE-BOOKED` for them (f9 on Jun 19, Pantheon on Jun 15). Revisit post-trip if it grates.

> `validate-data.js` (`node validate-data.js`) is the guardrail — run it after any data edit. Currently **0 errors, 0 warnings**. Date/time contradictions across places/bookings/gifts are ERRORs; new check10 WARNs on a `BOOKINGS.when` with no recognizable "Month D" and ERRORs on malformed manual `TODAY_PLAN` times / dangling ids.

---

## 2026-06-12 — Final pre-trip session: insurance merge + fix batch + Secret Food Tours + ship v23

Trip starts tomorrow. Three phases, all pushed to `origin/main`: (1) insurance merge of `pre-trip-polish` (the 10-commit TZ batch went live immediately), (2) seven verified bug fixes P0-first + validator/filter guards, (3) content: the newly booked Secret Food Tours Florence, end-time duration strings, Jun 19 Bologna revocation, b1–b5 sources. One CACHE bump v22 → **v23** for the whole batch.

### Commits (oldest first, after the merge)
- `bb389cc` — **P0 storage refactor.** `italy-places-v3` now stores `{ starred: [ids] }` only; `getPlaces()` merges over fresh `DEFAULT_PLACES`; legacy full-snapshot arrays migrate on first read, dropping removed-place residue (old Verona `ver1–ver5` can't resurrect). All 16 call sites unchanged; only `toggleSave`/`removeFavorite` ever write. **Dylan-confirmed: starred-ids-only** (no custom-places pool — no add-place UI exists, so unknown legacy ids are deletions, not user data). 12/12 vm migration tests.
- `1786124` — **P0 hero kicker city.** Keys on `headline.place.city !== phase.city` (was `kicker === 'DAY TRIP'`), fixing FIRENZE over the Jun 18 Vatican and Jun 20 Chianti. New `CITY_COLORS.Tuscany` (`#5F7A4A`, label `Toscana`) so the kicker reads TOSCANA.
- `1bb1a18` — **P0 departure day.** checkOut-only in `_pickHeroState` → new `depart` state: hero "Last morning in Venice" (`DEPARTURE DAY · VENEZIA`), Plan tile "Venice → Home" logistics. `TRANSITS['2026-06-27']` guarded in both builders (absent → fallback line). Jun 13's arrive-only check-in still falls through to normal.
- `fbc5d77` — **P1 unified pick chain.** New `pickCityAnchor(city, excludeIds, date)` in today-plan.js (essential landmark → essential → anything, never a place anchored to a different day) replaces both duplicated chains; Jun 14 no longer suggests the Jun-18 Vatican (picks St. Peter's).
- `ff3162f` — **P1 gift guard.** `(t.gift && t.gift.duration)` — manual `TODAY_PLAN` gift items arrive without `t.gift` and TypeError'd Today blank.
- `86fde2d` — **P1 TZ-safe "today".** `localISODate()` at bookings.js:173 (`getEntryStatus`), today.js letter alert + capsule nudge, journal.js entry date. Zero `toISOString` left in js/.
- `178dbff` — **P1 Up Next boundary.** `m !== null && m >= 0` (null check kept per Dylan's rider) — the 17:50 gondola shows "now" at 17:50:00.
- `c908686` — **guards.** validator check10 (WARN unparseable `when`; ERR bad `TODAY_PLAN` times/ids) + `renderSourceFilterButtons` re-runs `applyActiveFilters()` when it prunes a stale `src:` token.
- `aba5df1` — **f9 Secret Food Tours: Florence** (activity, anchored `2026-06-19` `10:00`, `duration_min:"3.5 hrs (10:00–13:30)"`, coords APPROX Mercato Centrale/San Lorenzo — real meeting point in the confirmation email, orange umbrella note). `bk-secretfood` in BOOKINGS (`when:'June 19, 10:00 AM'`, agrees with the anchor). **Pre-checked via a seed in `getBookingState()`** (`Object.assign({'bk-secretfood': true}, stored)`) so the confirmed tour badges Booked everywhere instead of counting as "still need booking"; an explicit uncheck (stored `false`) wins the merge. Count 89 → 90.
- `49139f1` — **end times in durations.** gift-1 `3 hrs (10:45–13:45)`, gift-3 `3 hrs (16:15–19:15)`, gift-2 `30 min (17:50–18:20)`; l2 `3 hrs (08:00–11:00)`; a1 + t1 gain `duration_min` (`~13 hrs (07:10–20:10)` / `9 hrs (08:30–17:30)` — neither had one). detail.js renders lettered `duration_min` values as-is; bare numeric ranges keep the `' min'` suffix.
- `4522708` — **Jun 19 Bologna revoked.** `TRIP.dayTrips['2026-06-19']` deleted — that entry WAS the Sacrario special-case (the untimed day-trip anchor derived b2 from it); Jun 19 now headlines the 10:00 food tour. Bologna stays browsable (CITIES/theming/b1–b8 kept; the map never drew a Bologna line). CLAUDE.md + APP-ARCHITECTURE.md city lines updated.
- `8807242` — **b1–b5 `source:"Trip planning"`** — validator to 0/0.
- `<this commit>` — CACHE v22 → v23 + this HANDOFF entry.

### Verification
- `node validate-data.js` → **0 errors, 0 warnings**; `node --check` clean on every touched file.
- Headless-Chrome acceptance vs `python3 -m http.server`, fresh profiles, all 7 mocks pass: Jun 18 T08:00 Vatican hero `TODAY · ROMA · 08:00` (zero FIRENZE); Jun 20 T09:00 `TODAY · TOSCANA`; Jun 27 `DEPARTURE DAY · VENEZIA` / "Last morning in Venice" / "Venice → Home" (zero "IS YOURS"); Jun 14 plan tile = St. Peter's, zero Vatican; Jun 19 T09:00 food-tour hero + Up Next 10:00, kicker FIRENZE; Jun 19 T15:00 zero Bologna/Sacrario; Jun 25 T17:50 gondola Up Next "now".
- Storage migration: 12/12 vm assertions (star survives, ver1 residue dropped, fresh content wins, round-trip, fresh-device no-op).
- Bookings page: bk-secretfood renders ✅ booked on a fresh device ("4 of 18 booked" = 3 gifts + seeded tour); f9 detail shows `3.5 hrs (10:00–13:30)` with no stray " min".
- **Rider confirmed:** `SOURCE_FILTER_META` Xio icon is genuine 🧭 (bytes F0 9F A7 AD) — no mojibake, nothing fixed.

### iPhone PWA
Delete + re-add the home-screen app in Safari — **v19 → v23** (the phone was still on stale `main`).

---

## 2026-06-11 — Post-audit quick wins (2 commits, branch `pre-trip-polish`)

Audit follow-ups: dead Xio filter, stale a1 copy, unanchored Jun 20 departure, two HANDOFF corrections, APP-ARCHITECTURE.md reviewed + committed. CACHE v21 → v22 (commit 1; commit 2 is docs-only, no bump).

1. **`153f60b` — data-driven source filters + a1 copy + t1 anchor.**
   - **Map "By Source" buttons are now generated** — `renderSourceFilterButtons()` (`app.js`, called from `renderFullMap()`) builds one button per distinct `source` among visible places (count-desc) and registers exact-match `FILTER_TESTS['src:<source>']` entries at render. The static nathan/goop/jacqueline/xio buttons and their substring matchers are gone. A button exists ⇔ data backs it, so the Xio bug (tap → zero matches → blank map) can't recur; the Xio button reappears automatically when a place lands with `source:"Xio guide"` (`SOURCE_FILTER_META` keeps its 🧭 look ready; unknown sources get a 📌 default). Buttons wire clicks via `addEventListener`, not inline `onclick` — source strings aren't attribute-safe.
   - **a1 honest_summary/best_for** rewritten for the booked June 16 combined Pompeii tour — keeps the ~13-hour honesty, drops "Do NOT combine with Pompeii" (closes HELD item 4).
   - **t1 Chianti anchored** `scheduled_date:"2026-06-20"` + `scheduled_time:"08:30"` — the 8:30 departure is real and booked (Dylan's itinerary; corrects the earlier session's held framing that no time existed). Jun 20 Up Next/Plan now show 08:30, mirroring a1's Jun 16 07:10. `t1.notes` opener now carries "departs 8:30 AM".
   - **`bk-antinori.when` stays `'June 20'` on purpose:** "June 20, 8:30 AM" parses cleanly, but 8:30 is the *tour departure*, not an Antinori tasting slot (the booking is the tasting+lunch), and check8 would add a WARN (explicit booking time + unanchored t3 — the exact scenario negative-tested in the date-awareness batch). HELD item 3 narrowed accordingly.
2. **`<this commit>` — docs.** HANDOFF corrections + first commit of `APP-ARCHITECTURE.md`. Review fixes applied to the doc: stray `</content>`/`</invoke>` artifact lines at EOF deleted, v20 → v22 cache refs (header + PWA section), `scheduled_date` added to the place schema (pair rule), `getTimedItemsForDate` added to the today-plan.js entry, map-filter bullet updated for generated source buttons. Line/file counts spot-checked accurate (379 HTML / 3,842 CSS / 5,498 JS, 28 js files).

- **Correction — `DAY_TRIP_LINE_COORDS` is NOT dead code.** Removed from the deferred-dead-code list below: it's defined at `map-shared.js:11` and consumed at `:43` (draws the day-trip route lines). The earlier audit note flagging it was wrong; only the "magic coords belong with `ROUTE_COORDS`" placement gripe stands, and that's a someday-refactor, not cleanup.
- **Verification:** `node --check` clean (app.js, data-places.js); `node validate-data.js` → 0 errors, 5 warnings (unchanged baseline). Headless Chrome against `python3 -m http.server`: `?date=2026-06-20T07:00` → Up Next tile "08:30 / Chianti Wine Region / in 1h 30m" + Plan tile 08:30; `#map` DOM has exactly 6 generated source buttons (`src:` tokens, count-desc), zero "xio" anywhere. vm assert: every generated filter matches ≥1 visible place (29/23/12/7/5/3).
- **iPhone PWA:** delete + re-add in Safari to pick up v21 → v22.

---

## 2026-06-11 — Today-screen date awareness (3 commits, branch `pre-trip-polish`)

The audit's core finding: `scheduled_time` had no date, `TODAY_PLAN` is empty by design, and BOOKINGS never fed Today — so Plan/Up Next couldn't map timed activities to days (phantom "Colosseum 09:00" on every Rome day, booked Pantheon invisible, move-day hero hiding the 8 AM Vatican). One CACHE bump (v20 → v21) in the final commit for the batch.

1. **`e275379` — `scheduled_date` anchors + validator ERRORs.** New invariant: `scheduled_date` + `scheduled_time` travel together, both or neither. Anchored: l2 Vatican Jun 18 08:00, l5 Pantheon Jun 15 10:00, a1 Amalfi Jun 16 07:10. Removed stale times: l1 Colosseum 09:00 (gift-1 owns the slot), f1 Duomo + f2 Uffizi (not booked — re-add as a pair when a slot is confirmed). `validate-data.js` check8: ERRORs on pairing violations and any booking↔place / gift↔place date conflict; WARN when a booking gains an explicit date+time but its place is unanchored. check6 time conflicts upgrade WARN→ERROR when date-anchored to the same day. Schema documented in CLAUDE.md (same commit).
2. **`5f0fcc3` — TZ-proof `getTripPhase` + Day 15.** `new Date('YYYY-MM-DD')` parses UTC, mock/now parsed local → counter ran **one day behind in any UTC+ timezone, including Europe/Rome where the phone will be** ("stuck at 3" reproduced under `TZ=Europe/Rome`), and Jun 27 flipped to the 'after' screen. Now pure ISO-string compare + schedule lookup by date. `addDaysISO` had the same UTC tail (+1 day returned the same day in Rome TZ — would have broken gift-tomorrow/Tonight lookups). Jun 27 added as Day 15, `totalDays` 15 (**Dylan-confirmed: 15 days / 14 nights, denominator 15**). check9 guards schedule contiguity + denominator drift.
3. **`<this commit>` — derivation layer.** New `getTimedItemsForDate(date)` in today-plan.js merges TODAY_PLAN (manual layer, still wins) + scheduled gifts + date-anchored places, soonest-first, deduped. `getUpNext` reads it; `getTodayHeadlinePlace` chain is now manual → earliest timed item → untimed day-trip anchor (`TRIP.dayTrips[date].city`, new field — Jun 19 → b2, Jun 20 → t1) → null (free day; the phantom essential-place fallback is **gone**). Move-day rule (generalized, any move day): before 12:00 Rome, a timed morning item leads the Hero (kicker carries the time) and the Plan tile becomes the move-logistics surface; from noon, move-PM leads as before. Free days get a deliberate "Free day" Plan tile. `_planPlaceGiftMove` prefers the day's earliest timed item the hero doesn't show (Jun 15: Pantheon 10:00 under the pasta hero) and never attaches a time from another day.

- **Verification:** `node validate-data.js` → 0 errors, 5 warnings (only b1–b5 source). Negative tests: flipped l5 date → ERROR exit 1; broke the pair → ERROR; bk-antinori with hypothetical "8:30 AM" → WARN not ERROR (no false-fire on the unanchored t3). vm harness: `getTripPhase` identical under Europe/Rome, America/Los_Angeles, Pacific/Auckland; 17/17 derivation assertions pass. **Headless-Chrome acceptance pass (21/21)** against `python3 -m http.server` with fresh profiles: Jun 14 gift hero 10:45 + zero "09:00"; Jun 15 Pantheon 10:00 in Plan/Up Next + pasta hero intact; Jun 16 Amalfi 07:10 + Day 4/15; Jun 17 free-day state; Jun 18 T09:00 Vatican leads + MOVE DAY tile secondary, T13:00 Benvenuti a Firenze; Jun 19 Day 7; Jun 27 Day 15 still DURING.
- **Antinori decision:** `bk-antinori.when` is `'June 20'` — the audit's "8:30 AM" doesn't exist in the data, so t1/t3 stay unanchored on purpose (no fabricated time). See HELD item 3 for the handoff.
- **Housekeeping:** RALPH-TASKS.md deleted (untracked, served its purpose).
- **iPhone PWA:** delete + re-add in Safari to pick up v20 → v21 (or just push and reload twice — the SW update path works on Netlify).

---

## 2026-06-09 — Pre-trip polish batch (5 commits, branch `pre-trip-polish`)

Five atomic commits on `pre-trip-polish` (cut from `main` at `31cfad5`). **Not pushed** — held by instruction until after the design session. JS/data + `sw.js` touched → `sw.js` CACHE **v19 → v20**, bumped **once** for the whole batch in the final commit (not per-commit) since the five ship/deploy together.

1. **`8eee0d6` — June 16 Pompeii/Amalfi/Positano day trip.** New `TRIP.dayTrips['2026-06-16'] = { label: 'Pompeii / Amalfi / Positano day trip', from: 'Rome', emoji: '🌊' }` — modeled on the Tuscany 2026-06-20 entry, only `label/from/emoji`, **no new schema field**. The 7:10 AM departure + ~13h length live in the booking `when` and place notes, not as dayTrips fields. Added `bk-amalfi` to `BOOKINGS` (urgency `now`, `placeId: 'a1'`, `when: 'June 16, 7:10 AM'`, standard venue shape — no forbidden source/date/time keys).
   - **Booking anchor decision:** linked to **`a1`** (Amalfi/Positano — the "essential big wow") so the booking → detail link lands on the marquee stop. Flip to `a2` (Pompeii, the ticketed component) trivially if preferred — both pass `validate-data.js` identically.
2. **`9b20b9d` — `a1`/`a2` notes → June 16.** Both now read "DAY TRIP from Rome on June 16 — departs ~7:10 AM", replacing the stale "June 13-17 stay" window and the now-false "separate day from Pompeii/Amalfi" lines (it's one combined trip now).
   - **⚠️ Residual contradiction (out of scope — needs Dylan's call):** `a1.honest_summary` still ends "Do NOT combine with Pompeii in the same day" and `a1.best_for` still says "Keep a separate day from Pompeii." These editorial fields now contradict the combined June 16 trip. Left untouched (Task 2 scoped to `notes` only) — revise the voice copy when convenient.
3. **`eb77255` — precache PWA icons.** `/img/icon-192.png` + `/img/icon-512.png` added to `APP_FILES` (referenced by index.html + manifest but 404'd on a cold offline install). Closes the icon half of old HELD item 3.
4. **`83c0adf` — drop dead hero JPGs.** Removed `/img/heroes/palatine-hill.jpg` + `vatican-statue.jpg` from `APP_FILES` — no `HERO_IMAGES` slot referenced them (precache dead weight). Closes the dead-hero half of old HELD item 3.
5. **`<this commit>` — CACHE v19 → v20 + this HANDOFF entry + header cursor refresh.**

- **Validator:** `node validate-data.js` → **0 errors, 6 warnings** (was 11). Cleared: 3 icon + 2 dead-hero. **Remaining 6 are expected/deferred:** b1–b5 missing `source` (HELD item 2 — needs real attribution from Dylan) + the inert Colosseum `l1` 09:00 vs gift-1 10:45 sched-time note.
- **`node --check`** clean on every touched JS file (`data-trip.js`, `bookings.js`, `data-places.js`, `sw.js`).
- **iPhone PWA:** delete + re-add in Safari to pick up the v19 → v20 cache jump.
- **Next:** design session (will bump CACHE **v20 → v21**), then push/merge `pre-trip-polish`.

---

## 2026-06-03 — Add Jacqueline + Xio source recommenders

Mirror the Nathan/Goop "By Source" map filters for two new recommenders. JS touched → `sw.js` CACHE **v18 → v19**.

- **`index.html`** — two new `mfm-option` buttons under "By Source": 🍷 Jacqueline Recs (purple #F3E8FF/#9333EA), 🧭 Xio Guide (sky-blue #E0F2FE/#0EA5E9).
- **`js/app.js`** — two new `FILTER_TESTS` matchers (`jacqueline`, `xio`), substring-match on `p.source` exactly like Nathan/Goop.
- **Attribution convention for future places:** `source:"Jacqueline rec"` / `source:"Xio guide"` (filter keys on the lowercase name).
- **Jacqueline's first 3 recs added** (`data-places.js`, count 86 → 89): `j1` La Piccola Cuccagna (Rome, off Piazza Navona, worth-it), `j2` Pane e Salame (Rome, by Trevi, hidden-gem), `j3` Gustarium (Florence, centro pizza al taglio, worth-it). Coords confirmed via web (Via della Cuccagna 14 / Via di Santa Maria in Via 19 / Via dei Cimatori 24r). `validate-data.js` → 0 errors.
- **Xio Guide** filter is live but still matches nothing — no places carry `source:"Xio guide"` yet.

---

## 2026-05-30 — Cosmetic data corrections (place count + Rome-stay window)

Closes the last two audit findings. JS data touched → `sw.js` CACHE **v17 → v18**.

- **Place count 83 → 86:** `data-places.js:2` header comment and `CLAUDE.md` file map (`DEFAULT_PLACES (86 entries)`). Actual array length is 86 (81 visible + 5 hidden transit/pharmacy).
- **Amalfi/Pompeii notes** (`data-places.js`, a1/a2): "DAY TRIP from Rome during June 13-**18** stay" → "13-**17**". Rome stay is nights 13–17; the 18th is the Rome→Florence move day, so a Rome day trip can't land on it.
- **Verified:** re-ran `node validate-data.js` → still **0 errors**, and the stale-count warning is now gone (11 warnings, all known-deferred HELD items).

---

## 2026-05-30 — validate-data.js guardrail (manual data-invariant checker)

Added `validate-data.js` at repo root so the audit's bug classes can't silently return. **Manual tool only** — run `node validate-data.js`; NOT wired into Netlify, git hooks, `APP_FILES`, or `sw.js`. **No `CACHE_NAME` bump** (not a served asset).

- **Mechanism:** reads the data files as text, concatenates them in index.html `<script>` order (`data-places, data-hotels, data-trip, data-today-plan, hero-images, bookings`), evals once via `vm.runInNewContext`, and captures the globals with a trailing expression. Top-level eval only declares consts + functions (nothing is called) so no DOM/Storage stubs are needed. (Planning caught that a `CITY_COLORS` stub would collide with the real `const CITY_COLORS` in data-trip.js — omitted.)
- **Severity:** ERROR (exit 1) = real contradiction / silent functional failure — invalid verdict key (check1), cross-file DATE disagreement + bad gift date/time (check2), schema drift (check3), dangling placeId/linkedPlaces ref or out-of-bbox coord (check4). WARNING (exit 0) = gap/judgment call — asset/precache gaps incl. PWA icons + dead hero JPGs (check5), scheduled-time-of-day disagreement (check6), missing source/editorial field + stale count (check7).
- **First run: `0 errors, 12 warnings`, exit 0** — confirms the Vatican/Pantheon/Tuscany contradictions from the audit are resolved. The 12 warnings are all the known-deferred items: icon-192/512 not precached (3), 2 dead hero JPGs, Colosseum l1 09:00 vs gift-1 10:45 (inert), b1–b5 missing source (5), stale "83" count (clears after the cosmetic commit).

---

## 2026-05-30 — Pre-trip audit fixes: Vatican/Pantheon time reconciliation

Read-only multi-agent audit (find → independently verify → validator draft) flagged a cluster of time/date inconsistencies among four independent sources (`place.scheduled_time`, `TODAY_PLAN`, `BOOKINGS.when`, gift `date/time`). Dylan confirmed the ground truth and we applied the safe data fixes. JS data-only — `sw.js` CACHE **v16 → v17**.

- **Vatican tour is June 18 @ 8 AM** (confirmed by Dylan): morning of the Rome→Florence move day — tour, back to the Rome Hilton for bags, then train. So the booking date was correct; the audit's "Jun 18 is outside the Rome stay" flag was a **false alarm, retracted**.
  - `bk-vatican` (`bookings.js`): `when` `'June 18'` → `'June 18, 8:00 AM'`; title now includes **St Peter's Basilica** (`'Vatican Museums, Sistine Chapel & St Peter's Basilica'`) to match the actual guided tour.
  - `l2` `scheduled_time:"08:00"` was already correct — left as-is.
- **Removed stale `TODAY_PLAN['2026-06-15']`** (`data-today-plan.js`): it headlined the Vatican on Jun 15 @ 09:30 — wrong date (it's the 18th) and wrong time, and it never rendered anyway (gift-3 pasta forces the gift Hero on the 15th, and the Plan tile re-derives to the Colosseum). It was leftover "Treatment A mockup" demo config. `TODAY_PLAN` is now empty (all days derive).
- **Pantheon time fixed** (`l5`, `data-places.js`): `scheduled_time` `"11:00"` → `"10:00"` to match the `bk-pantheon` `'June 15, 10:00 AM'` timed-entry reservation.
- **Verified:** `node --check` clean on all 3 JS files; CACHE → v17. **iPhone PWA:** delete + re-add for v16 → v17.

### Audit results (read-only; no other fixes applied this commit)
- **Clean (challenged adversarially, held):** verdict-key integrity (all 81 verdicts valid base keys), reference integrity (all placeId/linkedPlaces resolve, all 86 coords valid), schema correctness (no BOOKINGS drift, gifts valid), Tuscany date consistency, content completeness (all 81 visible places have summary/verdict/best-for).
- **3 findings refuted** by independent verification (data inconsistent but inert — no user-facing surface reads the conflicting value): Jun-14 Colosseum 09:00-vs-10:45, Jun-15 Vatican "triple-time" (the plan tile actually picks Colosseum, not Vatican), Jun-18 "move day buries Vatican" (BOOKINGS never feed Hero/Plan).
- **A proposed `validate-data.js` invariant checker** was drafted (loads the browser globals via Node `vm`, asserts all 7 dimensions, errors fail / warnings don't). Not added to the repo — available to drop in when wanted.

### Open — queued, NOT yet done
- **Move-day Vatican-tour visibility (feature gap):** on Jun 18 the Today screen shows move-day Hero ("Last morning in Rome") + train logistics but **nothing about the 8 AM Vatican tour** — BOOKINGS don't feed the Hero/Plan surfaces, and move-day logic overrides the normal headline. Most logistically loaded morning of the trip. Needs a small feature (e.g. surface a same-day timed booking on the move-day Plan tile or Hero body), not a data edit.
- **Up Next blind to `place.scheduled_time`** (`getUpNext`, today-plan.js): only TODAY_PLAN + scheduled gifts feed it, so most trip days show "Free time" despite a timed headline place. Confirmed; deferred.
- **Bologna b1–b5 missing `source`** (data-places.js) while b6–b8 have it — detail-page source line blank for those five.
- **Stale count:** `data-places.js:2` header says "83 curated places"; actual is **86** (81 visible). CLAUDE.md also says 83. Cosmetic.
- **PWA icons not pre-cached:** `icon-192/512.png` referenced by index.html + manifest but absent from `APP_FILES` (self-heal online; cosmetic). 2 hero JPGs (`palatine-hill`, `vatican-statue`) pre-cached but unreferenced (dead weight).

---

## 2026-05-30 — Tuscany day trip reconciled to Jun 20

Dylan confirmed the Tuscany/Chianti day trip is **June 20** (Florence stay Jun 18–22, so it checks out). Resolved the prior commit's open question — moved every Tuscany day-trip date ref from Jun 21 → Jun 20 in one pass so the app and bookings stay consistent:

- `TRIP.dayTrips` key `'2026-06-21'` → `'2026-06-20'` (`data-trip.js`) — this is what drives the Today-screen day-trip detection.
- `bk-antinori` `when: 'June 21'` → `'June 20'` (`bookings.js`).
- `t1` Chianti Wine Region note + `tr2` Firenze S.M.N. note "June 21" → "June 20" (`data-places.js`).
- `TRIP.schedule` unchanged — Jun 20 is still a Florence day (day 8); day trips are additive, no schedule edit needed.
- `sw.js` CACHE → **v16**. `node --check` clean. **iPhone PWA:** delete + re-add for v15 → v16.

---

## 2026-05-30 — Schedule data population (gifts + venue dates)

Itinerary confirmed; populated the schedule data. JS data-only change — `sw.js` CACHE bumped **v14 → v15**.

- **3 registry gifts** (`GIFTED_EXPERIENCES`, `data-trip.js`) — set `date` + `time` (24h `HH:MM`) + `bookingStatus: 'scheduled'`:
  - `gift-1` Colosseum/Roman Forum/Palatine — `2026-06-14` `10:45`.
  - `gift-3` pasta-making class — `2026-06-15` `16:15` (existing `duration: '3 hours'` already encodes the 7:15 PM end — no end-time field in the schema).
  - `gift-2` Venice gondola serenade — `2026-06-25` `17:50`.
  - These now light up the Today/Hero gift states + day-of/day-before callouts, and read as scheduled on `#bookings`. Auto-flip to `completed` after each date passes (`getEntryStatus`).
- **2 venue bookings** (`BOOKINGS`, `bookings.js`) — enriched the free-text `when` only. **BOOKINGS has no date/time/source/status fields** (those are a gift-only concept; `source:'venue'` is injected by `getAllEntries()` at render time), so dates live in `when`:
  - `bk-pantheon` (placeId l5): `'June 13–17'` → `'June 15, 10:00 AM'`.
  - `bk-vatican` (placeId l2): `'June 13–17'` → `'June 18'` (date-only — no start time on the voucher yet).
  - **No new entries** — Pantheon and Vatican already existed as bookings; adding duplicates would re-break the Path B dedup. The itinerary's "Pantheon Guided Tour" / "Vatican Guided Tour" map to these existing entries.
- **Did NOT touch** any place `scheduled_time` fields, and **did NOT** edit `bk-antinori` (Tuscany) — left at `'June 21'` (see open question).
- **Verified:** all 3 gifts read `bookingStatus: 'scheduled'` with dates; `bk-pantheon`/`bk-vatican` `when` updated, no duplicate IDs; `CACHE_NAME` → v15; `node --check` clean on `data-trip.js`/`bookings.js`/`sw.js`.
- **iPhone PWA:** delete + re-add in Safari for the v14 → v15 cache jump.

### Open question — Tuscany date (Jun 20 voucher vs Jun 21 app)
The Tuscany voucher reads **Jun 20**, but `TRIP.dayTrips` (`data-trip.js:27`) and `bk-antinori` (`bookings.js`) both place the Tuscany/Chianti day trip on **Jun 21** — and `TRIP.dayTrips` is what drives the app's day-trip detection on the Today screen (Jun 20 is otherwise a plain Florence day). **Left both at Jun 21 this commit** pending Dylan verifying the real date against the booking confirmation. Once confirmed: either move the `TRIP.dayTrips` key (and `bk-antinori` `when`) to Jun 20, or keep Jun 21 if the voucher was misread. Touch both together so the app and the booking stay consistent.

---

## 2026-05-30 — Today rewrite COMPLETE (v10–v14 closeout) + housekeeping

The five-stage Today-screen redesign (Direction C / Hairline Editorial) is **done and live** — all of v10–v14 on `origin/main`, Netlify auto-deployed. This entry closes the arc and clears the trigger to remove `design-handoff.md`.

- **The five stages, all shipped:**
  - **v10 Foundations** (`30e529a`) — schema additions, `css/today.css` tile primitives, VerdictPill, HERO_IMAGES registry, CITY_REAL_TALK essays. Zero rendering change.
  - **v11 Hero** (`1912528`) — DURING-phase Hero tile, 5-state priority resolver, Italian flag stripe, city-color theming.
  - **v12 Status strip + Today's Plan** (`e89d2c7`, `ef41de3`) — Day/Weather/Up Next triple, kicker composer, minute-tick with Router cleanup, `?date=` URL-param mock harness.
  - **v13 Editorial tiles + Favorites** (`9a1e0c1`, `59401dc`) — Real Talk + Home Base + Phrasebook + Saved footer; Saved→Favorites rename + dedicated ⭐ `#favorites` view.
  - **v14 Polish + Tonight mode** (`ea7e444`, `0bf9030`) — in-place unstar, real side-by-side Italian flag bands, counter steppers on Stats, and the 19:00 Europe/Rome ink-theme flip with Tomorrow's Plan + amber TONIGHT pill. Final stage.
- **`design-handoff.md` removed.** The untracked design-brief addendum at repo root (generated 2026-05-22 for Claude Design) was kept until the redesign shipped; v14 was the agreed trigger. Deleted with a plain `rm` — never tracked, so nothing to stage. This HANDOFF entry is the only thing committed.
- **No code touched** — docs/housekeeping only. **`sw.js` CACHE not bumped** (no JS/CSS change).
- **Offline-queued work (next session, priority order):**
  1. **Florence hotel** — pick + book, fill the `HOTELS['Florence']` entry (Home Base tile renders real data for the other 3 cities; Florence is the gap).
  2. **Photos** per `TODO-photos.md` — most slots still unfilled (move-day photos, Venice/Bologna heroes, key place photos).
  3. **Gift dates** — set `date`/`time` + `bookingStatus: 'scheduled'` on `gift-1` (Colosseum tour), `gift-2` (Venice gondola), `gift-3` (pasta class) in `GIFTED_EXPERIENCES`. Lights up the Hero gift states + Today gift callout, silent until set.
  4. **iOS PWA install + offline test** — delete + re-add the home-screen icon in Safari to pick up the full v9 → v14 cache jump; confirm tiles/fonts/CSS/hero images load in airplane mode.
  5. **Lower priority:** move-AM plan-city decision (Hero "Last morning in Rome" vs Plan tile Florence Duomo — revisit now the whole screen is in context); Italian phrasebook page rebuild (`#phrasebook`); `APP-ARCHITECTURE.md` regen for project-knowledge re-upload.

---

## 2026-05-29 — Today rewrite Stage 5 / v14 (Tonight mode) — FINAL

The Today redesign's last stage. Evening theme flip + tomorrow preview.

- **Trigger:** `getTonightMode(_todayNow())` (today-plan.js, ≥19:00 Europe/Rome). Computed once in `renderTodayDuring`. Mockable via `?date=…T21:00` or `?tonight=1` (localhost).
- **Theme flip:** `today-grid--tonight` class on the grid (cream→ink #1A1410, flat tiles dark, image tiles dimmed — base CSS was staged back in v10). v14 adds the text-relight overrides so the v12/v13 tile content (Day numeral, weather, Up Next, plan, Real Talk, Home Base, Phrasebook, Saved) stays legible on dark, plus dark hairlines.
- **Amber TONIGHT pill:** `_injectTonightPill(heroHtml)` inserts `<span class="tonight-pill">` just inside the hero tile's opening tag; `renderTodayHeroDuring(phase, city, state, tonight)` now takes the flag. CSS pins it top-right, `--giallo` bg.
- **Tomorrow's Plan:** `renderTomorrowsPlan(phase, city)` — rendered only in tonight mode, after Today's Plan. Flat `.tile--span-2`, eyebrow "TOMORROW'S PLAN", uses `getTomorrowHeadlinePlace(phase.date)`. Kicker **omits the live OPEN/CLOSED segment** (it's not today) — category + PRE-BOOKED only, unless a manual `TODAY_PLAN` kicker exists.
- **Mid-session 19:00 flip (Dylan's addition):** `_refreshUpNext` now compares `getTonightMode(_todayNow())` against the live `.today-grid--tonight` class; on mismatch it calls full `renderToday()` (one-time scroll jump at the boundary is acceptable) instead of only patching `#today-upnext`. Closes the "screen doesn't flip at 7pm without navigating away" gap.
- **`sw.js` CACHE → v14.** No new files.
- **Verified:** `/tmp/v14_smoke.js` — 17/17 (getTonightMode at 21:00/10:00/19:00/?tonight=1, pill injection + preservation, hero tonight flag on/off, Tomorrow tile renders w/o open-segment kicker, full grid wires class+pill+tomorrow at night and none in daytime). `node --check`; server 200s.
- **Real-browser QA pending** (Dylan): `?date=2026-06-15T21:00` → ink theme, amber pill, Tomorrow tile, legible text. `?tonight=1` also forces it.
- **iPhone PWA:** delete + re-add in Safari for the v13-2 → v14 cache jump.
- **Redesign complete.** Remaining ideas (not scheduled): per-day `realTalk` overrides for terse single-sentence days; gift-date population to light up gift Hero states; the deferred move-AM plan-city question (revisit "now that the full screen is in context").

---

## 2026-05-29 — Post-v13 polish (unstar + flag + counter decrement)

QA feedback batch from Dylan, three small fixes shipped together:

- **In-place unstar on favorite rows** (`today.js`) — `buildFavoriteRow` restructured from a single navigating `<button>` to a `<div class="saved-row">` holding a `.saved-row-main` button (taps → detail) + a `.saved-row-remove` ✕ button. New `removeFavorite(id, evt)` sets `p.saved=false`, toasts, and re-renders the active surface (`#favorites` or `#today`). Applies to BOTH the Today footer and the #favorites page (shared builder). Removes the old 4-tap remove flow.
- **Real Italian flag** (`today.css` `.flag-stripe-3` + `today.js` `_statusDayTile`) — was 3 stacked horizontal lines (read as vertical); now three **side-by-side vertical bands**, 27×18 (3:2), hoist→fly order **green · white · red** (markup reordered g/w/r). `box-shadow: 0 0 0 1px var(--hairline)` defines the white band on cream.
- **Counter decrement** — `Storage.decrementCounter(type)` (`storage.js`): floors at 0, splices the most-recent matching `history` entry (keeps By-City consistent), **does NOT revoke achievements** (once earned, kept). `#stats` tiles gained a `[−] n [+]` stepper (`stats-stepper`/`stats-step` CSS in pages.css) wired to new `stepCounter(type, delta)` in counters.js (+ re-renders the page). Today chips stay tap-only (celebratory +1). Confirmed via AskUserQuestion: steppers on Stats, not chip long-press/visible-minus.
- **`sw.js` CACHE → v13-2.** No new files.
- **Verified:** `/tmp/polish_smoke.js` — 13/13 (decrement floor + history splice + most-recent removal, achievement-retention, removeFavorite clears saved, row structure div+2 buttons, flag g<w<r order). `node --check`; server 200s.
- **Decisions:** decrement keeps achievements unlocked (no un-toast); flag is the one architectural flag now correct; ✕ remove shared by both favorite surfaces via the one row-builder.

---

## 2026-05-29 — Favorites (Saved→Favorites rename + dedicated view)

Post-v13 QA feedback: Dylan couldn't find an entry point for starred places (only the Today footer showed them, during-trip only), and noted "Saved" doesn't match the ⭐ icon as well as "Favorites" would. Both confirmed via AskUserQuestion.

- **Terminology rename (user-facing strings only — `p.saved` data key UNCHANGED, no migration):**
  - Detail button (`detail.js`): `☆ Save`/`⭐ Saved` → `☆ Favorite`/`⭐ Favorited`.
  - `toggleSave` toast (`today.js`): `⭐ Saved!`/`Unsaved` → `Added to favorites`/`Removed from favorites`.
  - Today footer eyebrow: `SAVED PLACES` → `FAVORITES`.
  - Place-card ⭐/☆ stars (icon-only, no text) untouched. `renderTodayPicks` "Don't Miss" header is essentials, not favorites — left as-is.
- **New #favorites view (More tab) + Today footer, one shared builder:**
  - `getFavoritePlaces()` + `buildFavoriteRow(p)` extracted in `today.js` — the single source for both surfaces (rows stay visually identical).
  - `renderFavorites()` in `app.js` — page grouped by trip-city order (`CITIES`), each city a `section-header` + `.tile--flat` of rows; empty state ("No favorites yet. Tap the ☆ …"); standard `back-btn` → `#more`.
  - Route `'favorites' → renderFavorites` (router.js), `page-favorites` shell (index.html), `⭐ Favorites` entry in the More hub (`renderMore`, 2nd item, with live count desc).
  - `toggleSave` now re-renders the Favorites page in place when it's the current page (so unfavoriting from a detail reached via Favorites reflects on return).
- **No new JS file** (renderFavorites in app.js, builders in today.js — both already cached). `sw.js` CACHE → `v13-1`.
- **Verified:** `/tmp/fav_smoke.js` — 12/12 (filter/trip-sort, row markup, grouped page, empty state, footer reuse + FAVORITES eyebrow). `node --check` on all 4 edited JS; stale-string grep clean; server 200s incl. `#favorites`.
- **Decisions worth remembering:** data key stays `saved` (rename is display-only — [[feedback_no_schema_drift]]); both surfaces share one row-builder so they never diverge; Favorites entry placed 2nd in More for discoverability.

---

## 2026-05-29 — Today rewrite Stage 4 / v13 (Real Talk + Home Base + Phrasebook + Saved + counters)

- **DURING grid is now the full locked inventory.** `renderTodayDuring` order: Hero → Status strip → Today's Plan → **Real Talk** → **Home Base | Phrasebook** (`.today-row--split`) → **Saved footer** (conditional) → **counter chip row**.
- **Real Talk Today** (`renderTodayRealTalk`, full-width `.tile--flat`, no photo) — `getRealTalk(date, getTodayHeadlinePlace(date), city)` 3-step fallback (day override → place `honest_summary` 1st sentence → `CITY_REAL_TALK`). Headline in Playfair roman 22px (a sanctioned ≥22px use); body DM Sans 15px/1.55. Headline line omitted when the source is a day-override (null headline).
- **Home Base** (`renderTodayHomeBase`, 2-col `.tile--flat`) — editorial/compact, NOT the legacy address dump: `HOME BASE` + hotel name + `{neighborhood} · {walk_time_min} min to center`. **Robust fallback (Dylan-requested):** missing `HOTELS[city]` → "Hotel TBD" + "Booking pending"; partial fields → best-available or "Neighborhood TBD". **Tile never hides, never crashes.** (All 4 hotels currently have full data — Florence's Oltrarno Splendid is booked.)
- **Phrasebook** (`renderTodayPhrasebook`, 2-col `.tile--flat`) — `getPhraseOfDay(date)` → it / `/pr/` / en. 🇮🇹 flag stamp. **Tappable → `#phrasebook`** (route verified to exist: `router.js` → `renderPhrasebook` in `phrasebook.js`; no inline page built).
- **Saved Places footer** (`renderTodaySavedFooter`, full-width `.tile--flat`, CONDITIONAL) — **all** starred places across the trip (`Storage.getPlaces().filter(p => p.saved && isVisiblePlace(p))`), sorted by `CITIES` trip order then name. Each row tappable → `#place/{id}`, with name + city label + `renderVerdictPill`. Absent (returns `''`) when nothing is starred.
- **Counter chip row** — repurposed the previously-dead `renderCounterChips()` (counters.js): legacy `.section-header` → editorial `.today-counter-row` + `THIS TRIP` eyebrow. **Chip markup (`#chip-{key}`) + `tapCounter()` onclick unchanged** — in-place +1 animation and `Storage.incrementCounter` achievement path intact. Called directly at the bottom of `renderTodayDuring`. Removed the now-orphaned `renderTodayCounters` wrapper + its before/after list entry (was a during-guarded no-op there). `#stats` (`renderStats`) builds its own chips — untouched.
- **Decisions worth remembering** (not obvious from the diff):
  - **Counters kept on Today as a chip row** (not stats-only) — one-tap-from-home logging is the feature's whole point. Diverges slightly from the literal 7-tile inventory but Dylan confirmed.
  - **Saved footer is all-trip, not current-city** — Dylan picked the complete "my saves" list over today's-city-only.
  - **Home Base "Hotel TBD" placeholder** keeps the tile present if a city goes unbooked — consistency over conditional hiding (Dylan-requested).
  - **Phrasebook tap shipped because the route already existed** — would have been made non-tappable otherwise (no inline-page scope creep).
- **`sw.js` CACHE → v13.** No new files (JS/CSS edits only).
- **Verified:** `/tmp/v13_smoke.js` — 16/16 (getRealTalk place/city/null branches, getPhraseOfDay determinism, Home Base full + TBD fallback, Phrasebook tap+stamp, Saved footer empty/exclude-unsaved/trip-order/pills/links/city-labels). `node --check` on today.js + counters.js; dead-ref check clean; server 200s. **Real-browser visual QA pending** (Dylan — full screen now in context for the first time).
- **iPhone PWA:** delete + re-add in Safari to pick up v12 → v13 cache jump.
- **Queued — Stage 5 / v14 (final):** Tonight mode — `getTonightMode()` (≥19:00 Europe/Rome, already in today-plan.js) drives a `.today-grid--tonight` class (theme flip CSS already staged in today.css), "Tomorrow's Plan" swap, amber TONIGHT pill, image-tile dim. `?tonight=1` + `?date=…T21:00` both force it for QA.
- **Plan file:** `~/.claude/plans/foamy-foraging-candle.md` (v13 detail section).

---

## 2026-05-28 — Today rewrite Stage 3 / v12 (Status strip + Today's Plan + mock harness)

- **`renderTodayDuring` now composes 3 tiles:** Hero → Status strip → Today's Plan. Real Talk / Home Base / Phrasebook / Saved footer still land in v13. Hero state is resolved **once** (`_pickHeroState(phase)`) and threaded into both the Hero builder and the Plan tile so they never disagree.
- **URL-param mock harness (new scope, localhost-only — like `?tonight=1`):** `?date=YYYY-MM-DD[THH:MM]&phase=during`.
  - `_readMockParams()` (helpers.js) — hostname-gated (`localhost`/`127.0.0.1`), returns `{date, rome, forcePhase}`. Off-localhost → all null, so production is untouched.
  - `getTripPhase()` (data-trip.js) — uses the mock date when present; `?phase=during` forces a DURING object even for an out-of-window date (forward-mocking before the trip).
  - `getRomeNow()` (helpers.js) — the `THH:MM` suffix becomes the Rome clock, so `?date=2026-06-18T09:00` deterministically hits move-AM and `T15:00` hits move-PM. `?tonight=1` still works as a quick force-evening toggle.
  - **This retires the lossy 3-file-edit QA dance.** Use it for every remaining stage and to preview tomorrow's hero during the trip.
- **Status strip** (`renderTodayStatusStrip` → `.today-row--triple`, 3 flat tiles):
  - **Day** tile — consumes the `.day-numeral-*` + `.flag-stripe-3` CSS staged in v11. `phase.day` over `TRIP.totalDays` (dynamic). City label tinted via `CITY_COLORS[city].hex`; day-trip days show the day-trip label.
  - **Weather** tile — **offline stub**, NOT a live forecast: new `WEATHER_TYPICAL` map in data-trip.js (per-city June climatology), labeled `TYPICAL JUNE` so it never reads as real-time. A real forecast stays out of scope (needs an API → breaks offline-first).
  - **Up Next** tile — `getUpNext(date, _todayNow())` → time + `formatRelativeTime` ("in 1h 40m"); null → "Free time". Wrapper carries `id="today-upnext"` for the minute-tick.
- **Today's Plan** tile (`renderTodayPlanTile`, `.tile--span-2`) — **conditional image (Dylan-confirmed):**
  - **Normal day** → flat (no photo): the Hero already shows this place. Renders eyebrow + VerdictPill + name + time + composed kicker + `best_for`.
  - **Gift/move day** → image of the day's first *real place to visit* (`_planPlaceGiftMove`, excludes the gift's `linkedPlaces`), so two identical photos never stack.
  - **Kicker composer** (`_composePlanKicker`): `OPEN`/`OPENS HH:MM`/`CLOSED` (from `hours_open`/`hours_close` vs the Rome clock) · category word (`_kickerFromCategory`) · `PRE-BOOKED` (`isPlaceBooked`). A manual `TODAY_PLAN[date].headline.kicker` wins **verbatim**.
- **Minute-tick** — `_installTodayTick()` runs `_refreshUpNext()` every 60s, rewriting **only** `#today-upnext` (no full re-render → scroll position + in-place star-save survive). Installed only on the DURING path; `_clearTodayTick()` fires on BEFORE/AFTER render and in `Router.handleRoute` when leaving Today (no leak onto Map/Journal).
- **Plan name is DM Sans, not Playfair** — Playfair stays reserved for Hero title / Real Talk headline / Day numeral per the locked type discipline.
- **`sw.js` CACHE → v12.** No new files this stage (JS/CSS edits only) — no APP_FILES change.
- **Verified:** `/tmp/v12_smoke.js` — 22/22 (mock-param parse + gating, getTripPhase mock/force, getUpNext future/past edge, open-segment OPEN/OPENS/CLOSED, kicker composer manual + derived, relative-time format). `node --check` on all 4 edited JS files; local server serves all assets 200. **Real-browser visual QA still pending** (Dylan's combined v11+v12 pass via the new params).
- **Decisions worth remembering** (not obvious from the diff):
  - **Plan name deliberately NOT Playfair** — keeps the ≥22px Playfair allowance to Hero/Real-Talk/Day-numeral only.
  - **Place hours store single-digit** (`"8:00"`), so the kicker reads `OPENS 8:00` — intentional, matches the source data; don't zero-pad.
  - **`_todayNow()` honors the mock clock** so Up Next math matches the previewed scenario in QA; real usage (device in Rome TZ) is unaffected.
  - **Conditional-image rule** keys on Hero kind: normal → flat, gift/move → image of a *distinct* place. Avoids the same-photo stack the locked inventory would otherwise produce.
- **iPhone PWA:** delete + re-add in Safari to pick up v11 → v12 cache jump.
- **Queued — Stage 4 / v13 next session:** Real Talk tile (`getRealTalk` 3-step fallback) + Home Base + Phrasebook (🇮🇹 stamp) + Saved Places footer; gate any remaining legacy DURING paths to BEFORE/AFTER only.
- **Plan file:** `~/.claude/plans/foamy-foraging-candle.md` (v12 detail section appended).

---

## 2026-05-24 — Today rewrite Stage 2 / v11 (Hero tile)

- **v11 — Hero tile lands for DURING phase.** State matrix renders all 5 daytime states. Tonight-mode flip deferred to v14.
- **`renderToday()` split:**
  - `renderTodayDuring(phase, city)` composes the new `.today-grid` wrapper (v11: Hero tile only; v12–v14 fill the rest).
  - `renderTodayBeforeAfter(phase, city)` keeps the legacy 11-section `.stagger`/`.today-section` composition unchanged. DURING-guarded renderers (counters, gift callout) self-quiet for BEFORE/AFTER.
  - **No regression** to BEFORE/AFTER paths — verified via smoke test + structural check.
- **`renderTodayHeroDuring(phase, city)`** dispatches to one of 5 builders via `_pickHeroState(phase)` priority resolver:
  1. **Gift today** (scheduled gift with date === today) → tall 240, kicker "A GIFT · OPENS HH:MM", title from `gift.heroTitle || gift.title`, optional `heroSubtitle`.
  2. **Gift tomorrow** → slim 132, kicker "A GIFT · TOMORROW HH:MM", title "Tomorrow: {gift}".
  3. **Move day AM** (today equals some hotel's checkOut AND another's checkIn; Europe/Rome hour < 12) → tall 240, kicker "MOVE DAY · ROMA → FIRENZE", title "Last morning in [English departure]", optional body from `TRANSITS[date].train`.
  4. **Move day PM** (same conditions, hour ≥ 12) → tall 240, kicker "WELCOME · FIRENZE", title "Benvenuti a [Italian arrival]" (uses `CITY_COLORS[city].label`), optional body from `TRANSITS[date].arrivalNote`.
  5. **Normal day** → slim 132, kicker "TODAY · ROMA", title from `getTodayHeadlinePlace(date)` (manual `TODAY_PLAN` > derived fallback chain).
- **CSS in `css/today.css`:** `.hero-kicker` (12px DM Sans uppercase letter-spacing +0.12em), `.hero-title` (Playfair 32px roman with text-shadow), `.hero-body` (14px light), `.hero-placeholder-icon` (only when no photo mapped). Plus Day numeral typography (`.day-numeral-*`) staged for v12 DOM consumption. Plus `.flag-stripe-3` 3-line Italian flag.
- **`TRANSITS` const added** to `data-today-plan.js` — sparse map keyed by ISO date. Empty by default; Dylan fills in train numbers + arrival notes as confirmations land. Move-day Hero renders without the body line if absent.
- **Removed:** DURING branch from legacy `renderTodayHero`. Now only handles BEFORE/AFTER typography hero. Legacy `.hero-during*` CSS in `pages.css` becomes orphan — left in place, removed in a later cleanup pass.
- **Italian display names:** kicker uses `CITY_COLORS[city].label.toUpperCase()` (ROMA, FIRENZE, COMO, VENEZIA, BOLOGNA). "Benvenuti a {city}" title uses the mixed-case label (Firenze, not Florence). "Last morning in {city}" stays English on purpose — editorial asymmetry (English farewell, Italian welcome).
- **`sw.js` CACHE → v11**, +11 hero photos in APP_FILES so first DURING render works offline.
- **Decisions worth remembering** (not obvious from the diff):
  - **Asymmetric move-day language** (English on AM departure title, Italian on PM arrival title) is intentional editorial. Don't normalize.
  - **`gift.heroTitle` / `gift.heroSubtitle` are optional schema additions** — non-breaking. Default to `gift.title` if absent. Adds room for the curated "Buon anniversario, amore" tagline the mockup shows without forcing it.
  - **Move-day cutoff is hard 12:00 Europe/Rome.** Could be parameterized later via `TRANSITS[date].departHour`. For now, noon is reasonable for the 3 Frecciarossa transitions on this trip.
  - **Day numeral CSS in v11, Day numeral DOM in v12.** Splitting CSS from DOM lets v11 ship cleanly and v12 just wire the markup.
- **State matrix verified end-to-end** via `/tmp/v11_smoke.js` — all 5 Hero states render correct photo/kicker/title/body. BEFORE-phase regression check passes.
- **iPhone PWA:** delete + re-add in Safari to pick up v10 → v11 cache jump.
- **Queued — Stage 3 / v12 next session:**
  - Status strip: Day X / 14 tile (consumes the Day numeral CSS from v11) + Weather tile + Up Next tile (live "in 1h 40m" counter)
  - Today's Plan tile with image background + kicker composer (`OPEN · ENTRY · PRE-BOOKED` from hours_close + booking + getEntryStatus)
  - VerdictPill renders in Today's Plan tile when headline place has a verdict
  - Minute-tick `setInterval(renderToday, 60000)` with Router cleanup hook for Up Next live count
- **Plan file:** `~/.claude/plans/foamy-foraging-candle.md`

---

## 2026-05-24 — Today rewrite Stage 1 / v10 (foundations)

- **Locked in chat-only session before this:** Direction C (status-first dense, tile inventory) + Treatment A (Hairline Editorial — cream surface, 1px hairlines, restrained flag accents). Plan at `~/.claude/plans/foamy-foraging-candle.md` — 5 staged commits (v10–v14). User amended plan with two changes: image downscale moved into Stage 1; CITY_REAL_TALK drafted by Claude with chat preview before commit.
- **v10 — foundations only, zero rendering change:**
  - 11 hero photos downscaled in-place via PIL (1600px wide, JPEG q80, target <300KB): **159 MB → 2.3 MB total**. Originals backed up to `/tmp/heroes-original-backup-20260524/`. Script at `/tmp/downscale_heroes.py` (re-runnable for new sources).
  - **New files:** `js/data-today-plan.js` (TODAY_PLAN map, starter entry Jun 15 Vatican = mockup Day 5), `js/today-plan.js` (consumers: `getTodayHeadlinePlace`, `getUpNext`, `getTomorrowHeadlinePlace`, `getPhraseOfDay`, `getTonightMode`, `getRealTalk`), `js/hero-images.js` (HERO_IMAGES registry + `getHeroBackground` resolver + placeholder fallback), `js/components/verdict-pill.js` (`renderVerdictPill` with `nice→nice-if-nearby`/`overrated→overhyped` legacy normalization at the boundary — no data migration), `css/today.css` (tile primitives + VerdictPill + `.today-grid--tonight` theme flip), `TODO-photos.md` (slot-coverage source of truth, 11 filled / 16+ missing).
  - **Modified:** `helpers.js` (+`minutesUntil`, `formatRelativeTime`, `getRomeNow` with `?tonight=1` localhost escape hatch — leaves CITY_COLORS comment pointing to data-trip.js). `data-trip.js` (+`CITY_COLORS` with oklch+hex fallbacks alongside CAT_COLORS; +`CITY_REAL_TALK` 5-city essay map). `data-hotels.js` (+`neighborhood`, +`walk_time_min` on all 4 hotels). `data-places.js` (+optional `scheduled_time` on l1 Colosseum 09:00, l2 Vatican 08:00, l5 Pantheon 11:00, f1 Florence Duomo 09:00, f2 Uffizi 08:15 — `buildPlaceCard` ignores it). `index.html` (+inline Tabler-style SVG sprite with 6 outline icons, +`css/today.css` link, +4 new script tags in correct dependency order). `sw.js` (CACHE_NAME → v10, +5 new APP_FILES; **hero images deferred to v11** APP_FILES jump alongside Hero tile rewrite).
- **Schema additions are non-breaking:** all new fields optional. BEFORE-phase Today still renders identically. DURING/AFTER untouched.
- **Decisions locked this session worth remembering** (not obvious from diff):
  - **CITY_COLORS lives in `data-trip.js`** alongside CAT_COLORS as peer data, not in helpers.js. Plan agent flagged that helpers.js is the wrong layer for trip data.
  - **Verdict key normalization at the pill boundary, not the data layer.** 83 places keep their existing `nice`/`overrated` keys; the pill maps to `nice-if-nearby`/`overhyped` for display. Bidirectional-safe — `VERDICTS[p.verdict]` lookups everywhere else still work unchanged. Echoes [[feedback_no_schema_drift]] — retrofit at the consumer rather than mutate 83 records.
  - **Hybrid TODAY_PLAN over pure-manual or pure-derive.** Sparse map of curated days; missing days fall through gift > venue > first-essential-in-city. No empty placeholders to manage. Echoes [[feedback_state_machine_closure]] — every state has a derivation path out.
  - **Lookbehind regex removed** from `getRealTalk` first-sentence pull — older iOS Safari (≤16.3) chokes on `(?<=...)`. Used `match(/^[^.!?]*[.!?]/)` instead.
  - **CITY_REAL_TALK essays drafted by Claude** (5×~55 words) and presented in chat preview before commit per Dylan's amendment. Voice modeled on Roscioli/Bologna `honest_summary` register (concrete, honest, "skip the X / this is the move").
  - **SVG sprite inlined in index.html** rather than Tabler CDN. Offline-first promise of the PWA matters more than icon polish. 6 outline symbols (monument, building, gift, train, moon, mountain).
- **Hero-image SW pre-cache deferred to v11 by design.** Image background-image references won't pre-cache in v10. The v11 commit adds all 11 hero images to APP_FILES alongside the Hero tile rewrite. Until then, first DURING-phase render needs network for hero images (but DURING phase is 20 days away — fine).
- **iPhone PWA:** delete + re-add in Safari to pick up v9 → v10 cache jump.
- **Queued — Stage 2 / v11 next session:**
  - Hero tile rewrite — 5 states (normal slim 132, gift-day tall 240, move-day AM/PM tall 240, tonight)
  - Priority resolver (gift today > gift tomorrow > move day > first/last in city > headline place)
  - Italian flag 3-line stripe under city-tinted Day numeral
  - Split `renderToday()` → `renderTodayDuring()` / `renderTodayBeforeAfter()` to bypass `.today-section` margin wrapper for the tile grid
  - Scope `.stagger` animation to BEFORE/AFTER only
  - Add 11 hero images to APP_FILES (`sw.js` CACHE → v11)
- **Plan file:** `~/.claude/plans/foamy-foraging-candle.md`

---

## 2026-05-22 — Session ended

- **Shipped this session:** Bologna food expansion (b6 Anna Maria, b7 Da Me, b8 Sorbetteria Castiglione). Coordinates corrected to OSM-geocoded values. `CACHE_NAME` bumped v8 → v9. Pushed in commit `8d2eeca` → Netlify auto-deploys.
- **Side artifact (not in repo):** `design-handoff.md` generated at repo root as a design-brief addendum for Claude Design. Untracked; Dylan will copy out and delete.
- **Queued for next session:**
  - Optional: regenerate `APP-ARCHITECTURE.md` for fresh project-knowledge upload.
  - Stage 5 — Today screen wireframes (happening in chat, not in Claude Code).

---

## 2026-05-22 — Bologna food expansion (b6–b8)

- Bologna food expansion — added b6 Anna Maria (tortellini sit-down), b7 Da Me (tagliatelle al ragù), b8 Sorbetteria Castiglione (gelato). Half-day food angle now properly weighted.
- Coordinates: user-supplied estimates were 75–400m off; corrected to OSM-geocoded values (b6 44.4976/11.3496, b7 44.4973/11.3325, b8 44.4878/11.3482).
- `CACHE_NAME` bumped v8 → v9.

---

## 2026-05-22 — Verona dropped from itinerary

- Verona dropped from itinerary — coworker flagged as overhyped tourist trap. Como → Venice now direct on Jun 24.
- Removed from `CITIES`, `CITY_EMOJI`, `CITY_VIEWS`, `TRIP.dayTrips`, `ROUTE_COORDS.dayTrips`, and the day-trip polyline in `map-shared.js`.
- Hard-deleted places `ver1`–`ver5` in `data-places.js`; updated `tr3` transit note to "Arrive from Lake Como June 24".
- Dropped Juliet's balcony option from the "Sealed With a Kiss" achievement.
- Removed redundant Verona slug fallback in `city.js`.
- Updated `CLAUDE.md` Cities spec line.
- `CACHE_NAME` bumped v7 → v8.

---

## 2026-05-22 — Session ended

- **Shipped this session:** Verona drop (commit `ab111d9`). Verified in Chrome after hard refresh and confirmed deployed on Netlify.
- **Queued for next session:**
  - Optional: regenerate `APP-ARCHITECTURE.md` for fresh project-knowledge upload.
  - Stage 5 — Today screen wireframes (happening in chat, not in Claude Code).

---

## 2026-05-21 — Session ended

- **Shipped this session:** Bologna editorial copy for b1–b5 (verdict / honest_summary / best_for). `CACHE_NAME` bumped v6 → v7. Pushed in commit `ae4cd4f`.
- **Queued for next session:**
  - Verona drop (places, editorial, day-trip wiring).
  - Bologna food expansion: `b6` Anna Maria, `b7` Da Me, `b8` Sorbetteria Castiglione.
  - Stage 5 — Today screen wireframes (composed "Tonight" surface flagged in prior session's "What's next").
- **Project knowledge:** `APP-ARCHITECTURE.md` in project knowledge is stale — regenerate next session for re-upload.

---

## 2026-05-20 — Bologna editorial copy (b1–b5)

- Filled `verdict` / `honest_summary` / `best_for` on all five Bologna places in `data-places.js`.
- Verdict spread: **b2 Sacrario dei Partigiani → `essential`**; **b1 / b3 / b4 / b5 → `worth-it`** (hyphenated to match the `VERDICTS` keys in `data-trip.js`; Dylan's draft used `"worth it"` with a space — normalized).
- Removed the stale "verdict / honest_summary / best_for left empty pending Dylan's editorial pass" comment above b1.
- `CACHE_NAME` bumped v6 → v7 per CLAUDE.md cache-busting convention.

---

## Where we are

- Last commit: **Item 1 — unify bookings + registry gifts (Path B); add pasta gift; day-of callout + detail-page gift surface**. Pushed to origin → Netlify auto-deploys.
  - **Unified entries**: `BOOKINGS` (venues) and `GIFTED_EXPERIENCES` (registry gifts) now merge at render time via `source: 'venue' | 'registry-gift'` discriminator. New `getAllEntries()` and `getEntryStatus(entry)` helpers in `bookings.js` are the single source of truth.
  - **State storage** in `italy-bookings-v1` is now mixed-shape: booleans for venues (legacy compatible, no migration code), `{ status: 'voucher-only' | 'scheduled' | 'completed' }` objects for gifts.
  - **Auto-transition** `scheduled` → `completed` is **computed at read time** in `getEntryStatus`, not stored — when `entry.date < today`. No UI affordance needed.
  - **Dropped** overlapping BOOKINGS entries: `bk-colosseum` (owned by `gift-1`) and `bk-gondola` (owned by `gift-2`). Orphan boolean state from prior installs is inert.
  - **Added `gift-3`** — Rome pasta-making class. Previously had zero representation in code.
  - **Evolved gift schema**: `source`, `giver`, `date`, `time`, `duration`, `bookingStatus`, `confirmationUrl` (plus existing `id`, `title`, `city`, `icon`, `description`, `linkedPlaces`, `notes`). `linkedPlaces` stays a **plural array** — Colosseum tour spans `['l1','l6']`, not a single ref.
  - **Three new surfaces**: `renderTodayGiftCallout(phase)` on Today (DURING only, today's gift = pulsing flag-gradient card, tomorrow's gift = softer giallo card); place-detail gift callout between verdict and Real Talk; voucher-only escalating reminder in `getSmartSuggestions()` (yellow > 10 days out, red ⚠️ ≤ 10 days).
  - **Bookings page**: three groups now — 🎁 Wedding Gift Experiences (top), 🔴 Book NOW, 🟡 Book Soon. New `buildGiftCard()` distinct from `buildBookingCard()`.
  - **`isPlaceBooked(placeId)`** in `today.js` now also checks gift `linkedPlaces` with `scheduled`/`completed` status — the "✓ Booked" badge for Colosseum (l1) survives the schema change.
  - **`addDaysISO(iso, n)`** small date helper added to `helpers.js`.
  - CSS additions: `.booking-card-gift` + `.gift-status-*` modifiers (components.css), `.detail-gift-callout`, `.today-gift-callout` + today/tomorrow modifiers (pages.css). All from existing Italian-flag tokens.
- Net: 1 entry type unified, 2 duplicate entries removed, 1 missing gift surfaced, 3 new contextual surfaces, mixed-shape state with no migration.
- **Data inputs Dylan still needs to supply** (the plumbing is built, the surfaces are silent until):
  - Real `date` + `time` per gift voucher (gates the Today day-of callout)
  - `giver` names per gift (renders gracefully as "A gift from …" until set)
  - `confirmationUrl` per voucher (optional; link hidden when empty)
  - To promote a gift to `scheduled`: set `bookingStatus: 'scheduled'` in `data-trip.js` once date is confirmed. Auto-transitions to `completed` after `date` passes.
- Planning context:
  - `~/.claude/plans/decisions-on-your-open-deep-cat.md` — Path B plan (this session)
  - `~/.claude/plans/let-s-pick-up-where-encapsulated-leaf.md` — design-pass plan from prior session
  - `~/.claude/plans/round-a-approved-decisions-joyful-ember.md` — earlier audit (Item 7 type scale + dead-code residual)

---

## Also landed this session — Bologna half-day addendum

Bologna ships as a separate commit on top of Path B (per Dylan's "ship Path B first as one commit, then Bologna as a separate commit" instruction).

- 7th top-level city in `CITIES`, inserted between Florence and Tuscany (travel-order). Not a `subCity` — that field doesn't exist in the codebase; Tuscany and Verona are also top-level cities with `TRIP.dayTrips` entries, which is the consistent pattern.
- Day-trip date: **Friday Jun 19, 2026**. `TRIP.schedule[5]` stays `'Florence'` — `dayTrips` is additive.
- Emoji: **🟥** (la rossa nod). Shape-consistent with Tuscany 🍷 and Verona 💌.
- `CITY_VIEWS['Bologna'] = { center: [44.4949, 11.3426], zoom: 14 }`.
- **No map-city-chip** in `index.html` (matches Tuscany/Verona precedent — both are in CITIES but not chips).
- **No new mood** for political-leaning content — leans on `historic` + editorial copy.
- 5 places added with factual `description` + `category` + `lat`/`lng` only. **Verdict / honest_summary / best_for left empty** for Dylan editorial — comment block in `data-places.js` flags this. JS handles missing fields gracefully (verdict badge skipped, Real Talk section omitted) until Dylan fills them in.
- Places: `b1` Bologna Centrale 1980 Memorial · `b2` Sacrario dei Partigiani at Piazza del Nettuno · `b3` Bologna Rossa walking tour · `b4` Quadrilatero market · `b5` Tamburini.
- `CACHE_NAME` bumped v5 → v6.

---

## What's next

See **2026-05-24 — Today rewrite Stage 1 / v10** above for the active staging — v11 Hero tile is next.

The earlier-planned "Stage 5 Tonight surface (Item 10)" composite for DURING phase is no longer a standalone task; Tonight mode is now Stage 5 / v14 of the Today rewrite (theme flip + Tomorrow's Plan + amber pill, sharing the same DOM as the new tile grid).

---

## Stages queued

1. **Today rewrite v10 / Stage 1** — ✅ SHIPPED 2026-05-24 (commit `30e529a`). Foundations only.
2. **Today rewrite v11 / Stage 2 — Hero tile** — ✅ STAGED 2026-05-24 (this session). DURING-phase Hero with 5-state matrix.
3. **Today rewrite v12 / Stage 3** — Status strip (Day X · Weather · Up Next) + Today's Plan tile + kicker composer + Day numeral. Minute-tick interval cleanup added to Router.
4. **Today rewrite v13 / Stage 4** — Real Talk Today + Home Base + Phrasebook (🇮🇹 stamp) + Saved Places footer. Gate legacy DURING render paths.
5. **Today rewrite v14 / Stage 5** — Tonight mode theme flip + Tomorrow's Plan derivation + amber TONIGHT pill.
6. **Offline / PWA reliability check** — verify v14 cache, all 6 cities' map tiles pre-cache pre-trip, fonts/CSS/hero images load in airplane mode. Target ~7–10 days pre-departure (~Jun 3–6).
7. **Dylan's `data-places.js` dedupe homework** (21 entries, Nathan-rec pattern). Manual edit; no CC dependency.
8. (Defer to post-trip) **Image WebP encoding** (would shave another 30-40% on top of current JPEG q80 — skip until post-trip), **Item 9 place-card noise reduction**, **Item 12 strip multi-trip support**.

**Obsoleted by the Hairline Editorial pass:** Stage 4 dark/light toggle (Tonight mode replaces), Stage 6 Italian-flag color sweep (architectural-only flag usage replaces), Stage 7 Imagery sweep (rolled into v10 photo work + v11 hero), Item 8 Lucide icon swap (SVG sprite + Tabler-style outline icons inlined for hero placeholders), Item 11 Saved Places view (replaced by Today footer tile in v13).

**Refusal pattern if Dylan says "ok start [stage]" without seeing the plan:** push back with "let me show you the plan first."

---

## Open threads

### Dylan's homework (no CC action)
- **Side task 1**: notes/source dedupe worksheet (21 entries, all Nathan-rec pattern). Full table in `~/.claude/plans/round-a-approved-decisions-joyful-ember.md`. Dylan applies edits manually to `data-places.js`.

### Deferred dead-code (do NOT touch unless asked)
Dylan explicitly said leave these for a later cleanup pass:
- `.card-featured` (`components.css`) — defined, never applied
- `.achievement-grid` (`pages.css` media query) — referenced, no element has the class
- `.anim-fade-in` (`components.css`) — defined, never applied
- `// 83 curated places` comment (`data-places.js` header) — hand-maintained count
- `--text-3xl` token (`variables.css`) — no current consumer after Stage 3 (was used by dual-countdown). Kept as available type tier; remove if still unused after Stage 5/6.

---

## Held for later (do NOT preemptively start)

- Letter card visual rework (paper texture, wax seal) — picked up by Stage 7 imagery sweep
- Custom illustrations in hero spots — picked up by Stage 7
- Export feature (JSON / PDF) — separate design conversation
- Inline `style=""` purge for non-font-size styles
- Letter writing prompts

---

## Open questions for next session

- **`giver` placeholders** — currently empty strings. Once Dylan supplies real names per gift, drop them into the three `giver:` fields in `data-trip.js`.
- **Gift dates** — empty strings until vouchers confirmed. Day-of callout silently no-ops until set. Once Dylan confirms with providers: set `date` (YYYY-MM-DD) and `time` (HH:mm); promote `bookingStatus` to `'scheduled'`. Auto-completes after the date passes.
- **Stage 5 Tonight surface** — DURING hero gradient at `.hero-during-bg` is still the Stage 3 placeholder (per the earlier design pass). Stage 7 Imagery will swap in real per-city photos. Stage 5 may also restructure the Today layout enough to obviate the placeholder concern.

---

## Decisions made this session worth remembering

These won't be obvious from the diff alone:

- **Path B (merge), not Path A (parallel groups).** The choice to drop `bk-colosseum` + `bk-gondola` and own them via gifts beat keeping them as annotated venue entries. Reason: the duplication was already a maintenance burden, pasta had zero entries anywhere, and the bookings sweep was going to revisit this code regardless.
- **`linkedPlaces` is plural by design.** Colosseum tour realistically touches Colosseum + Roman Forum (`['l1','l6']`). Resist any future urge to collapse to a singular `placeRef`.
- **3-state machine with auto-transition.** `voucher-only → scheduled → completed`. The `scheduled → completed` transition is **computed at read time in `getEntryStatus`** when `entry.date < today`, not stored. No UI affordance needed, no stale "scheduled" gifts after the trip. Dylan's call — and the closure path is what made the 3-state machine viable (a state with no exit is a smell).
- **Mixed state shape in `italy-bookings-v1`** is intentional. Venues: boolean. Gifts: `{ status: '...' }` object. Backward compatible with existing booleans for surviving venue entries; no migration code needed for a single-user app. `getEntryStatus(entry)` handles either shape.
- **"Don't introduce shape drift in one place."** Dylan's directive when reviewing the Bologna `dayTrips` proposal — both existing entries (Tuscany 🍷, Verona 💌) carry `emoji`, so Bologna's `'🟥'` is consistent. Generalizable: check the existing data shape before adding a field; if it's already inconsistent, retrofit rather than add a new variant.
- **"Docs in the same commit as the code change."** Dylan's directive when approving Path B. HANDOFF.md and CLAUDE.md updates ship atomically with the implementation, not as a follow-up cleanup pass.
- **Pasta-making class had zero representation** in code before this commit — exactly the kind of high-emotion moment the app is supposed to anchor and was anchoring nothing. Highest-value reason to do Path B now.
- **No UI affordance to promote a gift** to `scheduled` in v1. Dylan edits `data-trip.js` directly when vouchers confirm. `setGiftStatus(giftId, status)` helper exists in `bookings.js` for a future UI but is not wired to any element yet.
- **iPhone PWA reinstall** still needed for v4 → v5 cache transition. One-time delete + re-add in Safari.

---

## Working norms (Dylan's stated process)

- One item at a time. Propose before doing design work. Summary after each.
- Bump `CACHE_NAME` in `sw.js` on every commit that touches JS or CSS.
- Single commit per item or per "stage of work", not per file. Bundle Stage 1 + Stage 3 because both are "rework Today" work.
- Don't push to `origin/main` without explicit ask — Netlify auto-deploys on push.
- If something found mid-implementation is outside scope, log it here and keep going.
- "ultrathink" keyword from Dylan = think deeper, not different scope.

---

## Process notes from this session

- **Verify CLAUDE.md claims against code before quoting them.** The session-open summary asserted a Verona `CITY_VIEWS` bug that didn't actually exist — Verona was already present at `data-trip.js:49`. Code beats stale notes.
- **The `subCity` field doesn't exist** — when Dylan proposed it for Bologna, the codebase had no precedent. Tuscany/Verona are top-level cities with `TRIP.dayTrips` entries. Bologna follows that pattern. Always check before assuming a new field is "the same pattern as X."
- **Closure-of-state-machine** is a useful sanity check: if a state has no transition out, it's probably wrong. The 3-state gift machine was viable specifically because `scheduled → completed` was computed at read time (not stored, not requiring user action).
- **Mixed shape in storage is fine** when guarded by a single accessor (`getEntryStatus`). The legacy boolean coexists with the object shape; both stay clear in source.
- **The innerHTML security hook intermittently blocks `Edit` calls** (per CLAUDE.md). Retry the same call.
- **Always grep-verify after JS edits**: `grep -l "\.classname" css/*.css` for every new class introduced.

---

## Session close — where we landed (2026-05-20)

**Shipped to origin/main** (Netlify auto-deploys):

- **`c88ef15`** — Path B: unify bookings + registry gifts.
- **`a9eec37`** — Bologna half-day addendum (7th top-level city, 5 places, Jun 19).

**Data inputs pending from Dylan** — plumbing is live, surfaces silent until set:

- **3 gifts in `js/data-trip.js`** (`gift-1` Colosseum tour · `gift-2` Gondola serenade · `gift-3` Pasta-making class): fill in `giver`, `date` (YYYY-MM-DD), `time` (HH:mm) from each voucher. Once a date is locked, promote `bookingStatus: 'voucher-only' → 'scheduled'`. Auto-completes after the date passes.
- **Bologna places `b1`–`b5` in `js/data-places.js`**: editorial copy for `verdict`, `honest_summary`, `best_for`. Today the verdict badge and Real Talk section gracefully skip when these are absent.

**What's next, in order:**

1. **Stage 5 — Tonight surface (Item 10)**. Composed DURING-phase block replacing Smart Suggestion + Don't Miss picks. Highest-leverage trip-readiness item remaining. Start with a proposal, never implementation.
2. **Offline / PWA reliability check**. Verify the v6 cache, all 7 cities' map tiles pre-cache pre-trip, fonts/CSS load in airplane mode. Target ~7–10 days pre-departure (~Jun 3–6).
3. **Dylan's editorial pass on Bologna places** (manual).
4. **Dylan's `data-places.js` dedupe homework** (21 entries, Nathan-rec pattern; manual).
5. Defer to post-trip: Stage 4 dark mode, Stage 6 flag color sweep, Stage 7 imagery, Item 8 Lucide icons, Item 9 place-card noise, Item 11 Saved Places, Item 12 strip multi-trip.

iPhone PWA: delete + re-add in Safari to pick up the v4 → v6 cache jump.
