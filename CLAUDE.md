# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Editorial companion app to Wanderlog for a June 2026 Italy honeymoon. Wanderlog handles logistics (maps, itinerary, reservations, GPS, directions, reviews). This app provides the curated content layer: honest summaries, verdict badges, source attribution, mood filtering, smart suggestions, nearby pairings, a phrasebook, journal, love letters, achievements, and a time capsule.

## Development

**No build tools.** No package.json, no npm, no framework. Vanilla HTML/CSS/JS.

- Entry point: `index.html` — edit it and files in `js/`, `css/`
- Open in browser to test (`file://` works; local HTTP server needed for service worker)
- Leaflet and fonts are self-hosted in `lib/` and `fonts/` for offline PWA support
- Map tiles require internet on first load; cached by service worker after that
- Legacy file `italy-planner.html` is **gitignored** — do not edit it

**localStorage keys** (all managed by `Storage` module in `js/storage.js`):
- `italy-places-v3` — places with saved/starred status
- `italy-journal-v1`, `italy-letters-v1`, `italy-achievements-v1`, `italy-capsule-v1`, `italy-settings-v1`

## Architecture

Multi-file PWA with hash-based routing. ~300 lines HTML, ~780 lines CSS (4 files), ~1,300 lines JS (22 files).

### File map

```
index.html              Entry point — page shells, tab bar, map filter modal
manifest.json           PWA manifest
sw.js                   Service worker — caches all assets + map tiles

css/
  variables.css         Italian flag theme (--rosso, --verde, --bianco, etc.)
  base.css              Reset, body, map, tab bar, shared utilities
  components.css        Cards, buttons, badges, modals, markers, popups
  pages.css             Page-specific styles (today, city, detail, phrasebook, etc.)

js/
  data-places.js        DEFAULT_PLACES (57 entries), autoTag(), distanceKm(), getNearbyPairings()
  data-trip.js          TRIP schedule, CITIES, CITY_EMOJI, CITY_VIEWS, CAT_COLORS/ICONS, MOODS, VERDICTS, GIFTED_EXPERIENCES, getTripPhase()
  data-hotels.js        HOTELS object keyed by city name
  data-phrases.js       Italian phrasebook data
  data-achievements.js  ACHIEVEMENTS definitions
  italy-border.js       GeoJSON polygon for Italy map mask (~80K)
  storage.js            Storage module — all localStorage read/write, keys defined here
  helpers.js            CONFIG constants, HIDDEN_CATEGORIES, isVisiblePlace(), date formatters, addTileLayer()
  router.js             Hash-based Router — maps #page/param to render functions
  app.js                Init (DOMContentLoaded → Router.init + SW registration), renderExplore(), renderMore(), renderCapsule(), full map tab logic
  today.js              Today home screen — countdown, hotel, mini map, bookings, phrase, gifts, suggestions, picks
  city.js               City detail page — mini map, hotel card, mood filter, place cards by category
  detail.js             Place detail — verdict, source, moods, honest summary, visit info, nearby pairings
  suggestions.js        getSmartSuggestions() — time-of-day, booking reminders, balance tips
  bookings.js           Booking checklist with urgency tracking
  phrasebook.js         Italian phrase categories and pronunciation
  journal.js            Trip journal entries
  letters.js            Sealed love letters, date-locked reveal
  achievements.js       Gamification with unlock conditions
  surprise.js           "Surprise Me" random place modal
  animations.js         Shared animation utilities

lib/                    Self-hosted Leaflet 1.9.4 (CSS, JS, marker images)
fonts/                  Self-hosted Playfair Display + DM Sans
img/                    PWA icons (192px, 512px)
```

### Navigation

Bottom tab bar with 5 tabs. Router in `js/router.js` maps `location.hash` to render functions.

| Tab | Page | Hash | Render function |
|-----|------|------|-----------------|
| Today | Home screen | `#today` | `renderToday()` |
| Map | Full-screen map | `#map` | `renderFullMap()` |
| Explore | City grid | `#explore` | `renderExplore()` |
| Explore | City detail | `#city/{slug}` | `renderCity()` |
| Explore | Place detail | `#place/{id}` | `renderDetail()` |
| Phrases | Phrasebook | `#phrasebook` | `renderPhrasebook()` |
| More | Feature hub | `#more` | `renderMore()` |
| More | Bookings | `#bookings` | `renderBookings()` |
| More | Journal | `#journal` | `renderJournal()` |
| More | Letters | `#letters` | `renderLetters()` |
| More | Achievements | `#achievements` | `renderAchievements()` |
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
- **Map filters**: filter modal in `index.html`, logic in `app.js` — by verdict, source, type, or mood
- **Walking radius**: hotel-centered 8min/15min circles shown on city zoom (`app.js`)
- **Hidden categories**: transit, pharmacy, restroom are filtered from UI via `isVisiblePlace()` in `helpers.js`

## Place Object Schema

Each place has: `id`, `name`, `city`, `category`, `lat`, `lng`, `description`, `notes`, `source`, `duration_min`, `cost`, `booking`, `best_time`, `transport`, `accessibility`, `verdict`, `honest_summary`, `best_for`. Tags are computed at render time by `autoTag()`, not stored. `saved` is added at runtime.

Categories: dining, landmark, hotel, activity, viewpoint, transit, pharmacy, restroom.
Cities: Rome, Florence, Tuscany, Lake Como, Verona, Venice.

## Design Principles

- Every place answers: why go, who it's best for, how long, overrated or essential, best time, what to pair nearby
- Surface WHO recommended a place and WHY (source attribution is a key feature)
- Honest over flattering — verdict badges and "Real Story" summaries, not tourist brochure language
- This is an editorial layer, not a logistics tool — don't duplicate what Wanderlog does
- Features removed for Wanderlog redundancy (visited tracking, GPS, directions, hours display, reviews, personal notes per place) should stay removed

## Reference Files

- `project-instructions.md` — full project specs, trip itinerary, design principles, feature status
