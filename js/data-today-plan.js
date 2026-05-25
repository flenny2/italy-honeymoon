// ═══════════════════════════════════════
// TODAY_PLAN — per-day curated Today screen data
// Consumed by today-plan.js. Entries are optional —
// any date not present falls through to the derived
// fallback chain (scheduled gift > pre-booked venue >
// first essential place in today's city).
// ═══════════════════════════════════════
//
// Shape:
//   TODAY_PLAN['YYYY-MM-DD'] = {
//     headline: {
//       kind: 'place' | 'gift' | 'move',
//       id:   <place id | gift id | move identifier>,
//       time: 'HH:MM',         // 24-hour local
//       kicker: 'OPEN · ENTRY · PRE-BOOKED',  // displayed verbatim in Today's Plan tile
//       realTalk: '...'        // optional — overrides per-city CITY_REAL_TALK essay
//     },
//     items: [                  // optional — additional time-anchored events used by Up Next
//       { kind, id, time, label }
//     ]
//   }
//
// Note: only populate days where you want curated text or a specific
// non-default headline. Leave the rest undefined.

var TODAY_PLAN = {
  // Day 5 (Rome, Jun 15) — Vatican morning, matches Treatment A mockup
  '2026-06-15': {
    headline: {
      kind: 'place',
      id: 'l2',
      time: '09:30',
      kicker: 'OPEN · ENTRY · PRE-BOOKED'
    }
  }
  // Additional curated days — add as you confirm bookings + the per-day plan.
};

// ═══════════════════════════════════════
// TRANSITS — move-day train logistics + arrival guidance.
// Sparse map keyed by ISO date. Move-day Hero (v11+) pulls
// `train` for AM (before 12:00 Europe/Rome) and `arrivalNote`
// for PM. Empty values render the Hero without the body line.
//
// Shape:
//   TRANSITS['YYYY-MM-DD'] = {
//     train:       'Frecciarossa 9012 · 11:20 Termini · Plat. 4 · coach 4, seats 8A/8B',
//     arrivalNote: 'Drop bags at Hotel X. Trattoria Y for late lunch — N min walk.'
//   };
// ═══════════════════════════════════════

var TRANSITS = {
  // '2026-06-18': { train: '', arrivalNote: '' },  // Rome → Florence
  // '2026-06-22': { train: '', arrivalNote: '' },  // Florence → Lake Como
  // '2026-06-24': { train: '', arrivalNote: '' }   // Lake Como → Venice
};
