# Hero photos — slot coverage

Source of truth for what's filled vs missing in `HERO_IMAGES` (js/hero-images.js).
Update this file as you drop new photos into `img/heroes/`.

All photos in `img/heroes/` are downscaled to max **1600px wide, JPEG q80, target <300KB**
(see `/tmp/downscale_heroes.py` — re-run with new sources as needed).
Originals from 2026-05-23 are backed up to `/tmp/heroes-original-backup-20260524/`.

## Filled slots (11)

| Slot key                 | File                       | Notes |
|--------------------------|----------------------------|-------|
| `place-l1`               | colosseum.jpg              | Colosseum exterior — also serves `gift-1` |
| `place-l2`               | sistine-chapel.jpg         | Sistine Chapel ceiling — Vatican Museums hero |
| `place-l3`               | st-peters-basilica.jpg     | St Peter's at night — also `tonight-Rome` |
| `place-l5`               | pantheon.jpg               | Pantheon facade — day shot |
| `place-l6`               | roman-forum.jpg            | Roman Forum daytime overview |
| `gift-1`                 | colosseum.jpg              | Colosseum / Forum / Palatine tour |
| `city-default-Rome`      | rome-skyline.jpg           | Generic Rome city-default |
| `city-default-Florence`  | florence-duomo.jpg         | Duomo from Piazzale Michelangelo at twilight |
| `city-default-Lake Como` | lake-como.jpg              | Lake Como panorama with alps |
| `city-default-Venice`    | venice-grand-canal.jpg     | Grand Canal + Rialto Bridge |
| `tonight-Rome`           | st-peters-basilica.jpg     | Reused — warm enough for Tonight mode |

## Unmapped (kept for future use)

- `vatican-statue.jpg` — could fill an alt Vatican slot or anniversary Rome moment.
- `palatine-hill.jpg` — could fill `gift-1` alt, or surface on Palatine-specific day.

## Missing slots — needs sourcing

These slots will render the gradient placeholder until photos drop in.

### Gifts (silent until gift dates confirmed)
- ⊘ `gift-2` — Venice gondola serenade. Suggest: gondola at dusk on a quiet canal, lantern lit.
- ⊘ `gift-3` — Rome pasta-making class. Suggest: hands working dough on a wooden counter, warm kitchen light.

### Move days (AM departure + PM arrival pair per cross-city transit)

Slot key convention: `move-{italian-from}-{italian-to}-{am|pm}` (Italian lowercase city slugs — `roma`, `firenze`, `como`, `venezia`, `bologna`). Until supplied, AM falls back to the departure city's default photo and PM falls back to the arrival city's default — acceptable but not ideal.

- ⊘ `move-roma-firenze-am` — Rome → Florence morning (Jun 18). Suggest: Termini platform morning light, Frecciarossa exterior, or Rome streetscape from cab window.
- ⊘ `move-roma-firenze-pm` — Florence arrival (Jun 18). Suggest: Florence Duomo morning, S.M.N. concourse exit, or Oltrarno alley heading to the hotel.
- ⊘ `move-firenze-como-am` — Florence → Lake Como morning (Jun 22). Suggest: S.M.N. departure, Tuscan countryside through the train window.
- ⊘ `move-firenze-como-pm` — Lake Como arrival (Jun 22). Suggest: Como Centrale exit, first lake view from the funicular or hotel terrace.
- ⊘ `move-como-venezia-am` — Lake Como → Venice morning (Jun 24). Suggest: Como Centrale platform, last lake glimpse from train.
- ⊘ `move-como-venezia-pm` — Venice arrival (Jun 24). Suggest: Santa Lucia bridge view onto the Grand Canal, vaporetto approach to Dorsoduro.

### City defaults — additional cities
- ⊘ `city-default-Bologna` — Bologna porticoes or Piazza Maggiore. Used on Jun 19 day-trip.
- ⊘ `city-default-Tuscany` — Cypress-lined country road or vineyard sunset. Used on Jun 21 day-trip.

### Tonight mode — per-city evening shots
- ⊘ `tonight-Florence` — Duomo or Ponte Vecchio at twilight (florence-duomo.jpg is already twilight — could promote).
- ⊘ `tonight-Venice` — Piazza San Marco at night or gondolas lantern-lit.
- ⊘ `tonight-Lake Como` — Bellagio waterfront at dusk.

### Headline places not yet covered
- ⊘ `place-l4` — Trevi Fountain. Suggest: Trevi at night with the lighting on.
- ⊘ `place-l10` — Borghese Gallery (booked NOW item). Galleria interior or villa facade.
- ⊘ `place-f1` — Florence Duomo close-up (florence-duomo.jpg is from Piazzale Michelangelo; a tighter Brunelleschi dome shot would serve a Duomo-headline day).
- ⊘ `place-f2` — Uffizi Gallery. Long Vasari corridor shot, or exterior at golden hour.
- ⊘ `place-f4` — Galleria dell'Accademia (David). Hard to find a non-touristy photo of the David himself.
- ⊘ `place-f6` — Piazzale Michelangelo (the viewpoint, not the view from it).
- ⊘ `place-v1` — Al Covo (the honeymoon dinner). Interior warm light, or just a Venice canal at golden hour.
- ⊘ `place-c2` — Ristorante Alle Darsene di Loppia (lakeside dinner). Loppia hamlet at sunset.

## Process

1. Drop new photo into `img/heroes/` at any resolution.
2. Re-run `/tmp/downscale_heroes.py` after editing the `RENAME` dict to include the new file.
3. Add the slot key to `HERO_IMAGES` in `js/hero-images.js`.
4. Add the file path to `APP_FILES` in `sw.js` (and bump `CACHE_NAME`).
5. Move the slot from "Missing" to "Filled" in this file.

## Optimization next pass (post-trip, low priority)

- WebP encoding would shave another 30-40% on top of current JPEG q80. Skip until post-trip — the PWA's offline-first promise matters more than the bytes right now.
- Pantheon and Rome Skyline dropped to q65 / q75 to hit the 300KB target; if the source files get re-cropped tighter, both could go back to q80.
