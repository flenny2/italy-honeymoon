# Session Handoff

> Live work-in-progress state. CLAUDE.md is the stable spec; this is the
> "what's the cursor on" doc. Update it after every session — header date
> below should always reflect the last touch.

**Last updated:** 2026-04-26
**Branch:** `main`, commits ahead of `origin/main`, not pushed

---

## Where we are

- Last commit (this session): **Stage 3 — Today design pass** (bundles Stage 1 IA cleanup + design rework + lighter Italian-flag palette).
  - **Stage 1 IA cleanup** (was held in working tree): Your Route mini-map killed; hotel demoted from #2 to #9 in section order.
  - **New typography-led hero composite** (`renderTodayHero(phase, city)` in `today.js`): names + Italian flag stripe + countdown + wedding pill (BEFORE/AFTER), or Italian-flag rosso→verde gradient backdrop with overlay copy (DURING). **No couple photo** ("more pictures = locations, not us").
  - **Hotel one-line strip** during BEFORE phase; full card during DURING (Item 10 will give DURING a richer "Tonight" treatment).
  - **Phrase of the Day** gets a soft Italian-flag-tinted backdrop (giallo-light → rosso-light → verde-light) with verde text — replacing the green text box.
  - **Quick Actions row removed** (`renderTodayActions` deleted; tab bar handles nav).
  - **Section headers dropped** from Hotel, Phrase, Suggestion. Kept on Wedding Gifts and Don't Miss in [City].
  - **Palette lightened** in `variables.css`: cream `#F5F1EB → #FAF9F6`, espresso `#2D2926 → #42404B`, warm-gray `#564B47 → #7D7882`, light-gray, faint-gray; shadows halved.
- Net: Today reads from 13 → 10 sections, ~73 lines of dead code removed, full Italian-flag identity in accents.
- Mockup file `mockup-today-design-pass.html` is in project root, **not committed** (throwaway design artifact). Three iterations recorded: V1/V2/V3 hero (hidden in iter 2), V4 typography-led hero (iter 2), iter 3 lighter palette + slight darken nudge.
- Audit + planning context lives in:
  - `~/.claude/plans/let-s-pick-up-where-encapsulated-leaf.md` — full design-pass plan with per-page top-of-fold map and stage breakdown
  - `~/.claude/plans/round-a-approved-decisions-joyful-ember.md` — earlier audit (Item 7 type scale + dead-code residual)
  - Commit messages on the design-pass commit and prior `5947616` / `daefb9f`

---

## What's next — Stage 4: Dark/light theme toggle

**PROCESS GATE — do not skip:** start with a proposal, never implementation.

Sequence:
1. Build Stage 4 plan: where the toggle UI lives (Settings page, probably), how Storage persists the choice, how `[data-theme="dark"]` selectors work, fallback to `prefers-color-scheme` on first load.
2. Design the dark-mode token values: dark backgrounds (cool dark-warm, not pure black), light text, adjusted accent saturation for legibility on dark, shadow inversion.
3. **Italian flag identity stays in dark mode.** Rosso/verde/giallo accents need slight tweaks for contrast on dark, but the identity colors don't change.
4. Implementation touches `variables.css` (theme token blocks), `settings.js` (toggle UI), `storage.js` (persistence), `app.js` (apply on load), maybe `index.html` (theme meta-color).
5. Bump `CACHE_NAME` (currently `italy-honeymoon-v4`) on the resulting commit.

**Refusal pattern if Dylan says "ok start stage 4" without seeing the plan:** push back with "let me show you the plan first."

---

## Stages queued (do not start until told)

- **Stage 5 — Item 10 Tonight surface** — build composed Tonight surface for DURING phase. Removes Smart Suggestion + Don't Miss picks. Today drops from ~10 sections to ~6. Already in HANDOFF backlog.
- **Stage 6 — Italian-flag color sweep across the rest of the app** — Dylan's "colors should be based on the italian flag almost always" directive applied broadly. Audit existing CSS for terracotta / blush / sage / warm-gold / purple gradients and accents; replace with rosso/verde/bianco/giallo where reasonable. Likely candidates: `.page-header` gradient (currently blush-light → cream), `.countdown-banner.after` for Capsule (currently blush-light → purple-light), `.card-featured`, gift-card backgrounds, letter-card decoration. Verdict colors stay (essential=verde, hidden-gem=purple have semantic meaning). Wedding pink stays (semantic "wedding").
- **Stage 7 — Imagery sweep** — city hero images per city (Rome, Florence, Tuscany, Como, Verona, Venice) for the DURING hero + city detail pages. Letter card paper texture. Time capsule illustrated treatment. Achievement badge illustrations. Place hero images for the ~10 essentials only. Empty-state illustrations.
- **Item 8 — Lucide icon swap** — emoji → Lucide SVG sweep. Was the original "next" item but pushed back by the design pass + theming work. Still queued.
- **Item 9** — reduce place-card visual noise (strip to dot/name/verdict/star). Pairs naturally with Stage 6 city detail rework.
- **Item 11** — Saved Places view.
- **Item 12** — strip multi-trip support.

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

- **Wedding pill color** — currently kept pink/blush as semantic "wedding" exception. If Dylan wants strict Italian-flag identity (giallo for wedding accent instead of pink), small change in `.hero-wedding-pill` rule.
- **Stage 4 sequencing** — does dark/light toggle land before or after Stage 5 Tonight surface? Defaulting to Stage 4 next, but Tonight surface is the bigger UX win.

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

- **Mockup-first iteration is cheap and high-signal.** Three mockup iterations replaced what would have been three round-trips of real-codebase changes. Worth repeating for any meaningful design pass.
- **Italian flag identity is load-bearing.** Treat warm-brown / terracotta / sage / blush / purple gradients as suspect; flag colors (rosso/verde/bianco/giallo) lead. Semantic exceptions OK (purple=hidden-gem rare, pink=wedding).
- **"More pictures" means locations, not personal photos.** Couple photos belong elsewhere (Settings, journal, capsule reveal); the front-of-app imagery should be Italy.
- **Phase-aware hero is the right anchor.** BEFORE/AFTER pure type with countdown; DURING shifts to city-photo backdrop. Never the same shape across all phases.
- **`sed` on a CSS file invalidates pending parallel `Edit` calls** ("file modified since read"). Sequential Edits or re-read first.
- **Always grep-verify after JS edits**: `grep -l "\.classname" css/*.css` for every new class introduced.
- **The innerHTML security hook intermittently blocks `Edit` calls** (per CLAUDE.md). Retry the same call.
