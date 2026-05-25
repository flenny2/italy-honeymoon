// ═══════════════════════════════════════
// VerdictPill — small dot+label badge used on Today's Plan + Saved Places.
// Returns an HTML string. No DOM.
// ═══════════════════════════════════════

// Legacy data keys (in data-places.js, ~83 entries) use 'nice' and 'overrated'.
// Design system uses 'nice-if-nearby' and 'overhyped'. Normalize at the boundary
// so we don't have to migrate 83 places — keeps VERDICTS[p.verdict] lookups
// working everywhere else.
var VP_LEGACY_TO_DISPLAY = {
  'nice':      'nice-if-nearby',
  'overrated': 'overhyped'
};

// Display labels per (normalized) verdict key.
var VP_LABELS = {
  'essential':       'Essential',
  'worth-it':        'Worth It',
  'nice-if-nearby':  'Nice If Nearby',
  'overhyped':       'Overhyped',
  'hidden-gem':      'Hidden Gem'
};

// renderVerdictPill('essential', { variant: 'ghost', size: 'sm' })
//   → '<span class="vp vp--ghost vp--sm vp--essential">…</span>'
// opts:
//   variant: 'ghost' (default) | 'subtle' | 'filled'
//   size:    'sm' (default) | 'md'
//   label:   optional override string
function renderVerdictPill(verdict, opts) {
  if (!verdict) return '';
  opts = opts || {};
  var key = VP_LEGACY_TO_DISPLAY[verdict] || verdict;
  var label = opts.label || VP_LABELS[key] || key;
  var variant = opts.variant || 'ghost';
  var size = opts.size || 'sm';
  return '<span class="vp vp--' + variant + ' vp--' + size + ' vp--' + key + '">' +
           '<span class="vp__dot" aria-hidden="true"></span>' +
           '<span class="vp__label">' + label + '</span>' +
         '</span>';
}
