Italy Honeymoon Planner — Project Instructions

What this is
An editorial companion app to Wanderlog for Dylan and his fiancée's June 2026 honeymoon to Italy. Single HTML file, mobile-first. Wanderlog handles maps, itinerary, reservations, GPS, directions, reviews, and trip journaling. This app provides the curated content layer Wanderlog can't: honest summaries, verdict badges, source attribution, mood-based filtering, smart suggestions, nearby pairings, and the comparison table.

Trip overview
  - June 13–18: Rome (5 nights, DoubleTree by Hilton Monti, booked)
  - June 18–21: Florence (3 nights, needs booking)
  - June 21–22: Tuscany/Chianti (1 night agriturismo, needs booking)
  - June 22–24: Lake Como (2 nights, Hilton Lake Como, booked)
  - June 24–27: Venice (3 nights, needs booking)
  - June 27: Fly home
  - Amalfi Coast / Pompeii: day trip from Rome
  - Verona: stopover en route Como → Venice

Tech stack
  - Single self-contained HTML file (no build tools, no framework installs)
  - Leaflet.js + OpenStreetMap for the interactive map (no API key needed)
  - localStorage for persistence (works offline, survives sessions)
  - Must run in a real browser (Chrome on desktop for dev, Safari/Chrome on phones for travel) — does NOT render map tiles inside Claude's artifact sandbox
  - Italian flag color palette (rosso/verde/giallo), Playfair Display + DM Sans fonts
  - Mobile-first responsive design

Current data
  - 57 pre-loaded places across Rome, Florence, Tuscany, Verona, Lake Como, and Venice
  - 23 restaurants/cafés from coworker Nathan's personal recommendations (all tagged with "Nathan rec" source)
  - 19+ landmarks (Colosseum, Vatican, Duomo, Uffizi, Doge's Palace, etc.)
  - 15+ activities and day trips (Amalfi, Pompeii, Chianti, Murano, Burano, etc.)
  - Categories: dining, landmark, hotel, activity, viewpoint, transit, pharmacy, restroom
  - All 52 non-infrastructure places have honest summaries, verdict badges, and "best for" lines

Built features (current as of April 2026)
  1. Interactive Leaflet map with city quick-jump buttons (Rome, Florence, Venice, Como, Tuscany) — infrastructure for editorial features
  2. Color-coded category pins on map — infrastructure, zero further work needed
  3. City filter (show only one city's places via top bar buttons)
  4. Source attribution per place ("Nathan rec," "Must-see," "Trip planning")
  5. Mood auto-tagging engine (historic, foodie, romantic, budget, outdoor, evening, quick-bite)
  6. Mood filter pills inside panel (tap "romantic" to see only romantic spots)
  7. "What's Next?" smart suggestion engine (time-of-day, closing-soon warnings, activity balance)
  8. "Plan Your Visit" info card per place (duration, cost, booking needed, best time, transport, accessibility — editorial fields only, no hours display)
  9. Verdict badge system (Essential, Worth It, Nice If Nearby, Overhyped, Hidden Gem) — all 52 places populated
  10. "The Real Story" honest summaries — truth-first, not marketing copy — all 52 places populated
  11. "Best for" line per place — all 52 places populated
  12. Auto-calculated nearby pairings with walk times
  13. One-tap save/star system with comparison table overlay (cost, time, booking, indoor/outdoor, "good for right now")
  14. Collapsible list/sidebar panel (defaults open, mood filters at top)
  15. Add/edit place form (name, city, category, coordinates, description, source)
  16. Plane flight animation on load (LAX → Rome arc, ~4 seconds)
  17. Persistent storage (localStorage for save/star state)
  18. Zoom-aware pin labels and city labels

What was removed (Wanderlog redundancy audit, April 2026)
  - Category filter bar (mood pills cover this better)
  - Visited/unvisited tracking (Wanderlog is source of truth)
  - GPS locate-me button (Wanderlog + Google Maps handle this)
  - Opening hours display (Wanderlog pulls live hours; closing-soon logic kept in suggestion engine)
  - "Get Directions" button (Wanderlog + Google Maps)
  - Google Reviews / TripAdvisor links (Wanderlog embeds reviews)
  - Stat bar (depended on visited tracking)
  - Personal notes per place (moved to Wanderlog)
  - Image search/placeholder links (Wanderlog auto-pulls photos; existing images still display)
  - Trip journal feature (Wanderlog handles journaling with photos)
  - Rainy-day mood tag

Design principles
  - Every place should answer: why go, who it's best for, how long it takes, whether it's overrated or essential, best time of day, and what to pair it with nearby
  - Personal recommendations from real people (Nathan, travel agent, etc.) are the app's secret weapon — always surface WHO recommended a place and WHY
  - Honest over flattering: use verdict badges and "Real Story" summaries, not tourist brochure language
  - The app is an editorial layer, not a logistics tool — Wanderlog handles the operational stuff
  - Dylan prefers running --dry-run before applying changes and verifying data manually

Project files
  - italy-planner.html — the app (main deliverable)
  - APP-ARCHITECTURE.md — architecture reference doc
  - places-data-raw.js — raw places data reference (may be stale)

What's planned but not yet built
  - Italian language/phrasebook panel (contextual phrases by situation: ordering, directions, emergencies, haggling, compliments; pronunciation guides, dining vocabulary)
  - Full honest summaries for remaining infrastructure places (transit stations, pharmacy — low priority)
  - Export as standalone deployable site (GitHub Pages)
