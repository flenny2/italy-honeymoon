# Session Handoff

> Live work-in-progress state. CLAUDE.md is the stable spec; this is the
> "what's the cursor on" doc. Update it after every session — header date
> below should always reflect the last touch.

**Last updated:** 2026-04-25
**Branch:** `main`, 2 commits ahead of `origin/main`, not pushed

---

## Where we are

- Last commit: `daefb9f` — **Item 7 done** (type scale + sweep + dead cache trio).
  - 9 type tokens added to `variables.css` (`--text-2xs` through `--text-display`).
  - All 4 CSS files swept: 130+ font-size declarations now reference tokens.
  - 8 Playfair selectors downgraded to DM Sans (Playfair floor is now `--text-xl`/22px).
  - 41 inline JS font-sizes extracted into 30+ named CSS classes.
  - Documented Playfair exception: `.journal-prompt-text` (in CSS comment).
  - Bonus: `_placeIndex` / `getPlaceById` / `invalidatePlaceIndex` deleted from `helpers.js` (+ call site in `today.js`).
- Previous commit: `5947616` — **Round A done** (legacy delete, dead schema, bookings into Storage, SW v3, toggleSave fix, `map-shared.js`).
- Audit + planning context lives in:
  - `~/.claude/plans/round-a-approved-decisions-joyful-ember.md` — full type scale proposal + mapping table + dead-code residual list + notes/source overlap worksheet
  - Commit messages on `5947616` and `daefb9f` — what each item changed and why

---

## Visual spot-checks Dylan owes (do BEFORE item 8 starts)

11 visible deltas from item 7. Dylan walks the app, decides if any need a documented exception. Most material:

| # | Selector | Change | Where to look |
|---|---|---|---|
| 1 | `.today-hero h1` | 24 → 22px | Today screen (may be vestigial — no h1 actually rendered there) |
| 2 | `.detail-name` | 26 → 28px (still Playfair) | Place detail page |
| 3 | `.stats-tile-count` | 30 → 28px | Stats page tiles |
| 4 | `.popup-name` | 15px Playfair → 16px DM Sans | Map markers — tap any pin |
| 5 | `.today-couple-names` | 14px Playfair → DM Sans | Today hero ("Dylan & Hope") |
| 6 | `.today-letter-text strong` / `.today-capsule-text strong` | 16px Playfair → DM Sans | Today alert/nudge headlines (need to seed unread letter or fake date for capsule nudge) |
| 7 | `.settings-section-title` | 16px Playfair → DM Sans | Settings page section heads ("Us", "Milestones", "Flying from") |
| 8 | `.explore-city-name` | 18px Playfair → DM Sans | Explore tab city grid |
| 9 | `.counter-chip-count` | 18px Playfair → DM Sans | Counter chips on Today (during-trip only) |
| 10 | Map labels | 9-10 → 11px | Route map labels — should be more readable |
| 11 | Body text in cards | 13 → 14px (cards), 15 → 16px (titles) | Everywhere — slight density reduction |

**Each Playfair downgrade is reversible with a one-line CSS exception** (set `font-family: var(--font-display)` back). The pattern is documented in `.journal-prompt-text` in `pages.css` — copy that comment style.

---

## What's next — Item 8 (Lucide icon swap)

**PROCESS GATE — do not skip:** start with a proposal, never implementation.

Sequence:
1. Spot-check decisions above must land first (any Playfair reverts done).
2. Claude builds **complete emoji → Lucide mapping table** covering every site:
   - Tab bar (5: 🌞📝🗺️💌✨)
   - Map filter modal: verdict (3) + source (2) + type (4) + mood (4) chips
   - Map city chips (5)
   - Verdict badge icons (5 — `VERDICTS` in `data-trip.js`)
   - Map place pin emoji (`CAT_ICONS` in `data-trip.js` — 8 categories)
   - Section headers across renders (today.js, achievements.js, etc.)
   - More page link icons (renderMore in app.js)
   - Quick action icons (today.js renderTodayActions)
   - Modal hero icons in surprise / letter / capsule (already in `.modal-icon-*` classes)
   - Hotel marker (🏠) in `map-shared.js`
   - Bookings checklist icons
3. Mark **"keep emoji" exceptions** per Dylan's earlier call:
   - Phrasebook category headers (`data-phrases.js` — already playful, intentional)
   - Counter chips (`COUNTER_TYPES` in `data-achievements.js` — gelato/pizza/etc. ARE the content)
   - Decorative achievement icons in `data-achievements.js` (Dylan's call which ones; propose a list grouped by category, he picks)
4. **Inline SVG sprite, NOT CDN.** Self-host in `lib/` or new `img/icons/`. Sprite at top of `<body>` once, then `<svg><use href="#i-name"/></svg>` per usage.
5. **WAIT for explicit approval** on the mapping table before swapping anything.
6. After approval: sweep emoji → SVG, extract icon sizes (24, 28, 32, 34, 36, 40, 48, 56) into `--icon-*` tokens to mirror the type scale.
7. Bump `CACHE_NAME` (currently `italy-honeymoon-v3`) on the resulting commit.

**Refusal pattern if Dylan says "ok start item 8" without seeing the table:** push back with "let me show you the mapping first" and produce the table.

---

## Items 9-12 (queued, do not start until told)

- **Item 9** — reduce place-card visual noise (strip to dot/name/verdict/star). Show a before/after on one card before applying everywhere.
- **Item 10** — build Tonight surface; **remove** smart-suggestions and don't-miss picks. Walk Dylan through the proposed composition logic before building.
- **Item 11** — Saved Places view. Propose two location options (Today section vs Explore tab section vs own slot) with trade-offs.
- **Item 12** — strip multi-trip support. **List what's stripped before stripping** so Dylan can confirm none is load-bearing for a future export feature.

---

## Open threads

### Dylan's homework (no CC action)
- **Side task 1**: notes/source dedupe worksheet (21 entries, all Nathan-rec pattern). Full table in the plan file at `~/.claude/plans/round-a-approved-decisions-joyful-ember.md`. Dylan applies edits manually to `data-places.js`.

### Deferred dead-code (do NOT touch unless asked)
Dylan explicitly said leave these for a later cleanup pass:
- `.card-featured` (`components.css:29-35`) — defined, never applied
- `.achievement-grid` (`pages.css` media query) — referenced, no element has the class
- `.anim-fade-in` (`components.css:887`) — defined, never applied
- `DAY_TRIP_LINE_COORDS` (`map-shared.js:11-15`) — magic coords belong with `ROUTE_COORDS`
- `// 83 curated places` comment (`data-places.js` header) — hand-maintained count

---

## Held for later (do NOT preemptively start)

- Letter card visual rework (paper texture, wax seal)
- Custom illustrations in hero spots (couple photo area, achievements, city emblems, letter card, time capsule)
- Export feature (JSON / PDF) — separate design conversation
- Inline `style=""` purge for non-font-size styles
- Today section consolidation (13 → ~6)
- Letter writing prompts

---

## Open questions for next session

- **Which Playfair downgrades (if any) get reverted as documented exceptions?** Answer determines item 8's starting state and any adjacent typography decisions when icons swap.

---

## Working norms (Dylan's stated process)

- One item at a time once item 8 starts. Propose before doing design work. Summary after each.
- Bump `CACHE_NAME` in `sw.js` on every commit that touches JS or CSS (already enforced in CLAUDE.md).
- Single commit per item or per "stage of work", not per file.
- Don't push to `origin/main` without explicit ask — Netlify auto-deploys on push.
- If something found mid-implementation is outside scope, log it here and keep going — don't expand.

---

## Process notes from this session (avoid same traps)

- **`sed` on a CSS file invalidates pending parallel `Edit` calls** ("file modified since read"). If you sed-sweep, do all Edits sequentially after, or re-read the file first.
- **Always grep-verify after JS edits**: `grep -l "\.classname" css/*.css` for every new class introduced. I missed `.ach-platinum-progress` in this session and only caught it via a verification pass.
- **The innerHTML security hook intermittently blocks `Edit` calls** (per CLAUDE.md). Retry the same call — it usually succeeds on the second attempt. Documented behavior.
