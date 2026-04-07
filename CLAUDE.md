# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Editorial companion app to Wanderlog for a June 2026 Italy honeymoon. Wanderlog handles logistics (maps, itinerary, reservations, GPS, directions, reviews, journaling). This app provides the curated content layer: honest summaries, verdict badges, source attribution, mood filtering, smart suggestions, nearby pairings, and a comparison table.

## Development

**Zero-build single-file app.** No package.json, no npm, no build tools, no framework.

- Edit `italy-planner.html` directly
- Open in browser to test (file:// or local HTTP server)
- Does NOT render map tiles in Claude's artifact sandbox — must use a real browser
- localStorage key: `italy-planner-places-v2`

## Architecture

Everything lives in `italy-planner.html` (~1,900 lines):

1. **HEAD**: CDN imports (Leaflet 1.9.4, Google Fonts), ~430 lines of CSS with Italian flag theme variables
2. **BODY**: HTML structure — map container, topbar with city jump buttons, mood bar, collapsible panel/list, detail slide-over, form overlay, suggestions panel, compare overlay, flight intro SVG
3. **SCRIPT**: ~1,200 lines vanilla JS — data, constants, state, storage, map, markers, filtering, rendering, forms, navigation, init

**Data flow:** `loadPlaces()` → localStorage or `DEFAULT_PLACES` → `refresh()` → renders mood bar + list + markers → user interaction → `savePlaces()` → localStorage + toast

**Global state:** `places[]`, `markers{}`, `map`, `activeFilters` (city + moods), `editingId`

**Key systems:**
- `autoTag(place)` — infers mood tags from category + description keywords
- `getSmartSuggestions()` — time-of-day, closing-soon, activity balance tips
- `getNearbyPairings(place, maxKm)` — finds places within 600m with walk times
- Verdict badges: essential, worth-it, nice, overrated, hidden-gem
- Zoom-aware styling: far (<9), mid (9-12), close (13+) control pin/label visibility

**Responsive breakpoint:** 769px. Desktop = left sidebar panel. Mobile = bottom sheet.

## Place Object Schema

Each place has: `id`, `name`, `city`, `category`, `lat`, `lng`, `description`, `notes`, `source`, `duration_min`, `cost`, `booking`, `best_time`, `transport`, `accessibility`, `verdict`, `honest_summary`, `best_for`, `tags[]`, `visited`, `saved`.

Categories: dining, landmark, hotel, activity, viewpoint, transit, pharmacy, restroom.
Cities: Rome, Florence, Tuscany, Verona, Lake Como, Venice.

## Design Principles

- Every place answers: why go, who it's best for, how long, overrated or essential, best time, what to pair nearby
- Surface WHO recommended a place and WHY (source attribution is a key feature)
- Honest over flattering — verdict badges and "Real Story" summaries, not tourist brochure language
- This is an editorial layer, not a logistics tool — don't duplicate what Wanderlog does
- Features removed for Wanderlog redundancy (visited tracking, GPS, directions, hours display, reviews, notes, journal) should stay removed

## Reference Files

- `APP-ARCHITECTURE.md` — detailed architecture with data flow and function reference
- `project-instructions.md` — full project specs, trip itinerary, design principles, feature status
- `places-data-raw.js` — raw places data reference (may be stale; canonical data is in the HTML)
