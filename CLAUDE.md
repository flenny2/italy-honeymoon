# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Session state lives in `HANDOFF.md`.** Read it before starting any task —
> it tracks the live cursor (last commit, queued items, deferred decisions,
> open questions). CLAUDE.md is the stable spec; HANDOFF.md is what changed.

## What This Is

Editorial companion app to Wanderlog for a June 2026 Italy honeymoon. Wanderlog handles logistics (maps, itinerary, reservations, GPS, directions, reviews). This app provides the curated content layer: honest summaries, verdict badges, source attribution, mood filtering, smart suggestions, nearby pairings, a phrasebook, journal, love letters, achievements, and a time capsule.

## Development

**No build tools.** No package.json, no npm, no framework. Vanilla HTML/CSS/JS.

- Entry point: `index.html` — edit it and files in `js/`, `css/`
- Open in browser to test (`file://` works; local HTTP server needed for service worker)
- Leaflet and fonts are self-hosted in `lib/` and `fonts/` for offline PWA support
- Map tiles require internet on first load; cached by service worker after that

**localStorage keys** (all managed by `Storage` module in `js/storage.js`):
- `italy-places-v3` — places with saved/starred status
- `italy-journal-v1`, `italy-letters-v1`, `italy-achievements-v1`, `italy-capsule-v1`, `italy-settings-v1`, `italy-counters-v1`, `italy-bookings-v1`

**Adding a new JS file**: three places to update — (1) `<script>` tag in `index.html`, (2) path in `APP_FILES` array in `sw.js`, (3) bump `CACHE_NAME` in `sw.js` so the new SW installs.

**Bumping `CACHE_NAME` in `sw.js`**: bump on **every commit that touches JS or CSS**, not only when adding files. The PWA service worker only swaps to a new cache when the name changes; otherwise iPhone home-screen installs serve stale assets and the user has to manually delete and re-add the app from Safari. Convention: increment the `vN` suffix (`italy-honeymoon-v3` → `v4` etc.).

**Script load order matters**: `data-*.js` files must load before `storage.js` (e.g. `COUNTER_ACHIEVEMENTS` is read inside `Storage.incrementCounter`). Put new data constants in `data-*.js`.

**Deployment**: `git push origin main` → Netlify auto-deploys from `github.com/flenny2/italy-honeymoon` to `italy-honeymoon-app.netlify.app` within ~60s. iPhone PWA users may need to delete and re-add the home-screen app from Safari to pick up a new service worker.

## Architecture

Multi-file PWA with hash-based routing. ~325 lines HTML, ~2,800 lines CSS (4 files), ~4,100 lines JS (24 files; one of those — `italy-border.js` — is an 80KB GeoJSON literal, not source).

### File map

```
index.html              Entry point — page shells, tab bar (map filter modal is top-level, not inside page-map)
manifest.json           PWA manifest
sw.js                   Service worker — caches all assets + map tiles

css/
  variables.css         Italian flag theme (--rosso, --verde, --bianco, etc.)
  base.css              Reset, body, map, tab bar, shared utilities
  components.css        Cards, buttons, badges, modals, markers, popups
  pages.css             Page-specific styles (today, city, detail, phrasebook, settings, stats, etc.)

js/
  data-places.js        DEFAULT_PLACES (83 entries), autoTag(), distanceKm(), walkMinutes(), getNearbyPairings()
  data-trip.js          TRIP schedule, CITIES, CITY_EMOJI, CITY_VIEWS, CAT_COLORS/ICONS, MOODS, VERDICTS, GIFTED_EXPERIENCES, getTripPhase()
  data-hotels.js        HOTELS object keyed by city name
  data-phrases.js       Italian phrasebook data + JOURNAL_PROMPTS
  data-achievements.js  ACHIEVEMENTS (34 incl. platinum), RARITY, COUNTER_TYPES, COUNTER_ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES
  italy-border.js       GeoJSON polygon for Italy map mask (~80KB) + addItalyMask(map)
  storage.js            Storage module — all localStorage read/write, keys defined here
  helpers.js            CONFIG constants, ROUTE_COORDS, HIDDEN_CATEGORIES, isVisiblePlace(), date formatters, addTileLayer()
  router.js             Hash-based Router — maps #page/param to render functions
  map-shared.js         drawTravelRoute(map, opts), addHotelMarkers(map, opts) — shared between today's mini map and full map tab
  animations.js         showToast, openModal, closeModal, fireConfetti
  app.js                Init (DOMContentLoaded → Router.init + SW registration), renderExplore(), renderMore(), renderCapsule(), full map tab logic
  today.js              Today home screen — countdown, hotel, mini map, bookings, phrase, gifts, suggestions, picks, buildPlaceCard, toggleSave
  city.js               City detail page — mini map, hotel card, mood filter, place cards
  detail.js             Place detail — verdict, source, moods, honest summary, visit info, notes, nearby pairings
  suggestions.js        getSmartSuggestions() — time-of-day, booking reminders, balance tips
  bookings.js           Booking checklist with urgency tracking (state via Storage.getBookings/saveBookings)
  phrasebook.js         Italian phrase categories and pronunciation
  journal.js            Trip journal entries with photo support
  letters.js            Sealed love letters, date-locked reveal
  achievements.js       Gamification with unlock conditions
  surprise.js           "Surprise Me" random place modal
  settings.js           Names, wedding date, hometown, photo
  counters.js           Tap counters (gelato/pasta/etc.) on Today + dedicated Stats page

lib/                    Self-hosted Leaflet 1.9.4 (CSS, JS, marker images)
fonts/                  Self-hosted Playfair Display + DM Sans
img/                    PWA icons (192px, 512px)
```

### Navigation

Bottom tab bar with 5 tabs. Router in `js/router.js` maps `location.hash` to render functions.

| Tab | Page | Hash | Render function |
|-----|------|------|-----------------|
| Today | Home screen | `#today` | `renderToday()` |
| Journal | Daily journal | `#journal` | `renderJournal()` |
| Map | Full-screen map | `#map` | `renderFullMap()` |
| Letters | Love letters | `#letters` | `renderLetters()` |
| More | Feature hub | `#more` | `renderMore()` |
| More | Explore cities | `#explore` | `renderExplore()` |
| More | City detail | `#city/{slug}` | `renderCity()` |
| More | Place detail | `#place/{id}` | `renderDetail()` |
| More | Phrasebook | `#phrasebook` | `renderPhrasebook()` |
| More | Bookings | `#bookings` | `renderBookings()` |
| More | Achievements | `#achievements` | `renderAchievements()` |
| More | Stats | `#stats` | `renderStats()` |
| More | Settings | `#settings` | `renderSettings()` |
| More | Time Capsule | `#capsule` | `renderCapsule()` |

### Data flow

```
Storage.getPlaces() → DEFAULT_PLACES or localStorage
     ↓
Router.init() → handleRoute() → calls page render function
     ↓
Render function reads Storage, builds innerHTML
     ↓
User interaction → Storage.savePlaces() / Storage.saveJournalEntry() / etc.
```

### Key systems

- **`autoTag(place)`** (`data-places.js`) — infers mood tags from category + description keywords
- **`getSmartSuggestions(city)`** (`suggestions.js`) — time-of-day, booking reminders, activity balance tips
- **`getNearbyPairings(place, maxKm)`** (`data-places.js`) — finds places within 600m with walk times
- **`getTripPhase()`** (`data-trip.js`) — returns `{phase: 'before'|'during'|'after', ...}` to drive contextual UI
- **Verdict badges**: essential, worth-it, nice, overrated, hidden-gem — defined in `VERDICTS` (`data-trip.js`)
- **Achievements**: 34 achievements (33 + platinum) with 5 rarity tiers (common, uncommon, rare, legendary, platinum). Platinum ("Amore Infinito") auto-unlocks when all non-platinum achievements are complete — logic in `doUnlock()` in `achievements.js`
- **Counters** (`Storage.incrementCounter(type, city)` in `storage.js`): auto-unlocks achievements at thresholds in `COUNTER_ACHIEVEMENTS`. **Adding a new counter type requires edits in 3 places**: `DEFAULT_COUNTERS` (storage.js) + `COUNTER_TYPES` + `COUNTER_ACHIEVEMENTS` (data-achievements.js). UI chips on Today (during trip only) via `renderCounterChips()` in `counters.js`; dedicated stats page at `#stats`.
- **Settings screen** (`#settings`, `settings.js`): `userName`, `partnerName`, `petName`, `weddingDate`, `hometown`, `departureAirport`, `couplePhoto`. Wired into Today (hero + dual countdown), Letters (From/To prefill + subtitle), Journal (subtitle), Capsule (salutation).
- **First-run seeder** (`seedSettingsIfEmpty()` in `app.js`): detects first run via raw `localStorage.getItem('italy-settings-v1') !== null`. **Do not use `Storage.getSettings()` to detect first run** — it returns merged defaults even when the key is absent.
- **Map filter modal** is a top-level element (not inside `#page-map`) to escape its stacking context and render above the tab bar. Uses multi-select toggle with OR logic (`mapActiveFilters[]`, `toggleMapFilter()`, `applyActiveFilters()`)
- **Walking radius**: hotel-centered 8min/15min circles shown on city zoom (`app.js`)
- **Hidden categories**: transit, pharmacy, restroom are filtered from UI via `isVisiblePlace()` in `helpers.js`

## Gotchas

- **Stacking context**: `#page-map` creates a stacking context (`position: fixed; z-index: 1`). Modals inside it cannot render above `#tab-bar` (`z-index: 100`). The map filter modal was moved outside `#page-map` for this reason. Any new modals on the map page must also be top-level.
- **Safe area insets**: Map city bar and filter button use `env(safe-area-inset-top)`. Tab bar uses `env(safe-area-inset-bottom)`. Any fixed-position UI near screen edges must account for these.
- **innerHTML pattern**: The entire app uses innerHTML for rendering. A security hook will intermittently **block** (not just warn about) Write/Edit calls containing `innerHTML` — retry the exact same operation and it usually succeeds on the second try. This is expected noise for a personal offline app with no external input.
- **Time capsule unlock date**: `CONFIG.ANNIVERSARY_DATE = '2027-06-27'` is one year after the last night in Italy, **not** the wedding anniversary (which is 2027-06-06). Copy consistently uses "one year since Italy" — never "anniversary".
- **Back buttons**: render with a bare `<button class="back-btn" onclick="Router.navigate('#parent')">← Parent</button>`. CSS pins it fixed bottom-left above the tab bar; `.page:has(.back-btn) .page-scroll` automatically adds 80px bottom padding. Don't wrap in custom containers.
- **Input font size minimum**: every `<input>` and `<textarea>` uses `font-size: 16px` (and ~44–48px min-height). iOS Safari auto-zooms on focus when an input's font-size is <16px, which is jarring on a mobile-only PWA. Preserve this invariant when adding new forms.
- **Place card verdict styling**: `buildPlaceCard()` in `today.js` adds `place-card-{verdict}` class. CSS in `components.css` transforms the card appearance based on verdict.
- **Star save (`toggleSave` in `today.js`)**: updates the tapped element in-place (no full re-render), preserving scroll position. Detects whether the event came from a `.place-card-star` or detail-page `.btn` and updates accordingly.

## Place Object Schema

Each place has: `id`, `name`, `city`, `category`, `lat`, `lng`, `description`, `source`, `verdict`, `honest_summary`, `best_for`. Optional: `notes` (small italic line shown under description in detail), `duration_min`, `cost`, `booking`, `best_time`, `transport`, `accessibility`, `hours_close`. Tags are computed at render time by `autoTag()`, not stored. `saved` is added at runtime.

Categories: dining, landmark, hotel, activity, viewpoint, transit, pharmacy, restroom.
Cities: Rome, Florence, Tuscany, Lake Como, Verona, Venice.

## Design Principles

- Every place answers: why go, who it's best for, how long, overrated or essential, best time, what to pair nearby
- Surface WHO recommended a place and WHY (source attribution is a key feature)
- Honest over flattering — verdict badges and "Real Story" summaries, not tourist brochure language
- This is an editorial layer, not a logistics tool — don't duplicate what Wanderlog does
- Features removed for Wanderlog redundancy (visited tracking, GPS, directions, hours display, reviews) should stay removed
