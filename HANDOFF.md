# Session Handoff

> Live work-in-progress state. CLAUDE.md is the stable spec; this is the
> "what's the cursor on" doc. Update it after every session — header date
> below should always reflect the last touch.

**Last updated:** 2026-04-26 (session close)
**Branch:** `main`, in sync with `origin/main` (just pushed)

---

## Where we are

- Last commit: **`4cc0894` — Today design pass** (bundles Stage 1 IA cleanup + Stage 3 design rework + lighter Italian-flag palette). Pushed to origin → Netlify auto-deploys.
  - **Stage 1 IA cleanup** (was held in working tree): Your Route mini-map killed; hotel demoted from #2 to #9 in section order.
  - **New typography-led hero composite** (`renderTodayHero(phase, city)` in `today.js`): names + Italian flag stripe + countdown + wedding pill (BEFORE/AFTER), or Italian-flag rosso→verde gradient backdrop with overlay copy (DURING). **No couple photo** ("more pictures = locations, not us").
  - **Hotel one-line strip** during BEFORE phase; full card during DURING (Item 10 will give DURING a richer "Tonight" treatment).
  - **Phrase of the Day** gets a soft Italian-flag-tinted backdrop (giallo-light → rosso-light → verde-light) with verde text — replacing the green text box.
  - **Quick Actions row removed** (`renderTodayActions` deleted; tab bar handles nav).
  - **Section headers dropped** from Hotel, Phrase, Suggestion. Kept on Wedding Gifts and Don't Miss in [City].
  - **Palette lightened** in `variables.css`: cream `#F5F1EB → #FAF9F6`, espresso `#2D2926 → #42404B`, warm-gray `#564B47 → #7D7882`, light-gray, faint-gray; shadows halved.
- Net: Today reads from 13 → 10 sections, ~73 lines of dead code removed, full Italian-flag identity in accents.
- Design-pass mockup committed at `mockups/mockup-2026-04-today-design-pass.html` as design history. Three iterations recorded inside: V1/V2/V3 hero (hidden in iter 2), V4 typography-led hero (iter 2 lock), iter 3 palette refresh with slight darken nudge (iter 3 lock). Open in a browser served from project root to render correctly (root-relative paths to `/css/variables.css` and `/fonts/fonts.css`).
- Planning context:
  - `~/.claude/plans/let-s-pick-up-where-encapsulated-leaf.md` — full design-pass plan with per-page top-of-fold map and stage breakdown
  - `~/.claude/plans/round-a-approved-decisions-joyful-ember.md` — earlier audit (Item 7 type scale + dead-code residual)
  - Commit messages on `4cc0894`, `daefb9f`, `5947616`

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

## Stages queued (Dylan-confirmed order: 4 → 5 → 6 → 7 → Item 8 → 9, 11, 12)

1. **Stage 4 — Dark/light theme toggle** (next). See "What's next" above.
2. **Stage 5 — Item 10 Tonight surface** — build composed Tonight surface for DURING phase. Removes Smart Suggestion + Don't Miss picks. Today drops from ~10 sections to ~6.
3. **Stage 6 — Italian-flag color sweep across the rest of the app** — Dylan's "colors should be based on the italian flag almost always" directive applied broadly. Audit existing CSS for terracotta / blush / sage / warm-gold / purple gradients and accents; replace with rosso/verde/bianco/giallo where reasonable. Likely candidates: `.page-header` gradient (currently blush-light → cream), `.countdown-banner.after` for Capsule (currently blush-light → purple-light), `.card-featured`, gift-card backgrounds, letter-card decoration. **Semantic exceptions stay**: verdict colors (essential=verde, hidden-gem=purple, etc.); wedding pink ("wedding" semantic).
4. **Stage 7 — Imagery sweep** — city hero images per city (Rome, Florence, Tuscany, Como, Verona, Venice) for the DURING hero + city detail pages. Letter card paper texture. Time capsule illustrated treatment. Achievement badge illustrations. Place hero images for the ~10 essentials only. Empty-state illustrations.
5. **Item 8 — Lucide icon swap** — emoji → Lucide SVG sweep. Was the original "next" item but pushed back by the design pass + theming work. Still queued.
6. **Item 9** — reduce place-card visual noise (strip to dot/name/verdict/star). Pairs naturally with Stage 6 city detail rework.
7. **Item 11** — Saved Places view.
8. **Item 12** — strip multi-trip support.

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

- **Wedding pill color** — currently kept pink/blush as semantic "wedding" exception. If Dylan wants strict Italian-flag identity (giallo for wedding accent instead of pink), one-line CSS change in `.hero-wedding-pill`. Decide when Stage 6 color sweep starts.

---

## Decisions made this session worth remembering

These won't be obvious from the diff alone:

- **"More pictures = locations, not us."** Dylan's clarifying directive mid-session. Couple photo was the original A-variant hero centerpiece; got reframed as location-photo-only. The hero now has zero couple photo at any phase. Couple photo lives in Settings + future Journal/Capsule reveals only.
- **"Italian flag colors almost always."** Late-session directive. Stage 6 was created specifically to sweep the rest of the app for warm-brown / terracotta / sage / blush / purple gradients and replace with rosso/verde/bianco/giallo. Stage 3 fixed only the colors I introduced this commit (hero DURING gradient, phrase backdrop) — the broader sweep is queued.
- **Palette went through three iterations.** Iter 1 = original warm browns. Iter 2 = "cooler neutral" but Dylan called still too dark. Iter 3 = much lighter (espresso #4A4651 etc.). Final landed = iter 3 with slight darken nudge (espresso #42404B, warm-gray #7D7882). The mockup file preserves all three for future reference.
- **DURING hero gradient is a placeholder.** The rosso→verde gradient at `.hero-during-bg` is the Stage 3 stand-in. Stage 7 (Imagery sweep) will swap in real per-city photos via `background-image` from `/img/cities/`. The CSS comment in `pages.css` flags this.
- **Bundle Stage 1 + Stage 3 was Dylan's call.** "No reason to commit a half-finished today rework in two pieces." Stage 1 was held in working tree from the prior session start; landed together with the design pass.
- **Mockup-first iteration was high-leverage.** Three rounds of mockup edits (~iter 1 → iter 2 → iter 3) replaced what would have been three round-trips of real-codebase changes. Worth repeating for Stage 4+ design conversations.
- **Suggestion section's header was dropped this commit, but Suggestion itself disappears in Stage 5** (Item 10 Tonight surface removes both Smart Suggestion + Don't Miss picks). The half-orphan work was intentional — keeps the Today rework coherent in the meantime.
- **Wedding pill (pink) is a semantic exception** to "Italian flag almost always." Same reasoning protects verdict-color purple (hidden-gem) and similar context-meaningful colors. Question logged above.
- **iPhone PWA reinstall** still needed on Dylan's home-screen install for the v3→v4 cache transition (per CLAUDE.md). One-time delete + re-add in Safari.

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
