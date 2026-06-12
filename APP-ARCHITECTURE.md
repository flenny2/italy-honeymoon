# APP-ARCHITECTURE.md

> Architecture reference for the Italy Honeymoon companion app. Descriptive, not
> prescriptive — `CLAUDE.md` holds the working instructions and `HANDOFF.md`
> tracks live session state. This document mirrors the actual current code as of
> service-worker cache `italy-honeymoon-v22`.

## Overview / Purpose

An editorial companion app to **Wanderlog** for a June 13–27, 2026 Italy
honeymoon (Rome → Florence → Lake Como → Venice, with Tuscany and
Pompeii-Amalfi day trips; Bologna is browsable but unscheduled). Wanderlog owns logistics — maps, itinerary,
reservations, GPS, turn-by-turn directions, reviews. This app deliberately does
**not** duplicate that. It is the *content layer*: honest verdict badges,
"Real Story" summaries, source attribution (who recommended a place and why),
mood filtering, time-of-day suggestions, nearby pairings, an Italian phrasebook,
a trip journal, sealed love letters, gamified achievements, tap counters, and a
locked time capsule.

The guiding editorial stance: honest over flattering. Every place answers *why
go, who it's for, how long, overrated or essential, best time, what to pair
nearby*. Features that would overlap Wanderlog (visited tracking, GPS,
directions, live hours, reviews) are intentionally absent.

## Tech Stack

- **No build tools.** No `package.json`, no npm, no framework, no transpile step.
  Plain HTML, CSS, and ES5-style vanilla JS (IIFE modules, `var`, string-name
  function lookup via `window[...]`).
- **Self-hosted for offline-first PWA**: Leaflet 1.9.4 (`lib/`), Playfair Display
  + DM Sans fonts (`fonts/`). No CDN dependencies at runtime.
- **Map tiles** (CARTO `light_all`) require internet on first load; the service
  worker caches them network-first thereafter.
- **Persistence**: browser `localStorage` only (no backend, no accounts).
- **Rendering**: every page builds its DOM via `innerHTML` strings; there is no
  virtual DOM or templating library. Hash-based routing swaps `.page` visibility.
- **Deployment**: `git push origin main` → Netlify auto-deploys
  `github.com/flenny2/italy-honeymoon` to `italy-honeymoon-app.netlify.app`.
- **Approximate size**: ~380 lines HTML, ~3,840 lines CSS (5 files), ~5,400 lines
  JS across 28 files — one of which, `italy-border.js`, is an ~80KB GeoJSON
  literal (Italy map-mask polygon), not hand-written source.

## File Map

```
index.html              Entry point — SVG icon sprite, 17 page shells, map city
                        bar + filter modal (top-level), surprise modal, toast,
                        bottom tab bar, ordered <script> tags.
manifest.json           PWA manifest (name, icons, theme color, display mode).
sw.js                   Service worker — precache APP_FILES + runtime tile cache.
validate-data.js        Manual Node data-invariant checker (not served, not in
                        APP_FILES, not wired to CI). Run `node validate-data.js`.

css/
  variables.css         Italian-flag design tokens (--rosso/--verde/--giallo,
                        --bianco, --cream, --hairline, spacing, type scale).
  base.css              Reset, body, .page/.page-scroll, map container, tab bar,
                        shared utilities, back-button positioning.
  components.css        Cards, buttons, badges, verdict pills, markers, popups,
                        modals, booking + gift cards.
  pages.css             Per-page styles (explore, city, detail, phrasebook,
                        journal, letters, achievements, bookings, stats,
                        settings, capsule, map filter modal).
  today.css             Today-screen "Hairline Editorial" tile system — hero,
                        status strip, plan tile, flat tiles, day numeral, flag
                        stripe, verdict pill, .today-grid--tonight theme flip.

js/  (data layer — must load before consumers)
  italy-border.js       ~80KB GeoJSON literal + addItalyMask(map) map dimming.
  data-places.js        DEFAULT_PLACES (89 entries) + autoTag(), distanceKm(),
                        walkMinutes(), getNearbyPairings().
  data-phrases.js       PHRASES (phrasebook) + JOURNAL_PROMPTS.
  data-hotels.js        HOTELS object keyed by city (incl. neighborhood,
                        walk_time_min).
  data-trip.js          TRIP schedule + dayTrips, CITIES, CITY_EMOJI,
                        CITY_VIEWS, CAT_COLORS/CAT_ICONS, CITY_COLORS,
                        WEATHER_TYPICAL, CITY_REAL_TALK, MOODS, VERDICTS,
                        GIFTED_EXPERIENCES, getTripPhase(), getTodayCity().
  data-achievements.js  ACHIEVEMENTS (34 incl. platinum), RARITY,
                        COUNTER_TYPES, COUNTER_ACHIEVEMENTS,
                        ACHIEVEMENT_CATEGORIES.
  data-today-plan.js    TODAY_PLAN (sparse manual day overrides — currently
                        empty, all days derive) + TRANSITS (move-day train/
                        arrival notes, sparse).

js/  (core)
  storage.js            Storage module — ALL localStorage read/write, key
                        registry, default shapes, counter + achievement logic.
  helpers.js            CONFIG constants, HIDDEN_CATEGORIES, isVisiblePlace(),
                        ROUTE_COORDS, date formatters, addTileLayer(),
                        minutesUntil/formatRelativeTime, getRomeNow(),
                        _readMockParams() localhost QA harness.
  hero-images.js        HERO_IMAGES registry + getHeroBackground() resolver +
                        SVG-sprite placeholder fallback.
  today-plan.js         Today-screen derivation: getTimedItemsForDate (merges
                        TODAY_PLAN + scheduled gifts + date-anchored places),
                        getTodayHeadlinePlace, getUpNext, getTomorrowHeadlinePlace,
                        getPhraseOfDay, getTonightMode, getRealTalk.
  components/
    verdict-pill.js     renderVerdictPill() — maps verdict key to pill markup,
                        normalizes nice→nice-if-nearby / overrated→overhyped at
                        the display boundary (no data migration).
  router.js             Hash-based Router (routes table, handleRoute, tab sync,
                        Today minute-tick teardown hook).
  map-shared.js         drawTravelRoute(map, opts), addHotelMarkers(map, opts) —
                        shared by Today mini map and full Map tab.
  animations.js         showToast, openModal, closeModal, fireConfetti.
  app.js                Init (DOMContentLoaded → seedSettingsIfEmpty + Router.init
                        + SW registration), renderExplore/renderMore/renderCapsule/
                        renderFavorites, full Map tab logic + filter system.

js/  (feature modules)
  today.js              Today home screen — phase router, hero state matrix,
                        status strip, plan tile, editorial tiles, favorites,
                        counter chips, buildPlaceCard, toggleSave, isPlaceBooked.
  city.js               City detail page — mini map, hotel card, mood filter.
  detail.js             Place detail — verdict, source, moods, summary, gift
                        callout, nearby pairings, favorite toggle.
  phrasebook.js         Italian phrase categories + pronunciation.
  journal.js            Trip journal entries with photo support.
  letters.js            Sealed, date-locked love letters.
  achievements.js       Gamification render + unlock conditions + platinum logic.
  surprise.js           "Surprise Me" random-place modal.
  bookings.js           BOOKINGS venues + getAllEntries()/getEntryStatus()/
                        getBookingStats() unified-entry helpers, gift cards.
  suggestions.js        getSmartSuggestions() — time-of-day, booking reminders,
                        activity-balance tips, voucher-only escalation.
  settings.js           Names, wedding date, hometown, departure airport, photo.
  counters.js           Tap counters (gelato/pasta/etc.) — Today chip row +
                        Stats page steppers.

lib/                    Self-hosted Leaflet 1.9.4 (CSS, JS, marker images).
fonts/                  Self-hosted Playfair Display + DM Sans (.ttf + fonts.css).
img/                    PWA icons (192/512) + img/heroes/ photos.
```

> **Note vs CLAUDE.md file map**: the actual `js/` directory holds **28** files,
> not the 24 CLAUDE.md cites. The extras are the Today-redesign additions —
> `data-today-plan.js`, `hero-images.js`, `today-plan.js`,
> `components/verdict-pill.js` — plus the `css/today.css` stylesheet and the
> `#favorites` page/route. CLAUDE.md's map predates that redesign. (Reported, not
> changed — this doc reflects the code, CLAUDE.md is the authority on intent.)

## Navigation / Routing

Bottom tab bar with 5 tabs. `Router` (`js/router.js`) reads `location.hash`,
hides all `.page` elements, shows `#page-{name}`, syncs the active tab, and calls
the render function by name (`window[route.render]`) so functions need not exist
at module-load time. Default hash is `today`. Param routes use `#page/param`
(e.g. `#city/rome`, `#place/r1`). Leaving `#today` tears down the live "Up Next"
minute-tick.

| Tab    | Page             | Hash             | Render fn (highlights tab) |
|--------|------------------|------------------|----------------------------|
| Today  | Home screen      | `#today`         | `renderToday` (today)      |
| Journal| Daily journal    | `#journal`       | `renderJournal` (journal)  |
| Map    | Full-screen map  | `#map`           | `renderFullMap` (map)      |
| Letters| Love letters     | `#letters`       | `renderLetters` (letters)  |
| More   | Feature hub      | `#more`          | `renderMore` (more)        |
| More   | Explore cities   | `#explore`       | `renderExplore` (more)     |
| More   | Favorites        | `#favorites`     | `renderFavorites` (more)   |
| More   | City detail      | `#city/{slug}`   | `renderCity` (more)        |
| More   | Place detail     | `#place/{id}`    | `renderDetail` (more)      |
| More   | Phrasebook       | `#phrasebook`    | `renderPhrasebook` (more)  |
| More   | Bookings         | `#bookings`      | `renderBookings` (more)    |
| More   | Achievements     | `#achievements`  | `renderAchievements` (more)|
| More   | Stats            | `#stats`         | `renderStats` (more)       |
| More   | Settings         | `#settings`      | `renderSettings` (more)    |
| More   | Time Capsule     | `#capsule`       | `renderCapsule` (more)     |

The map **filter modal** is a top-level element (sibling of `#page-map`, not
inside it) and the **surprise modal** and **toast** are likewise top-level, so
they escape `#page-map`'s stacking context and render above the tab bar.

## Data Flow

```
DEFAULT_* data consts (data-*.js)
        ↓
Storage.getPlaces() → localStorage 'italy-places-v3' or DEFAULT_PLACES (+saved:false)
        ↓
DOMContentLoaded → seedSettingsIfEmpty() → Router.init() → handleRoute()
        ↓
Router resolves hash → window[renderFn](param)
        ↓
Render fn reads Storage + data consts, builds innerHTML string, injects it
        ↓
User interaction → Storage.savePlaces()/saveJournalEntry()/incrementCounter()/… → re-render
```

Render functions are idempotent and re-readable: state lives only in
`localStorage` and a handful of module-scope variables (e.g. `mapActiveFilters`,
the Leaflet map instances). There is no central store or event bus — re-render is
manual, and several handlers (star-save, counter chips, Up Next tick) patch the
DOM in place to preserve scroll position rather than re-rendering the whole page.

## Key Systems

- **`autoTag(place)`** (`data-places.js`) — infers mood tags (foodie, romantic,
  budget, evening, historic, outdoor, quick-bite) from category + description
  keywords at render time. Tags are never stored on the place object.
- **`getTripPhase()`** (`data-trip.js`) — compares today against
  `TRIP.startDate`/`endDate`, returns `{phase:'before', daysUntil}` /
  `{phase:'during', day, city, date, dayTrip}` / `{phase:'after', daysSince}`.
  Honors the localhost `?date=`/`?phase=during` mock harness for QA. Drives the
  entire Today screen's branch (before / during / after) and headline logic.
- **`getSmartSuggestions(city)`** (`suggestions.js`) — composes contextual cards:
  time-of-day nudges, booking reminders, activity-balance tips, and an
  escalating voucher-only gift reminder (yellow >10 days out, red ≤10).
- **`getNearbyPairings(place, maxKm)`** (`data-places.js`) — finds visible places
  within `CONFIG.NEARBY_PAIRING_MAX_KM` (600m default) via `distanceKm()`, with
  walk times from `walkMinutes()` (`CONFIG.WALKING_SPEED_M_PER_MIN`).
- **Verdict badges** — `essential`, `worth-it`, `nice`, `overrated`,
  `hidden-gem` defined in `VERDICTS` (`data-trip.js`). Display labels normalize
  `nice`→"Nice If Nearby" and `overrated`→"Overhyped"; `renderVerdictPill()`
  applies that mapping at the display boundary so the 89 records keep their
  original keys (no migration).
- **Achievements + counters** — 34 achievements across 5 rarity tiers (common,
  uncommon, rare, legendary, platinum). Platinum ("Amore Infinito") auto-unlocks
  when all non-platinum achievements complete. Tap counters
  (gelato/pasta/pizza/espresso/cappuccino/wine) live in
  `Storage.incrementCounter(type, city)`, which auto-unlocks achievements at
  `COUNTER_ACHIEVEMENTS` thresholds and fires confetti + a toast.
  `decrementCounter()` floors at 0 and splices history but never revokes earned
  achievements. Adding a counter type requires edits in three places:
  `DEFAULT_COUNTERS` (storage.js) + `COUNTER_TYPES` + `COUNTER_ACHIEVEMENTS`
  (data-achievements.js).
- **Unified bookings + gifts** — `BOOKINGS` (venue reservations, `bookings.js`)
  and `GIFTED_EXPERIENCES` (registry gifts, `data-trip.js`) merge at render time
  via a `source: 'venue' | 'registry-gift'` discriminator. `getAllEntries()` is
  the single source of truth for the merged list; `getEntryStatus(entry)` returns
  `'booked'|'pending'` for venues and `'voucher-only'|'scheduled'|'completed'`
  for gifts. The `scheduled → completed` transition is **computed at read time**
  when `entry.date < today`, never stored. Three consumers: `renderBookings()`
  (3 groups — Gifts / Now / Soon), `getBookingStats()`, and `isPlaceBooked()` in
  `today.js`. Gifts also surface on Today (day-of / day-before callout), on the
  place-detail page, and as a suggestion reminder.
- **Settings + first-run seeder** — `userName`, `partnerName`, `petName`,
  `weddingDate`, `hometown`, `departureAirport`, `couplePhoto` (`settings.js`,
  stored in `italy-settings-v1`). `seedSettingsIfEmpty()` (`app.js`) detects first
  run via the **raw** `localStorage.getItem('italy-settings-v1') !== null` check
  (not `Storage.getSettings()`, which returns merged defaults even when the key is
  absent) and seeds Dylan/Hope/wedding-date/hometown/airport. Settings wire into
  Today, Letters, Journal, and the Capsule salutation.
- **Map filter modal + stacking-context fix** — top-level element to escape
  `#page-map`'s stacking context. Multi-select OR logic: `mapActiveFilters[]`,
  `toggleMapFilter()`, `applyActiveFilters()`, `FILTER_TESTS` matchers (by
  verdict, by category, by mood via `autoTag`). "By Source" buttons are
  **generated** by `renderSourceFilterButtons()` (`app.js`) from the distinct
  `source` values present in visible places — exact-match `src:<source>` tokens
  registered into `FILTER_TESTS` at render, `SOURCE_FILTER_META` cosmetics — so
  a button exists only if data backs it and a dead filter can never blank the
  map. Markers add/remove from the Leaflet layer.
- **Walking radius** — hotel-centered 8-min (560m) and 15-min (1050m) circles
  drawn on city-zoom in the full map (`app.js`, radii from `CONFIG`).
- **Hidden categories** — `transit`, `pharmacy`, `restroom` filtered from all
  user-facing lists and maps via `isVisiblePlace()` (`helpers.js`).
- **Today "Hairline Editorial" screen** — the DURING phase composes a tile grid
  (`today.css`): hero (5-state resolver: gift-today / gift-tomorrow / move-AM /
  move-PM / normal), a status strip (Day numeral + flag stripe, typical-June
  weather stub, live Up Next), a plan tile, Real Talk / Home Base / Phrasebook
  editorial tiles, a Favorites footer, and a counter chip row. After 19:00
  Europe/Rome (`getTonightMode`) it flips to an ink "Tonight" theme with
  Tomorrow's Plan and an amber TONIGHT pill. BEFORE/AFTER phases use a separate
  legacy section layout.

## Place-Object Schema

Each place: `id`, `name`, `city`, `category`, `lat`, `lng`, `description`,
`source`, `verdict`, `honest_summary`, `best_for`. Optional: `notes`,
`duration_min`, `cost`, `booking`, `best_time`, `transport`, `accessibility`,
`hours_close`, and the date-anchor pair `scheduled_date` (ISO `YYYY-MM-DD`) +
`scheduled_time` (24h `HH:MM`) — a confirmed timed booking carries **both or
neither** (validator-enforced); anchored places feed Today's Plan / Up Next on
that date. Tags are computed by `autoTag()` at render time,
not stored; `saved` is added at runtime by `Storage.getPlaces()`.

- **Categories**: dining, landmark, hotel, activity, viewpoint, transit,
  pharmacy, restroom (last three are hidden).
- **Cities**: Rome, Florence, Bologna, Tuscany, Lake Como, Venice. Tuscany is
  a dated day-trip city — top-level entry in `CITIES` with a `TRIP.dayTrips`
  mapping for the ISO date. Bologna is a browsable unscheduled maybe (top-level
  `CITIES` entry, no `dayTrips` date). There is no `subCity` field.

## Storage / localStorage Model

All keys are owned by the `Storage` module (`js/storage.js`); nothing reads
`localStorage` directly except the first-run check in `seedSettingsIfEmpty()`.

| Key                    | Shape                                                        |
|------------------------|-------------------------------------------------------------|
| `italy-places-v3`      | Array of place objects with runtime `saved` flag.           |
| `italy-journal-v1`     | Array of journal entries (`id`, `timestamp`, text, photo).  |
| `italy-letters-v1`     | Array of letters; text base64-"sealed", `unlockDate` gates. |
| `italy-achievements-v1`| Map `{ [id]: { unlocked, unlockedAt } }`.                   |
| `italy-capsule-v1`     | `{ locked, lockUntil, sealedAt, snapshot }`.                |
| `italy-settings-v1`    | Settings object (names, wedding date, hometown, photo, …).  |
| `italy-counters-v1`    | `{ gelato, pasta, …: n, history: [...] }`.                  |
| `italy-bookings-v1`    | **Mixed shape** — `true` for venue checklist entries,       |
|                        | `{ status: 'voucher-only'\|'scheduled'\|'completed' }` for  |
|                        | gifts. Reads must go through `getEntryStatus()`.            |

`Storage.resetAll()` clears every key (and re-triggers the settings seeder on the
next reload). Letters are reversibly "sealed" with base64 (`btoa`/`atob`), a
gentle obfuscation, not encryption.

## PWA / Offline Model

`sw.js` implements a **precache + runtime-cache** strategy under a single named
cache (`CACHE_NAME = 'italy-honeymoon-v22'`):

- **install** → `cache.addAll(APP_FILES)` precaches the full app shell: HTML,
  manifest, PWA icons, all 5 CSS files, all 8 self-hosted font `.ttf` files,
  Leaflet CSS/JS/marker images, all data + core + feature JS, and the hero photos
  used by the Today DURING render. Then `skipWaiting()`.
- **activate** → deletes every cache whose name ≠ `CACHE_NAME`, then
  `clients.claim()`.
- **fetch** → map tiles (`basemaps.cartocdn.com`, `tile.openstreetmap.org`) are
  **network-first** with cache fallback (fresh when online, available offline
  after first view). Everything else is **cache-first** with network fallback,
  caching any new `ok` response for next time.

**Cache-busting rule**: the service worker only swaps to a new cache when
`CACHE_NAME` changes. Bump the `vN` suffix on **every commit that touches JS or
CSS** — not only when adding files — or iPhone home-screen installs serve stale
assets. Adding a new JS file requires three edits: the `<script>` tag in
`index.html`, the path in `APP_FILES`, and a `CACHE_NAME` bump. iPhone PWA users
may need to delete and re-add the home-screen app from Safari to pick up a new
service worker.

## Gotchas

- **Script load order matters.** `data-*.js` must load before `storage.js`
  (e.g. `COUNTER_ACHIEVEMENTS` is read inside `Storage.incrementCounter`).
  `helpers.js`, `hero-images.js`, `today-plan.js`, and `verdict-pill.js` load
  before the feature modules that consume them. `app.js` loads last and wires
  init.
- **Stacking context.** `#page-map` is `position: fixed; z-index: 1` and creates
  a stacking context; modals inside it cannot render above `#tab-bar`
  (`z-index: 100`). The map filter modal, surprise modal, and toast are therefore
  top-level. Any new map-page modal must also be top-level.
- **Safe-area insets.** The map city bar / filter button use
  `env(safe-area-inset-top)`; the tab bar uses `env(safe-area-inset-bottom)`.
  Fixed UI near screen edges must account for these.
- **innerHTML everywhere.** The whole app renders via `innerHTML`. A security
  hook may intermittently *block* Write/Edit calls containing `innerHTML` —
  retry the same operation. Expected noise for an offline app with no external
  input.
- **Mixed `italy-bookings-v1` state.** Booleans for venues, `{ status }` objects
  for gifts. Never read raw state to decide "is this done?" — use
  `getEntryStatus(entry)`, which applies the gift `scheduled → completed`
  auto-transition that is not stored.
- **First-run detection.** Detect first run with the raw localStorage key check,
  not `Storage.getSettings()` (which returns merged defaults even when the key is
  absent).
- **Verdict normalization at the pill, not the data.** Records keep `nice` /
  `overrated`; the pill maps to display strings. Don't migrate the 89 records.
- **Input font-size ≥ 16px.** Every `<input>`/`<textarea>` uses 16px (and
  ~44–48px min-height) so iOS Safari doesn't auto-zoom on focus. Preserve when
  adding forms.
- **Back buttons.** Render a bare
  `<button class="back-btn" onclick="Router.navigate('#parent')">← Parent</button>`;
  CSS pins it fixed bottom-left and `.page:has(.back-btn) .page-scroll` adds 80px
  bottom padding. Don't wrap it.
- **Time-capsule unlock date.** `CONFIG.ANNIVERSARY_DATE = '2027-06-27'` is one
  year after the last night in Italy — *not* the wedding anniversary
  (2027-06-06). Copy says "one year since Italy", never "anniversary".
- **`validate-data.js` is manual.** A standalone Node checker (loads the data
  files via `vm`, asserts invariants, errors fail / warnings pass) — it is not
  served, not in `APP_FILES`, and not wired to CI. Run it after data edits.
- **Localhost-only QA harness.** `?date=YYYY-MM-DD[THH:MM]` and `?phase=during`
  (and the older `?tonight=1`) are honored only on `localhost`/`127.0.0.1` via
  `_readMockParams()`; production traffic is unaffected. They drive
  `getTripPhase()` and `getRomeNow()` for previewing any trip day/clock.
