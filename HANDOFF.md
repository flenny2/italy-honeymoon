# Session Handoff

> Live work-in-progress state. CLAUDE.md is the stable spec; this is the
> "what's the cursor on" doc. Update it after every session — header date
> below should always reflect the last touch.

**Last updated:** 2026-05-29
**Branch:** `main`. v10–v13 shipped + visually QA'd (v13 full screen confirmed in-browser). **Favorites feature staged** on top of v13 (rename "Saved"→"Favorites" + new #favorites view). Only v14 (Tonight mode) of the Today redesign remains.

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
- `DAY_TRIP_LINE_COORDS` (`map-shared.js:11-15`) — magic coords belong with `ROUTE_COORDS`
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
