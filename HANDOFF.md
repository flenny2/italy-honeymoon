# Session Handoff

> Live work-in-progress state. CLAUDE.md is the stable spec; this is the
> "what's the cursor on" doc. Update it after every session — header date
> below should always reflect the last touch.

**Last updated:** 2026-05-19 (session close)
**Branch:** `main`, in sync with `origin/main` (just pushed)

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

## What's next — Stage 5: Tonight surface (Item 10)

**PROCESS GATE — do not skip:** start with a proposal, never implementation.

Stage 5 builds a composed "Tonight" surface for DURING phase that consolidates current Smart Suggestion + Don't Miss picks into a single richer block. Today drops from ~11 sections to ~6 during the trip.

Why this is next: it's the single highest-leverage trip-readiness item remaining; was the candidate for #1 at session open, demoted only because Path B gift work was more time-sensitive (gift dates have real-world deadlines that the Tonight surface doesn't).

Files likely to touch: `today.js` (new `renderTodayTonight(phase, city)` composite + section reshuffle), `suggestions.js` (may absorb or be obsoleted), `pages.css` (new Tonight surface styling), possibly `data-trip.js` (per-day theming). Bump `CACHE_NAME` v6 → v7 on the resulting commit.

---

## Stages queued (revised order from this session)

1. **Stage 5 — Item 10 Tonight surface** (next). See "What's next" above.
2. **Offline / PWA reliability check** — verify v6 cache, all 7 cities' map tiles pre-cache pre-trip, fonts/CSS load in airplane mode. Target: ~7–10 days pre-departure.
3. **Dylan's editorial pass on Bologna places** — fill in `verdict`, `honest_summary`, `best_for` for `b1`-`b5` in `data-places.js`. Manual edit; no CC dependency.
4. **Dylan's `data-places.js` dedupe homework** (21 entries, Nathan-rec pattern). Manual edit; no CC dependency.
5. (Defer to post-trip) **Stage 4 Dark/light theme toggle**, **Stage 6 Italian-flag color sweep**, **Stage 7 Imagery sweep**, **Item 8 Lucide icon swap**, **Item 9 place-card noise reduction**, **Item 11 Saved Places view**, **Item 12 strip multi-trip support**.

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
