// tests/keepsakes-fixture.mjs — one honeymoon's worth of keepsakes, shaped
// exactly as the app writes them (field order included), shared by
// keepsakes.test.mjs and keepsakes-drive.mjs. The content is made up; the
// names and settings are the app's own first-run defaults (app.js).

const at = (iso) => Date.parse(iso);
// Storage.saveLetter's "gentle seal": UTF-8 base64
const seal = (text) => Buffer.from(text, 'utf8').toString('base64');

// Words that exist only inside the sealed time capsule. A saved file must
// never show them in plain text.
export const CAPSULE_SECRET = 'we never wanted to leave Positano';

// The app's first-run settings seed (app.js seedSettingsIfEmpty), as stored:
// what a wiped phone holds by the time Settings can be opened.
export const FIRST_RUN_SETTINGS = {
  userName: 'Dylan', partnerName: 'Hope', petName: '', weddingDate: '2026-06-06',
  hometown: 'Brea, CA', departureAirport: 'LAX', couplePhoto: '',
};

// `photo` is a JPEG data URL, like the ones journal.js and settings.js make.
export function keepsakeSeed(photo = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP') {
  const journal = [
    { date: '2026-06-14', city: 'Rome', day: 2, prompt: 'What surprised you today?',
      text: 'The Colosseum at golden hour, and the gelato after. Caffè on every corner.',
      id: `j-${at('2026-06-14T19:30:00+02:00')}`, timestamp: at('2026-06-14T19:30:00+02:00') },
    { date: '2026-06-19', city: 'Florence', day: 7, prompt: 'Describe a moment you want to remember forever.',
      text: 'Lost in the Oltrarno, found the best schiacciata of our lives 💕',
      photo, id: `j-${at('2026-06-19T18:30:00+02:00')}`, timestamp: at('2026-06-19T18:30:00+02:00') },
    { date: '2026-06-25', city: 'Venice', day: 13, prompt: 'What made you laugh today?',
      text: 'The gondolier sang to us and Hope cried. Then I did.',
      id: `j-${at('2026-06-25T20:30:00+02:00')}`, timestamp: at('2026-06-25T20:30:00+02:00') },
  ];
  const achievements = {
    'first-gelato':   { unlocked: true, unlockedAt: at('2026-06-13T21:10:00+02:00') },
    'trevi-coin':     { unlocked: true, unlockedAt: at('2026-06-15T22:05:00+02:00') },
    'sistine-chapel': { unlocked: true, unlockedAt: at('2026-06-18T10:40:00+02:00') },
  };
  return {
    'italy-places-v3': { starred: ['l1', 'r1', 'f9'] },
    'italy-journal-v1': journal,
    'italy-letters-v1': [
      // still sealed: opens on the first wedding anniversary
      { from: 'Dylan', recipient: 'Hope', unlockDate: '2027-06-06',
        id: `letter-${at('2026-06-13T19:00:00+02:00')}`, createdAt: at('2026-06-13T19:00:00+02:00'),
        sealedText: seal('Happy first anniversary, amore. Ti amo 💍'), sealed: true },
      // opened on the last night in Italy
      { from: 'Hope', recipient: 'Dylan', unlockDate: '2026-06-26',
        id: `letter-${at('2026-06-15T19:00:00+02:00')}`, createdAt: at('2026-06-15T19:00:00+02:00'),
        sealedText: seal('Two weeks of you and Italy. Best trip of my life.'), sealed: true,
        text: 'Two weeks of you and Italy. Best trip of my life.', isRead: true },
    ],
    'italy-achievements-v1': achievements,
    'italy-capsule-v1': {
      letter: `Dear future us, ${CAPSULE_SECRET}.`,
      favoritePlace: 'The terrace in Positano',
      bestMeal: 'Cacio e pepe at Roscioli',
      bestMoment: 'The gondola serenade at sunset',
      locked: true, lockUntil: '2027-06-27', sealedAt: at('2026-06-26T23:00:00+02:00'),
      snapshot: { journal, achievements },
    },
    'italy-settings-v1': { ...FIRST_RUN_SETTINGS, petName: 'amore', couplePhoto: photo },
    'italy-counters-v1': {
      gelato: 2, pasta: 1, pizza: 0, espresso: 0, cappuccino: 0, wine: 1,
      history: [
        { type: 'gelato', ts: at('2026-06-13T21:10:00+02:00'), city: 'Rome' },
        { type: 'pasta',  ts: at('2026-06-15T20:00:00+02:00'), city: 'Rome' },
        { type: 'wine',   ts: at('2026-06-20T13:00:00+02:00'), city: 'Tuscany' },
        { type: 'gelato', ts: at('2026-06-21T16:00:00+02:00'), city: 'Florence' },
      ],
    },
    'italy-bookings-v1': { 'bk-secretfood': true, 'bk-pantheon': true, 'gift-1': { status: 'completed' } },
  };
}
