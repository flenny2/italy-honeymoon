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
    challenge: 'Wander Trastevere after 9pm',
    howTo: 'Cross the Tiber into Trastevere after dinner. Walk the cobblestone streets when the ivy-covered buildings are lit up and the neighborhood comes alive. No destination needed — just wander until you feel like stopping.',
    rarity: 'common' },

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
    howTo: 'Find your platform (binario) at the station, validate your ticket at the yellow machine, board, and enjoy the view. Pro tip: the countryside between Rome and Florence is gorgeous.',
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
  { id: 'sunrise',          title: 'Early Bird',           icon: '🌅', category: 'experience',
    challenge: 'Catch a sunrise in Italy',
    howTo: 'Set an alarm, drag yourselves out of bed, and find a spot with a view. The Colosseum at dawn, the Arno riverbank, or your hotel rooftop all work. Coffee in hand is encouraged.',
    rarity: 'rare' },

  { id: 'love-lock',        title: 'Sealed With a Kiss',   icon: '💕', category: 'experience',
    challenge: 'Share a kiss at a famous romantic spot',
    howTo: 'Juliet\'s balcony in Verona, the Ponte Vecchio at sunset, a gondola in Venice, or Punta Spartivento on Lake Como. Pick your moment, and make it count.',
    rarity: 'common' },
];

// Rarity colors and labels for the game-style UI
var RARITY = {
  'common':    { label: 'Common',    color: '#6B7280', bg: '#F3F4F6' },
  'uncommon':  { label: 'Uncommon',  color: '#008C45', bg: '#E8F5EC' },
  'rare':      { label: 'Rare',      color: '#3B82F6', bg: '#DBEAFE' },
  'legendary': { label: 'Legendary', color: '#E8B931', bg: '#FFF8E1' }
};

// Category labels
var ACHIEVEMENT_CATEGORIES = {
  'food':       { label: 'Food & Drink', icon: '🍝' },
  'landmark':   { label: 'Landmarks',    icon: '🏛️' },
  'experience': { label: 'Experiences',  icon: '✨' },
  'culture':    { label: 'Culture',      icon: '🇮🇹' },
  'travel':     { label: 'Travel',       icon: '🚂' }
};
