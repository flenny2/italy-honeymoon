// ═══════════════════════════════════════
// HERO_IMAGES — slot registry + resolver
// Flat-key map of slot identifiers → image filenames in img/heroes/.
// Lookup chain: kind-id → city-default-{city} → gradient placeholder.
// ═══════════════════════════════════════

var HERO_IMAGES = {
  // Rome landmarks (place IDs verified in data-places.js)
  'place-l1': 'colosseum.jpg',          // Colosseum
  'place-l2': 'sistine-chapel.jpg',     // Vatican Museums + Sistine Chapel
  'place-l3': 'st-peters-basilica.jpg', // St Peter's Basilica
  'place-l5': 'pantheon.jpg',           // Pantheon
  'place-l6': 'roman-forum.jpg',        // Roman Forum

  // Gifts
  'gift-1':   'colosseum.jpg',          // Colosseum / Forum / Palatine tour

  // City default — shown when no specific slot key matches
  'city-default-Rome':      'rome-skyline.jpg',
  'city-default-Florence':  'florence-duomo.jpg',
  'city-default-Lake Como': 'lake-como.jpg',
  'city-default-Venice':    'venice-grand-canal.jpg',
  // Bologna and Tuscany are day-trip cities — no city-default photo yet.

  // Tonight mode — warmer/evening shot when getTonightMode() is true
  'tonight-Rome': 'st-peters-basilica.jpg'
};

// Categories that the gradient-placeholder icon glyph keys off when no image exists.
var HERO_PLACEHOLDER_ICONS = {
  landmark:  'icon-monument',
  dining:    'icon-building',
  activity:  'icon-building',
  viewpoint: 'icon-mountain',
  gift:      'icon-gift',
  move:      'icon-train',
  tonight:   'icon-moon'
};

// Resolve a hero background for the given state.
// state: { kind: 'place'|'gift'|'move'|'tonight', id: string, city: string, category?: string }
// Returns: { url: 'img/heroes/foo.jpg' } when an image is found;
// otherwise: { gradient: '#xxx', icon: 'icon-monument' } for the placeholder.
function getHeroBackground(state) {
  if (!state) return _placeholderFor(null, null);

  var key = state.kind + '-' + state.id;
  if (HERO_IMAGES[key]) {
    return { url: 'img/heroes/' + HERO_IMAGES[key] };
  }
  if (state.city && HERO_IMAGES['city-default-' + state.city]) {
    return { url: 'img/heroes/' + HERO_IMAGES['city-default-' + state.city] };
  }
  return _placeholderFor(state.city, state.kind === 'place' ? state.category : state.kind);
}

function _placeholderFor(city, kindOrCategory) {
  var color = (typeof CITY_COLORS !== 'undefined' && city && CITY_COLORS[city])
    ? CITY_COLORS[city].hex : '#7D7882';
  var icon = HERO_PLACEHOLDER_ICONS[kindOrCategory] || 'icon-building';
  return { gradient: color, icon: icon };
}
