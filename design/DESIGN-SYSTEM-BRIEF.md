# Italy Honeymoon App — Design System Brief ("Hairline Editorial")

Paste this whole document into a new Claude Design session to extend the
established style to other tabs (Map, City Detail, Place Detail, etc).

---

## 1. What this app is

A personal travel PWA for one couple's June 2026 honeymoon to Italy. It runs on
an iPhone home screen. It is NOT a commercial product and must never feel like
one. The brief is a "personal love letter," not a generic app.

Editorial positioning: this app is the **opinionated companion** to Wanderlog
(which handles logistics — maps, reservations, routing). This app handles
**voice and judgment**. Truth-first: verdict badges and "Real Talk" summaries,
never tourist-brochure language. Think NYT Cooking newsletter or a well-edited
city guide, not Lonely Planet.

The visual system is called **Hairline Editorial** — Apple News / NYT / WaPo
house-style cleanliness. Restrained, confident, paper-like. Italian flag color
used architecturally, never as chrome.

---

## 2. Core philosophy (the 6 rules)

1. **Truth-first voice.** Copy states verdicts plainly ("carbonara that ruins
   all other carbonara"). No filler, no hype, no slop. Every element earns its
   place. One thousand no's for every yes.
2. **Editorial restraint.** This reads like a magazine, not a dashboard. No
   gratuitous stats, icons, or progress rings. White space is a feature.
3. **Image-backed vs. flat is a deliberate distinction** (see §6).
4. **Italian flag is architectural, not decorative.** Used in exactly a few
   sanctioned places; never as a background, never on more than ~2 tiles at once.
   If it ever feels like a pizzeria menu, it's wrong.
5. **Playfair earns its place; DM Sans is the workhorse.** Serif is a scalpel,
   not a default (see §3).
6. **Hierarchy is dynamic.** The hero is a priority slot — its size and content
   change with what matters most today.

---

## 3. Typography

Two families, both already loaded via Google Fonts:
`Playfair Display` (serif) + `DM Sans` (sans).

**Playfair Display** appears ONLY at >=22px AND only in these spots:
- Hero title
- "Real Talk" headline (use Playfair **roman**, not italic — decided)
- Large numerics: the Day number, weather high temp, "Up Next" time
- Place names in list contexts (optional, for editorial warmth)

Everywhere else is **DM Sans**. Body, labels, metadata, kickers, UI.

Scale (mobile, 390px design width):
| Role | Font | Size | Weight | Tracking |
|---|---|---|---|---|
| Hero title (tall) | Playfair | 30px | 700 | -0.01em |
| Hero title (slim) | Playfair | 22px | 700 | -0.01em |
| Real Talk headline | Playfair 700 roman | 22px | 700 | -0.01em |
| Big numerics | Playfair | 22–26px | 700 | — |
| Hero kicker | DM Sans | 10px | 600 | +0.16em, UPPERCASE |
| Tile label | DM Sans | 9.5px | 600 | +0.16em, UPPERCASE |
| Body / Real Talk copy | DM Sans | 13.5px | 400 | line-height 1.5 |
| Tile body | DM Sans | 11.5–14px | 400–600 | — |
| Verdict pill | DM Sans | 9.5px | 700 | +0.14em, UPPERCASE |

Always use `text-wrap: pretty` on paragraphs. Numerics use
`font-variant-numeric: tabular-nums`.

---

## 4. Color tokens

### Surface (light / default)
```
bg          #FAF7F2   page surface — warm cream
surface     #FFFFFF   tile fill (subtly lighter than page)
ink         #1A1410   text
ink70       rgba(26,20,16,0.70)
ink55       rgba(26,20,16,0.55)
ink40       rgba(26,20,16,0.40)
hair        rgba(40,30,20,0.10)   ← the 1px hairline border
```

### "Tonight" mode (dark — see §8)
```
inkBg       #1A1410   page surface (warm near-black)
inkSurface  #241C16   tile fill
inkHair     rgba(244,224,180,0.10)
ember       #E8B055   gold/amber accent (replaces verde at night)
text        #F4E6CC   warm cream text
```

### Italian flag — architectural use only
```
rosso  #CE2B37   rossoDark  #A8222C
verde  #009246   verdeDark  #006B35
giallo #E8B931   gialloDark #C9A028
```
Sanctioned uses: (a) Real Talk label accent (rossoDark), (b) "Up Next" positive
tag (verdeDark), (c) the Phrasebook flag stamp, (d) verdict pill colors. That's
it. Use the *Dark* variants for text/accents so they pass contrast on cream.

### City color theming (net-new system — confirmed)
Each city has an identity color + Roman numeral, used as a small accent (a 3px
color bar under the Day number, plus the city name tinted). NEVER as a solid
fill block.
```
Roma     (Firenze numeral set per city)  ochre       oklch(0.62 0.11 65)
Firenze                                   terracotta  oklch(0.55 0.14 35)
Venezia                                   adriatic    oklch(0.55 0.07 215)
Como                                      alpine      oklch(0.60 0.08 235)
Bologna                                   portico     oklch(0.48 0.12 25)
```

### Category colors (for map pins, Saved-place dots — from data-trip.js)
```
dining    #CE2B37   landmark  #008C45   hotel     #E8B931
activity  #F97316   viewpoint #8B5CF6   transit   #3B82F6
pharmacy  #EC4899   restroom  #6B7280
```
Saved-place dots use CATEGORY color (not verdict). Verdict is shown via the pill.

---

## 5. Layout primitives

```
radius   14px   (tiles + hero)
gap      10px   (between all tiles)
pad      12px   (page horizontal padding)
tile pad 12px 14px
```

- **Flat tile:** `surface` fill + `1px solid hair` border + 14px radius. No shadow.
- **Image-backed tile:** NO border. Soft shadow
  `0 1px 2px rgba(0,0,0,.06), 0 6px 18px rgba(40,30,20,.10)`. 14px radius.
- Layout is flex/grid with `gap` — never inline-flow spacing.
- 3-col and 2-col rows use `grid-template-columns: 1fr 1fr 1fr` / `1fr 1fr`.

---

## 6. Image-backed vs. flat (the key distinction)

**Image-backed** (photographic, no border, shadow, gradient overlay):
Hero, Today's Plan. These are the emotional / "what matters" surfaces.

**Flat** (cream/white, hairline border, no photo):
Status strip, Real Talk, Home Base, Phrasebook, Saved Places. These are
reference / utility surfaces.

Consistent photo treatment on ALL image-backed tiles:
- `object-fit: cover`, `filter: saturate(0.95) contrast(1.02)`
- Darkening gradient bottom-up:
  `linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)`
  (Today's Plan adds a faint top scrim too.)
- Text is white with `text-shadow: 0 1px 2px rgba(0,0,0,0.25)`.

This deliberate split is what makes the screen feel edited rather than random.
Keep it: never put a photo behind a utility tile, never leave the hero flat.

---

## 7. The hero is a dynamic priority slot

Priority order decides what the hero shows:
`gift today > gift tomorrow > move day > first/last day in city > today's headline place`

**Hero height scales with priority** (decided):
- Normal day → **slim, 132px** (title only)
- Gift day / Move day → **tall, 240px** (title + sub line)

Move days are time-aware: **AM** shows "Last morning in [departure city]" with
departure logistics (train/flight, time, platform/gate). **PM** shows "Welcome
to [arrival city]" / "Benvenuti a [città]" with first-arrival guidance (drop
bags, find dinner, where the vaporetto/taxi is).

---

## 8. "Tonight" mode (7pm Europe/Rome flip)

At 19:00 local the same screen shifts mood — NOT a different screen:
- Surface flips to warm near-black (`inkBg` / `inkSurface`), text to cream.
- Verde accents become `ember` gold.
- An amber "Tonight" pill (ghost outline) appears top-right in the topbar.
- Today's Plan → **Tomorrow's Plan**; Up Next → tomorrow's first suggestion;
  hero may rotate to tonight's dinner or next-day priority.

Same skeleton, same tokens, warmer/darker palette. Distinct but coherent.

---

## 9. Tile inventory (the Today screen — locked structure)

In order, top to bottom:
1. **Topbar** — slim: date (left), temp + status (right), Tonight pill if night.
2. **Hero** (image-backed, full-width, dynamic priority slot, slim/tall).
3. **Status strip** (3-col equal, flat): Day X of 14 (Playfair number + city
   color bar + city name) | Weather (Playfair temp) | Up Next (Playfair time +
   smart suggestion).
4. **Today's Plan** (image-backed, full-width, ~168px): headline event(s).
5. **Real Talk Today** (flat, full-width): Playfair headline + one DM Sans
   paragraph, truth-first voice. The editorial soul of the screen.
6. **Row** (2-col): Home Base (hotel, demoted) | Phrasebook (one context-aware
   Italian phrase + flag stamp).
7. **Saved Places** (flat footer, conditional — only if saved places exist):
   list rows with category-color dots + verdict pills.

---

## 10. Verdict pill (reusable token)

Anatomy: dot + UPPERCASE DM Sans 700 label, +0.14em tracking, pill radius.
Three verdicts, three variants, two sizes.

Verdicts: `essential` (rosso), `worth-it` (verde), `skip-if-time` (giallo).
Use the *Dark* text colors for contrast; the dot uses the full-saturation flag color.

Variants:
- **ghost** (recommended default) — transparent bg, `1px` border at the text
  color @ 20% alpha, colored dot. Matches the hairline system.
- **subtle** — tinted background (e.g. `#FFEAEC` for essential), colored dot.
- **filled** — solid flag color, white text. RESERVE for high-emphasis only
  (place-detail header, hero overlay). Full-saturation flag everywhere reads
  pizzeria.

Sizes: sm (9.5px, 6px dot, 4/8 pad) · md (11px, 7px dot, 5/10 pad).

---

## 11. Extending to new tabs — guidance

When you build Map / City Detail / Place Detail / Itinerary screens:
- Reuse every token above verbatim. Same cream, same hairlines, same type scale.
- Keep the image-backed-vs-flat logic: photo surfaces are emotional, flat
  surfaces are reference.
- Place Detail header = a tall image-backed hero (like the Today hero) with a
  filled verdict pill overlaid; below it, flat tiles for hours, the honest
  one-paragraph summary (Playfair headline + DM Sans body, same as Real Talk),
  and a "best for" line.
- Maps: pins use the category colors (§4). Keep map chrome flat and quiet so
  the photography in cards carries the warmth.
- Lists: list rows = place name (Playfair optional), category-dot + meta line,
  ghost verdict pill on the right. (Pattern already proven in the token sheet.)
- Never introduce a third font, a new accent hue outside the city set, gradients
  as decoration, emoji (unless it's a city/flag stamp already sanctioned), or
  rounded-corner-+-left-accent-border cards. Those break the system.

Fonts to load:
`Playfair Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700`
`DM Sans:wght@300;400;500;600;700`
