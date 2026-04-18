// ═══════════════════════════════════════
// ACHIEVEMENT DEFINITIONS
// Treat this like a video game!
// ═══════════════════════════════════════

var ACHIEVEMENTS = [

  // ── FOOD & DRINK ──
  { id: 'first-gelato',     title: 'Gelato Initiation',     icon: '🍨', category: 'food',
    challenge: 'Eat your first gelato in Italy',
    howTo: 'Walk into any gelateria, pick a flavor (or three), and take that first bite on Italian soil. Bonus points if you eat it while walking down a cobblestone street.',
    rarity: 'common' },

  { id: 'aperol-spritz',    title: 'Aperol Hour',           icon: '🍹', category: 'food',
    challenge: 'Order your first Aperol Spritz',
    howTo: 'Sit at an outdoor table during golden hour, order an Aperol Spritz, and clink glasses. You\'re officially on vacation.',
    rarity: 'common' },

  { id: 'pizza-bianca',     title: 'The OG Slice',          icon: '🍕', category: 'food',
    challenge: 'Eat pizza bianca at Forno Campo de\' Fiori',
    howTo: 'Go to Forno Campo de\' Fiori (est. 1880), order a slice of the legendary pizza bianca — just olive oil, salt, and perfection. Eat it in the piazza.',
    rarity: 'uncommon' },

  { id: 'cacio-e-pepe',     title: 'Cacio Champion',        icon: '🧀', category: 'food',
    challenge: 'Eat cacio e pepe at Felice a Testaccio',
    howTo: 'Book a table at Felice, order the cacio e pepe, and watch them toss it tableside. This dish has been perfected here since 1936. Photograph the moment.',
    rarity: 'uncommon' },

  { id: 'bellini',          title: 'Hemingway Approved',    icon: '🍸', category: 'food',
    challenge: 'Drink a Bellini at Harry\'s Bar in Venice',
    howTo: 'Walk into Harry\'s Bar (est. 1931), sit at the bar, and order a Bellini — the cocktail invented in this exact room in 1948. One is enough. Savor it.',
    rarity: 'rare' },

  { id: 'cappuccino-rule',  title: 'When in Rome...',       icon: '☕', category: 'food',
    challenge: 'Go an entire day only ordering cappuccino before 11am',
    howTo: 'Italians consider cappuccino a breakfast drink. For one full day, order cappuccino only in the morning and switch to "un caffè" (espresso) after 11am. Blend in like a local.',
    rarity: 'uncommon' },

  { id: 'five-restaurants',  title: 'Buon Appetito',        icon: '🍝', category: 'food',
    challenge: 'Eat at 5 different restaurants from the app',
    howTo: 'Visit any 5 restaurants listed in your Explore pages. Nathan recs, Goop picks, or your own discoveries — they all count.',
    rarity: 'common' },

  { id: 'ten-restaurants',   title: 'Mangia Mangia!',       icon: '👨‍🍳', category: 'food',
    challenge: 'Eat at 10 different restaurants from the app',
    howTo: 'You\'re halfway through the restaurant list! Keep exploring — every city has hidden gems waiting.',
    rarity: 'rare' },

  // ── LANDMARKS & SIGHTS ──
  { id: 'trevi-coin',       title: 'Trevi Wish',           icon: '🪙', category: 'landmark',
    challenge: 'Throw a coin into the Trevi Fountain',
    howTo: 'Stand with your back to the fountain, hold a coin in your right hand, and toss it over your left shoulder. Legend says you\'ll return to Rome. Make a wish together.',
    rarity: 'common' },

  { id: 'duomo-steps',      title: 'Summit: Duomo',        icon: '🏔️', category: 'landmark',
    challenge: 'Climb all 463 steps to the top of Florence\'s Duomo',
    howTo: 'Book dome climb tickets in advance. The staircase is narrow and claustrophobic in places — but the panoramic view of Florence from the top is the best in the city. No elevator. Just grit.',
    rarity: 'rare' },

  { id: 'sistine-chapel',   title: 'Touched by Michelangelo', icon: '🎨', category: 'landmark',
    challenge: 'Stand beneath the Sistine Chapel ceiling',
    howTo: 'Walk through the Vatican Museums (book ahead!), enter the Sistine Chapel, and look up. 500 years of genius on one ceiling. No photos allowed — just stand there and let it hit you.',
    rarity: 'uncommon' },

  { id: 'sunset-piazzale',  title: 'Golden Hour',          icon: '🌅', category: 'landmark',
    challenge: 'Watch sunset from Piazzale Michelangelo in Florence',
    howTo: 'Arrive 45 minutes before sunset. Walk up (20 min from the river) or take bus 12/13. Bring a bottle of wine, sit on the steps, and watch the Duomo glow gold as the sun goes down.',
    rarity: 'uncommon' },

  { id: 'burano-colors',    title: 'Rainbow Island',       icon: '🌈', category: 'landmark',
    challenge: 'Visit Burano Island and photograph a colorful street',
    howTo: 'Take the vaporetto (45 min from Venice). Walk the streets of brightly painted fisherman\'s houses. Take at least one photo where every building is a different color.',
    rarity: 'uncommon' },

  // ── EXPERIENCES ──
  { id: 'gondola-ride',     title: 'Gondoliere',           icon: '🚣', category: 'experience',
    challenge: 'Complete your gondola serenade in Venice',
    howTo: 'This one\'s a wedding gift! Board the gondola, settle into the cushions, and let the musician serenade you through the canals. Hold hands. This is what honeymoons are for.',
    rarity: 'rare' },

  { id: 'lost-adventure',   title: 'The Adventurers',      icon: '🧭', category: 'experience',
    challenge: 'Get intentionally lost and discover something unexpected',
    howTo: 'Pick a neighborhood (Trastevere, Oltrarno, Dorsoduro), put away Google Maps, and just walk. Turn left when you feel like it. Stop at whatever catches your eye. Unlock this when you find something amazing you never would have planned.',
    rarity: 'uncommon' },

  { id: 'trastevere-wander',title: 'Night Owls',           icon: '🌙', category: 'experience',
    challenge: 'Stay out past 2am in Italy',
    howTo: 'You\'re on your honeymoon — stay out stupidly late at least once. A bar in Trastevere, a piazza in Florence, a canal-side bench in Venice. It doesn\'t matter where. What matters is that you\'re still out when the city goes quiet and it feels like it belongs to just the two of you.',
    rarity: 'uncommon' },

  // ── CULTURE ──
  { id: 'italian-phrase',   title: 'Linguista',            icon: '🗣️', category: 'culture',
    challenge: 'Successfully use an Italian phrase with a local and be understood',
    howTo: 'Open the Phrasebook, pick a phrase, practice it once, then use it in real life. Ordering food counts. Asking for directions counts. Saying "buongiorno" to a shopkeeper counts. The bar is low — just try!',
    rarity: 'common' },

  { id: 'honeymoon-toast',  title: 'Luna di Miele!',       icon: '🥂', category: 'culture',
    challenge: 'Tell someone you\'re on your honeymoon and receive a free treat',
    howTo: 'Say "siamo in luna di miele" (we\'re on our honeymoon) to a waiter, hotel concierge, or shopkeeper. Italians genuinely love honeymooners — free limoncello, extra desserts, and warm congratulations are common. Unlock when the magic happens.',
    rarity: 'uncommon' },

  // ── TRAVEL ──
  { id: 'first-train',      title: 'All Aboard!',          icon: '🚂', category: 'travel',
    challenge: 'Take your first Italian train',
    howTo: 'Find your platform (binario) at the station, validate your paper ticket at the machine on the platform (e-tickets don\'t need it), board, and enjoy the view. Pro tip: the countryside between Rome and Florence is gorgeous.',
    rarity: 'common' },

  { id: 'vaporetto',        title: 'Water Taxi',           icon: '⛴️', category: 'travel',
    challenge: 'Ride the vaporetto in Venice',
    howTo: 'Buy a pass (single rides are €9.50 — the pass pays for itself fast). Board at any stop and ride the Grand Canal. Stand at the front of the boat for the full experience.',
    rarity: 'common' },

  { id: 'all-cities',       title: 'Grand Tour Complete',  icon: '🗺️', category: 'travel',
    challenge: 'Visit all 4 cities on the itinerary',
    howTo: 'Set foot in Rome, Florence, Lake Como, and Venice. By the time you unlock this on Day 12, you\'ll have traveled the length of Italy. You did it.',
    rarity: 'legendary' },

  // ── SECRET / BONUS ──
  { id: 'first-photo',      title: 'Snapshot',             icon: '📸', category: 'experience',
    challenge: 'Add your first photo to the journal',
    howTo: 'Open the Journal tab, tap "Add Photo," and capture a moment. The first photo on Italian soil hits different.',
    rarity: 'common' },

  { id: 'sunrise',          title: 'Early Bird',           icon: '🌅', category: 'experience',
    challenge: 'Catch a sunrise in Italy',
    howTo: 'Set an alarm, drag yourselves out of bed, and find a spot with a view. The Colosseum at dawn, the Arno riverbank, or your hotel rooftop all work. Coffee in hand is encouraged.',
    rarity: 'rare' },

  { id: 'love-lock',        title: 'Sealed With a Kiss',   icon: '💕', category: 'experience',
    challenge: 'Share a kiss at a famous romantic spot',
    howTo: 'Juliet\'s balcony in Verona, the Ponte Vecchio at sunset, a gondola in Venice, or Punta Spartivento on Lake Como. Pick your moment, and make it count.',
    rarity: 'common' },

  { id: 'seal-capsule',     title: 'Time Travelers',       icon: '🔮', category: 'experience',
    challenge: 'Seal the Time Capsule on your last night',
    howTo: 'Go to More → Time Capsule. Write a letter to your future selves, pick your favorites, and seal it. It opens on your first anniversary. This is the last achievement you should unlock.',
    rarity: 'rare' },

  { id: 'chianti-toast',    title: 'Under the Tuscan Sun',  icon: '🍷', category: 'food',
    challenge: 'Toast with Chianti wine in the Chianti region',
    howTo: 'You\'re in the actual Chianti hills where this wine is made. Order a glass of Chianti Classico at a winery or trattoria, clink glasses, and say "alla nostra!" This one only counts in Tuscany.',
    rarity: 'uncommon' },

  { id: 'funicular',        title: 'Peak Experience',       icon: '🚡', category: 'travel',
    challenge: 'Ride the Como-Brunate funicular',
    howTo: 'Walk to the funicular station from the hotel, ride 7 minutes to 715 meters, and look out over the entire lake. The view is staggering. Have a drink at the top.',
    rarity: 'uncommon' },

  // ── COUNTER-DRIVEN (auto-unlock from tap counters on Today) ──
  { id: 'counter-gelato-10',     title: 'Gelato Champion',       icon: '🍨', category: 'food',
    challenge: 'Eat 10 gelatos across the trip',
    howTo: 'Tap the 🍨 counter on the Today screen every time you eat one. At 10 scoops total, you\'ve earned it. Yes, doubles count as one. No, breakfast gelato still counts.',
    rarity: 'rare' },

  { id: 'counter-pasta-10',      title: 'Pasta Perfezionato',    icon: '🍝', category: 'food',
    challenge: 'Eat 10 pasta dishes in Italy',
    howTo: 'Tap the 🍝 counter every pasta dish. Cacio e pepe, carbonara, pici, tagliatelle — they all count. Ten dishes means you ate pasta almost every day. Respect.',
    rarity: 'rare' },

  { id: 'counter-pizza-5',       title: 'Five Slices In',        icon: '🍕', category: 'food',
    challenge: 'Eat 5 pizzas in Italy',
    howTo: 'Tap the 🍕 counter each time. Whole pies, street slices, late-night al taglio — they all count. Five is the minimum for a proper honeymoon.',
    rarity: 'common' },

  { id: 'counter-espresso-14',   title: 'Espresso Every Day',    icon: '☕', category: 'food',
    challenge: 'Order 14 espressos — one for every day of the trip',
    howTo: 'Tap the ☕ counter after every "un caffè." One per day, standing at the bar like a local. Fourteen means you matched the Italians.',
    rarity: 'legendary' },

  { id: 'counter-cappuccino-7',  title: 'Cappuccino Club',       icon: '🥛', category: 'food',
    challenge: 'Drink 7 cappuccinos before 11am',
    howTo: 'Tap the 🥛 counter on lazy hotel breakfast mornings. Seven cappuccinos means you had a proper Italian slow morning most days.',
    rarity: 'uncommon' },

  { id: 'counter-wine-5',        title: 'In Vino Veritas',        icon: '🍷', category: 'food',
    challenge: 'Share 5 glasses of Italian wine together',
    howTo: 'Tap the 🍷 counter each time. House reds at trattorias, crisp whites on Lake Como, Prosecco at sunset. Five glasses between you means you\'ve toasted this trip properly.',
    rarity: 'uncommon' },

  // ── PLATINUM ──
  { id: 'platinum',          title: 'Amore Infinito',       icon: '💎', category: 'platinum',
    challenge: 'Unlock every other achievement',
    howTo: 'You did it. Every gelato eaten, every sunset watched, every coin thrown, every kiss stolen. This trip was everything. You are officially Italy completionists. Congratulations — now go home and plan the next adventure.',
    rarity: 'platinum' },
];

// Rarity colors and labels for the game-style UI
var RARITY = {
  'common':    { label: 'Common',    color: '#6B7280', bg: '#F3F4F6', icon: '' },
  'uncommon':  { label: 'Uncommon',  color: '#008C45', bg: '#E8F5EC', icon: '' },
  'rare':      { label: 'Rare',      color: '#3B82F6', bg: '#DBEAFE', icon: '✦' },
  'legendary': { label: 'Legendary', color: '#E8B931', bg: '#FFF8E1', icon: '★' },
  'platinum':  { label: 'Platinum',  color: '#8B5CF6', bg: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)', icon: '💎' }
};

// Counter → achievements threshold rules.
// Storage.incrementCounter() auto-unlocks these when the counter hits the threshold.
var COUNTER_ACHIEVEMENTS = {
  gelato: [
    { id: 'first-gelato',       threshold: 1 },
    { id: 'counter-gelato-10',  threshold: 10 }
  ],
  pasta:      [{ id: 'counter-pasta-10',     threshold: 10 }],
  pizza:      [{ id: 'counter-pizza-5',      threshold: 5 }],
  espresso:   [{ id: 'counter-espresso-14',  threshold: 14 }],
  cappuccino: [{ id: 'counter-cappuccino-7', threshold: 7 }],
  wine:       [{ id: 'counter-wine-5',       threshold: 5 }]
};

// Display metadata for counter chips / stats
var COUNTER_TYPES = [
  { key: 'gelato',     label: 'Gelato',     icon: '🍨', color: '#EC4899' },
  { key: 'pasta',      label: 'Pasta',      icon: '🍝', color: '#CE2B37' },
  { key: 'pizza',      label: 'Pizza',      icon: '🍕', color: '#F97316' },
  { key: 'espresso',   label: 'Espresso',   icon: '☕', color: '#6B4423' },
  { key: 'cappuccino', label: 'Cappuccino', icon: '🥛', color: '#C9A97E' },
  { key: 'wine',       label: 'Wine',       icon: '🍷', color: '#7C2D3A' }
];

// Category labels
var ACHIEVEMENT_CATEGORIES = {
  'food':       { label: 'Food & Drink', icon: '🍝' },
  'landmark':   { label: 'Landmarks',    icon: '🏛️' },
  'experience': { label: 'Experiences',  icon: '✨' },
  'culture':    { label: 'Culture',      icon: '🇮🇹' },
  'travel':     { label: 'Travel',       icon: '🚂' },
  'platinum':   { label: 'Platinum',     icon: '💎' }
};
