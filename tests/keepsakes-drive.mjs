#!/usr/bin/env node
// tests/keepsakes-drive.mjs — the keepsakes promise, end to end, in headless
// Chrome at iPhone width:
//
//   seed the app with a honeymoon's keepsakes → tap "Save a copy" → WIPE the
//   browser storage → "Restore from a copy" → every key back, byte for byte,
//   and the journal, letters and capsule pages show them again.
//
// Then: a newer phone restoring an older copy changes nothing; files that are
// not copies are refused untouched; and the iPhone share-sheet path, with
// navigator.share/canShare replaced by a stand-in that follows WebKit's rules
// (Source/WebCore/page/Navigator.cpp: canShare takes any non-empty file list;
// share() needs the tap's own user activation, resolves when the sheet is
// done, rejects AbortError when it is dismissed).
//
// What this can NOT prove: a real iPhone's share sheet, Files app, or its
// home-screen storage. Those need one real tap on the phone.
//
// Zero installs: node:http serves this repo on 127.0.0.1 for the run only,
// and the CDP client is Node 22's built-in WebSocket. Chrome runs headless (no
// window) on a throwaway profile with an OS-picked debug port, so it can't
// attach to another session's browser; both temp folders are deleted at the
// end (headless-qa rules 4, 5, 10).
//
// Run from the repo root:   node tests/keepsakes-drive.mjs [--shots <dir>]
// --shots writes the Settings card and the restore confirm as PNGs there.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { keepsakeSeed, CAPSULE_SECRET } from './keepsakes-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shotsArg = process.argv.indexOf('--shots');
const SHOTS = shotsArg > 0 ? path.resolve(process.argv[shotsArg + 1]) : null;
const PHONE = { width: 390, height: 844 };
const FILE_NAME = /^italy-keepsakes-\d{4}-\d{2}-\d{2}\.json$/;
const SW_SOURCE = readFileSync(path.join(REPO, 'sw.js'), 'utf8');
const CACHE_NAME = SW_SOURCE.match(/var CACHE_NAME = '([^']+)'/)[1];

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf',
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let checks = 0;
function check(ok, what) {
  if (!ok) throw new Error(what);
  checks++;
}

// ── Plumbing: a static server, Chrome, and a small CDP client ──

function serve() {
  const server = createServer(async (req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(REPO, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(REPO + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);   // read first, so a miss can still 404
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = new Map();
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method) { this.handlers.get(msg.method)?.(msg.params); return; }
      const slot = msg.id && this.pending.get(msg.id);
      if (!slot) return;
      this.pending.delete(msg.id);
      msg.error ? slot.reject(new Error(JSON.stringify(msg.error))) : slot.resolve(msg.result);
    });
  }
  on(method, handler) { this.handlers.set(method, handler); }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  // CDP's Runtime.evaluate (not JavaScript eval): every expression is built
  // in this file from literals and the fixture; nothing external is run.
  async page(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate',
      { expression, awaitPromise: true, returnByValue: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  }
}

async function launchChrome(profile) {
  const chrome = spawn('google-chrome', [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', 'about:blank',
  ], { stdio: 'ignore' });
  // Port 0 lets the OS pick a free port; Chrome writes it to this file.
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 150 && !existsSync(portFile); i++) await sleep(100);
  if (!existsSync(portFile)) throw new Error('Chrome never reported its debug port');
  const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
  for (let i = 0; i < 100; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const tab = targets.find((t) => t.type === 'page');
      if (tab) {
        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
        return { chrome, cdp: new Cdp(ws) };
      }
    } catch { /* not up yet */ }
    await sleep(100);
  }
  throw new Error('could not attach to Chrome');
}

// ── Driving the app ──

async function waitFor(cdp, expression, what, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await cdp.page(`(async () => !!(await (${expression})))()`)) return;
    await sleep(100);
  }
  throw new Error(`timed out waiting for ${what}`);
}

// A real (trusted) tap at the element's centre: unlike element.click(), it
// grants user activation, which WebKit's share() requires.
async function tap(cdp, selector) {
  const point = await cdp.page(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  if (!point) throw new Error(`nothing to tap: ${selector}`);
  for (const type of ['mousePressed', 'mouseReleased']) {
    await cdp.send('Input.dispatchMouseEvent', { type, x: point.x, y: point.y, button: 'left', clickCount: 1 });
  }
}

async function openPage(cdp, hash, ready) {
  await cdp.page(`(() => { location.hash = ${JSON.stringify(hash)}; return 1; })()`);
  await waitFor(cdp, ready, `${hash} to render`);
}

async function reload(cdp, ready) {
  await cdp.page('(() => { window.__beforeReload = true; return 1; })()');
  await cdp.send('Page.reload');
  await waitFor(cdp, `!window.__beforeReload && document.readyState === 'complete' && typeof Keepsakes !== 'undefined' && (${ready})`, 'reload');
}

const SETTINGS_READY = `document.querySelector('#page-settings.active .keepsakes-card')`;
const summaryLine = (cdp) => cdp.page(`document.querySelector('.keepsakes-summary').textContent.toLowerCase()`);
const clearToast = (cdp) => cdp.page(`(() => { const t = document.getElementById('toast'); t.textContent = ''; t.classList.remove('show'); return 1; })()`);
const waitToast = (cdp, words) => waitFor(cdp,
  `document.getElementById('toast').textContent.toLowerCase().includes(${JSON.stringify(words.toLowerCase())})`, `toast "${words}"`);

// Every key the app owns → its raw stored string (null when absent).
const storageNow = (cdp) => cdp.page(`Object.fromEntries(Object.values(Storage.KEYS).map((k) => [k, localStorage.getItem(k)]))`);

async function pickFile(cdp, file) {
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#keepsakes-file' });
  if (!nodeId) throw new Error('no restore file input on Settings');
  await cdp.send('DOM.setFileInputFiles', { nodeId, files: [file] });
}

async function jsonFiles(dir) {
  return (await readdir(dir)).filter((name) => name.endsWith('.json')).sort();
}

async function waitForNewDownload(dir, before) {
  for (let i = 0; i < 100; i++) {
    const fresh = (await jsonFiles(dir)).filter((name) => !before.includes(name));
    if (fresh.length) return fresh[0];
    await sleep(100);
  }
  throw new Error('no copy was downloaded');
}

// headless-qa rule 1: finish every animation before measuring or shooting.
const finishAnimations = (cdp) =>
  cdp.page(`(() => { document.getAnimations().forEach((a) => { try { a.finish(); } catch (e) {} }); return 1; })()`);

async function shoot(cdp, name) {
  if (!SHOTS) return;
  await finishAnimations(cdp);
  await sleep(150);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  await mkdir(SHOTS, { recursive: true });
  await writeFile(path.join(SHOTS, name), Buffer.from(data, 'base64'));
  console.log(`     shot ${path.relative(REPO, path.join(SHOTS, name))}`);
}

// Measured, not assumed (headless-qa rule 2): each selector's box sits inside
// the phone's width, is tall enough to tap, and is not covered at its centre.
async function assertTappable(cdp, selectors) {
  await finishAnimations(cdp);   // the confirm pops in from 80% scale (modalBounceIn)
  const boxes = await cdp.page(`(${JSON.stringify(selectors)}).map((sel) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { sel, left: r.left, right: r.right, top: r.top, bottom: r.bottom, height: r.height,
             onTop: !!hit && (hit === el || el.contains(hit)) };
  })`);
  for (const b of boxes) {
    check(b.left >= 0 && b.right <= PHONE.width, `${b.sel} spills past the screen edge (${b.left}–${b.right})`);
    check(b.height >= 40, `${b.sel} is only ${b.height}px tall`);
    check(b.onTop, `${b.sel} is covered by something else at its centre`);
  }
  return boxes;
}

// Stand-in for WebKit's Web Share, installed before the app loads.
const WEBKIT_SHARE = `(() => {
  window.__shares = [];
  window.__shareMode = 'complete';
  Object.defineProperty(navigator, 'standalone', { value: true, configurable: true });   // home-screen app
  Object.defineProperty(navigator, 'canShare', { configurable: true,
    value: (data) => !!(data && data.files && data.files.length) });
  Object.defineProperty(navigator, 'share', { configurable: true, value: (data) => {
    if (!navigator.userActivation.isActive) {
      return Promise.reject(new DOMException('share() needs a tap', 'NotAllowedError'));
    }
    if (window.__shareMode === 'abort') return Promise.reject(new DOMException('sheet dismissed', 'AbortError'));
    const file = data.files[0];
    return file.text().then((text) => {
      window.__shares.push({ keys: Object.keys(data), count: data.files.length,
                             name: file.name, type: file.type, text });
    });
  } });
})();`;

// ── The drive ──

async function main() {
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = await mkdtemp(path.join(tmpdir(), 'italy-keep-profile-'));
  const downloads = await mkdtemp(path.join(tmpdir(), 'italy-keep-downloads-'));
  let chrome, cdp, failed = false;
  const step = (n, msg) => console.log(`  ${n}. ${msg}`);
  try {
    ({ chrome, cdp } = await launchChrome(profile));
    await cdp.send('Page.enable');
    await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: PHONE.width, height: PHONE.height, deviceScaleFactor: 2, mobile: true });

    await cdp.send('Page.navigate', { url: `${origin}/index.html` });
    await waitFor(cdp, `location.href.startsWith(${JSON.stringify(origin)}) && typeof Keepsakes !== 'undefined' && document.querySelector('#tab-bar')`, 'the app');
    check(await cdp.page('innerWidth') === PHONE.width, 'the viewport is not phone width (headless-qa rule 9)');
    step(1, `app booted at ${origin}, ${PHONE.width}px wide`);

    // ── Seed: a honeymoon's keepsakes, with a real JPEG made the way the app makes them
    const photo = await cdp.page(`(() => {
      const c = document.createElement('canvas'); c.width = 600; c.height = 400;
      const g = c.getContext('2d');
      const sky = g.createLinearGradient(0, 0, 0, 400);
      sky.addColorStop(0, '#F4A261'); sky.addColorStop(1, '#2A9D8F');
      g.fillStyle = sky; g.fillRect(0, 0, 600, 400);
      g.fillStyle = '#FEFCF8'; g.font = 'bold 64px serif'; g.fillText('D & H', 190, 220);
      return c.toDataURL('image/jpeg', 0.75);
    })()`);
    const seed = keepsakeSeed(photo);
    const seedRaw = Object.fromEntries(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
    const owned = (await cdp.page('Object.values(Storage.KEYS)')).sort();
    check(JSON.stringify(Object.keys(seedRaw).sort()) === JSON.stringify(owned), 'the fixture must cover every key the app owns');
    await cdp.page(`(() => { const s = ${JSON.stringify(seedRaw)}; for (const k in s) localStorage.setItem(k, s[k]); return 1; })()`);
    await openPage(cdp, '#settings', SETTINGS_READY);
    await reload(cdp, SETTINGS_READY);
    check(await summaryLine(cdp) === 'on this phone: 3 journal entries · 2 letters · capsule sealed',
      `Settings summary reads "${await summaryLine(cdp)}"`);
    step(2, 'seeded; Settings reads "On this phone: 3 journal entries · 2 letters · capsule sealed"');

    // ── The Settings card, scrolled fully down: on the phone, tappable, uncovered
    await cdp.page(`(() => { const s = document.querySelector('#page-settings .page-scroll');
      s.scrollTo({ top: s.scrollHeight, behavior: 'instant' }); return 1; })()`);
    const boxes = await assertTappable(cdp, ['.keepsakes-save-btn', '.keepsakes-restore-btn']);
    const backBtn = await cdp.page(`(() => { const r = document.querySelector('#page-settings .back-btn').getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; })()`);
    check(boxes.every((b) => b.bottom <= backBtn.top || b.top >= backBtn.bottom), 'the back button overlaps a keepsakes button');
    await clearToast(cdp);
    await cdp.page(`(() => { const card = document.querySelector('.keepsakes-card');
      card.scrollIntoView({ block: 'center', behavior: 'instant' }); return 1; })()`);
    await shoot(cdp, 'keepsakes-settings.png');
    step(3, `buttons measured: ${boxes.map((b) => `${Math.round(b.height)}px tall`).join(', ')}, inside 390px, clear of the back button`);

    // ── Save a copy (this Chrome can't share .json files, so it downloads)
    const canShareHere = await cdp.page(`!!(navigator.canShare && navigator.canShare({ files: [new File(['{}'], 'x.json', { type: 'application/json' })] }))`);
    check(!canShareHere, 'expected the download path in desktop Chrome');
    await clearToast(cdp);
    let before = await jsonFiles(downloads);
    await tap(cdp, '.keepsakes-save-btn');
    const saved = await waitForNewDownload(downloads, before);
    await waitToast(cdp, 'copy downloaded');
    const savedPath = path.join(downloads, saved);
    const fileText = await readFile(savedPath, 'utf8');
    const copy = JSON.parse(fileText);
    const today = await cdp.page('localISODate()');
    check(FILE_NAME.test(saved) && saved === `italy-keepsakes-${today}.json`, `file named ${saved}`);
    check(copy.app === 'italy-honeymoon' && copy.kind === 'keepsakes' && copy.version === 1, 'file header');
    check(JSON.stringify(Object.keys(copy.keys).sort()) === JSON.stringify(owned), 'the file holds exactly the keys the app owns');
    for (const key of owned.filter((k) => k !== 'italy-capsule-v1')) {
      check(JSON.stringify(copy.keys[key]) === seedRaw[key], `${key} in the file differs from the phone`);
    }
    check(Buffer.from(copy.keys['italy-capsule-v1'], 'base64').toString('utf8') === seedRaw['italy-capsule-v1'], 'sealed capsule decodes to the phone\'s capsule');
    check(!fileText.includes(CAPSULE_SECRET), 'the capsule\'s words are readable in the file');
    step(4, `saved ${saved} (${Math.round(fileText.length / 1024)} KB): 8 of 8 keys, capsule sealed, matches the phone`);

    // ── Wipe the browser storage, as clearing site data would
    await cdp.page('(() => { localStorage.clear(); return 1; })()');
    await reload(cdp, SETTINGS_READY);
    check(await summaryLine(cdp) === 'on this phone: 0 journal entries · 0 letters · capsule not sealed', 'the wipe did not take');
    step(5, 'storage wiped; Settings reads "0 journal entries · 0 letters · capsule not sealed"');

    // ── Restore from the copy: the confirm step, then the write
    await pickFile(cdp, savedPath);
    await waitFor(cdp, `document.querySelector('#surprise-modal.open .keepsakes-table')`, 'the restore confirm');
    const confirm = await cdp.page(`({
      title: document.querySelector('#surprise-content h2').textContent,
      meta: document.querySelector('#surprise-content .modal-meta').textContent,
      rows: [...document.querySelectorAll('.keepsakes-table tr:not(.keepsakes-head)')]
        .map((tr) => [...tr.cells].map((td) => td.textContent.trim()).filter((t, i) => i !== 2)),
      overflow: (() => { const c = document.getElementById('surprise-content'); return c.scrollWidth - c.clientWidth; })(),
    })`);
    const expected = [
      ['Journal entries', '0', '3'], ['Letters', '0', '2'], ['Time capsule', 'not sealed', 'sealed'],
      ['Favorites', '0', '3'], ['Achievements', '0', '3'], ['Trip stats', '0', '4'],
      ['Booking checklist', '0', '3'], ['Names, dates & photo', '5', '7'],
    ];
    check(confirm.title === 'Restore from this copy?', `confirm title "${confirm.title}"`);
    check(/^Copy saved [A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(confirm.meta), `confirm says "${confirm.meta}"`);
    check(JSON.stringify(confirm.rows) === JSON.stringify(expected), `confirm counts ${JSON.stringify(confirm.rows)}`);
    check(confirm.overflow <= 0, 'the confirm scrolls sideways');
    await assertTappable(cdp, ['button[onclick="Keepsakes.cancelRestore()"]', 'button[onclick="Keepsakes.confirmRestore()"]']);
    await shoot(cdp, 'keepsakes-restore-confirm.png');
    step(6, 'confirm shows now → after for all 8 parts (journal 0 → 3, letters 0 → 2, capsule not sealed → sealed …)');

    await clearToast(cdp);
    await tap(cdp, 'button[onclick="Keepsakes.confirmRestore()"]');
    await waitToast(cdp, 'restored');
    check(!(await cdp.page(`document.getElementById('surprise-modal').classList.contains('open')`)), 'the confirm stayed open');
    const restored = await storageNow(cdp);
    for (const key of owned) check(restored[key] === seedRaw[key], `${key} did not come back byte for byte`);
    check(await summaryLine(cdp) === 'on this phone: 3 journal entries · 2 letters · capsule sealed', 'Settings did not refresh');
    step(7, 'restored: all 8 keys byte-identical to before the wipe');

    // ── What the two of them would see again
    await openPage(cdp, '#journal', `document.querySelector('#page-journal.active .journal-entry')`);
    await waitFor(cdp, `[...document.querySelectorAll('.journal-entry-photo img')].every((img) => img.complete)`, 'the journal photo to load');
    const journal = await cdp.page(`({ text: document.getElementById('journal-content').innerText.toLowerCase(),
      photos: [...document.querySelectorAll('.journal-entry-photo img')].map((img) => img.naturalWidth) })`);
    for (const entry of seed['italy-journal-v1']) check(journal.text.includes(entry.text.toLowerCase()), `journal is missing "${entry.text}"`);
    check(journal.photos.length === 1 && journal.photos[0] > 0, 'the journal photo did not come back');
    await openPage(cdp, '#letters', `document.querySelector('#page-letters.active .letter-card')`);
    check(await cdp.page(`document.querySelectorAll('#letters-content .letter-card').length`) === 2, 'letters missing');
    await openPage(cdp, '#capsule', `document.querySelector('#page-capsule.active h2')`);
    check((await cdp.page(`document.getElementById('capsule-content').innerText.toLowerCase()`)).includes('capsule sealed'), 'capsule not sealed');
    await openPage(cdp, '#settings', SETTINGS_READY);
    await waitFor(cdp, `document.querySelector('.settings-photo-preview img')?.complete`, 'the couple photo to load');
    check(await cdp.page(`document.querySelector('.settings-photo-preview img').naturalWidth`) > 0, 'the couple photo did not come back');
    step(8, 'journal (3 entries + photo), 2 letters, sealed capsule and the couple photo all show again');

    // ── A newer phone restoring the older copy: nothing changes
    await openPage(cdp, '#journal', `document.querySelector('#page-journal.active #journal-input')`);
    await cdp.page(`(() => { document.getElementById('journal-input').value = 'Home again. Still dreaming in Italian.'; return 1; })()`);
    await tap(cdp, 'button[onclick="saveJournalFromInput()"]');
    await waitFor(cdp, `document.querySelectorAll('#journal-content .journal-entry').length === 4`, 'the new journal entry');
    await openPage(cdp, '#settings', SETTINGS_READY);
    const newer = await storageNow(cdp);
    await pickFile(cdp, savedPath);
    await waitFor(cdp, `document.querySelector('#surprise-modal.open .keepsakes-table')`, 'the restore confirm');
    const same = await cdp.page(`({ title: document.querySelector('#surprise-content h2').textContent,
      restoreButton: !!document.querySelector('button[onclick="Keepsakes.confirmRestore()"]'),
      journal: [...document.querySelectorAll('.keepsakes-table tr')][1].textContent })`);
    check(same.title === 'Already on this phone' && !same.restoreButton, `newer phone was offered a restore: ${JSON.stringify(same)}`);
    check(same.journal.replace(/\s+/g, '') === 'Journalentries4→4', `journal row reads "${same.journal}"`);
    await tap(cdp, 'button[onclick="Keepsakes.cancelRestore()"]');
    check(JSON.stringify(await storageNow(cdp)) === JSON.stringify(newer), 'restoring an older copy changed the newer phone');
    step(9, 'newer phone + older copy: "Already on this phone", journal 4 → 4, storage untouched');

    // ── Files that are not copies: refused, nothing touched
    const tooBig = path.join(downloads, 'holiday-video.mov');   // picked by mistake
    await writeFile(tooBig, Buffer.alloc(21 * 1024 * 1024, 'a'));
    for (const [file, words] of [[path.join(REPO, 'manifest.json'), "isn't a keepsakes copy"], [tooBig, 'too big']]) {
      await clearToast(cdp);
      await pickFile(cdp, file);
      await waitToast(cdp, words);
      check(!(await cdp.page(`document.getElementById('surprise-modal').classList.contains('open')`)), `${path.basename(file)} opened the confirm`);
      check(JSON.stringify(await storageNow(cdp)) === JSON.stringify(newer), `${path.basename(file)} changed storage`);
    }
    step(10, 'the app\'s manifest.json and a 21 MB video: both refused, storage untouched');

    // ── iPhone path: the share sheet, under WebKit's rules
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: WEBKIT_SHARE });
    await reload(cdp, SETTINGS_READY);
    // (a) share() reached without a tap is refused, as WebKit refuses it. The
    // app says "try again" and does NOT fall back to a download (in a
    // home-screen app that opens a preview that can strand you).
    before = await jsonFiles(downloads);
    await clearToast(cdp);
    await cdp.page('(() => { Keepsakes.save(); return 1; })()');
    await waitToast(cdp, "couldn't save the copy");
    await sleep(500);
    check((await cdp.page('window.__shares.length')) === 0, 'share() ran without a tap');
    check(JSON.stringify(await jsonFiles(downloads)) === JSON.stringify(before), 'a refused share fell back to a download');
    // (b) a real tap: the file goes to the share sheet, nothing downloads
    await clearToast(cdp);
    await tap(cdp, '.keepsakes-save-btn');
    await waitFor(cdp, 'window.__shares.length === 1', 'the share sheet');
    await waitToast(cdp, 'copy saved');
    const shared = await cdp.page('window.__shares[0]');
    check(JSON.stringify(shared.keys) === '["files"]' && shared.count === 1, `share() got ${JSON.stringify(shared.keys)}`);
    check(FILE_NAME.test(shared.name) && shared.type === 'application/json', `shared file ${shared.name} (${shared.type})`);
    const sharedCopy = JSON.parse(shared.text);
    for (const key of owned.filter((k) => k !== 'italy-capsule-v1')) {
      check(JSON.stringify(sharedCopy.keys[key]) === newer[key], `${key} in the shared file differs from the phone`);
    }
    check(JSON.stringify(await jsonFiles(downloads)) === JSON.stringify(before), 'the share path also downloaded');
    // (c) the sheet dismissed: no copy, no download, a plain word
    await cdp.page(`(() => { window.__shareMode = 'abort'; return 1; })()`);
    await clearToast(cdp);
    await tap(cdp, '.keepsakes-save-btn');
    await waitToast(cdp, 'no copy saved');
    check((await cdp.page('window.__shares.length')) === 1, 'a dismissed sheet recorded a share');
    check(JSON.stringify(await jsonFiles(downloads)) === JSON.stringify(before), 'a dismissed sheet downloaded');
    step(11, 'iPhone path: tap → share sheet gets one .json file, no download; no tap → refused, "try again", no download; sheet dismissed → "No copy saved"');

    // ── Reset All Data warns that it erases the keepsakes; Cancel keeps them
    let warning = null;
    cdp.on('Page.javascriptDialogOpening', ({ message }) => {
      warning = message;
      cdp.send('Page.handleJavaScriptDialog', { accept: false }).catch(() => {});   // tap Cancel
    });
    const resetButton = '#page-more button[onclick*="resetAll"]';
    await openPage(cdp, '#more', `document.querySelector('#page-more.active') && document.querySelector('${resetButton}')`);
    const beforeReset = await storageNow(cdp);
    await tap(cdp, resetButton);
    for (let i = 0; i < 50 && warning === null; i++) await sleep(100);
    check(/journal, letters and time capsule/.test(warning ?? '') && /save a copy/i.test(warning ?? ''),
      `the reset warning reads "${warning}"`);
    check(JSON.stringify(await storageNow(cdp)) === JSON.stringify(beforeReset), 'cancelling the reset erased something');
    step(12, 'Reset All Data warns "…including the journal, letters and time capsule… Save a copy first"; Cancel erases nothing');

    // ── Their own words come back looking right: "</3" and "<b>" typed in the journal
    const tricky = 'Last night in Venice </3 <b>ciao</b> <3';
    await openPage(cdp, '#journal', `document.querySelector('#page-journal.active #journal-input')`);
    await cdp.page(`(() => { document.getElementById('journal-input').value = ${JSON.stringify(tricky)}; return 1; })()`);
    await tap(cdp, 'button[onclick="saveJournalFromInput()"]');
    await waitFor(cdp, `document.querySelectorAll('#journal-content .journal-entry').length === 5`, 'the typed entry');
    await openPage(cdp, '#settings', SETTINGS_READY);
    await cdp.page(`(() => { window.__shareMode = 'complete'; return 1; })()`);
    const sharesBefore = await cdp.page('window.__shares.length');
    await tap(cdp, '.keepsakes-save-btn');
    await waitFor(cdp, `window.__shares.length === ${sharesBefore + 1}`, 'the share sheet');
    const trickyCopy = path.join(downloads, 'tricky-copy.json');   // as saved to Files from the sheet
    await writeFile(trickyCopy, await cdp.page(`window.__shares[${sharesBefore}].text`));
    await cdp.page('(() => { localStorage.clear(); return 1; })()');
    await reload(cdp, SETTINGS_READY);
    await pickFile(cdp, trickyCopy);
    await waitFor(cdp, `document.querySelector('#surprise-modal.open .keepsakes-table')`, 'the restore confirm');
    check(!(await cdp.page(`!!document.querySelector('.keepsakes-leftout')`)), 'a genuine copy had something left out');
    await tap(cdp, 'button[onclick="Keepsakes.confirmRestore()"]');
    await waitToast(cdp, 'restored');
    await openPage(cdp, '#journal', `document.querySelectorAll('#page-journal.active .journal-entry').length === 5`);
    const shown = await cdp.page(`[...document.querySelectorAll('.journal-entry-text')].map((el) => el.innerText)`);
    check(shown.includes(tricky), `the typed entry shows as ${JSON.stringify(shown.find((t) => t.startsWith('Last night')))}`);
    const storedTricky = (await cdp.page(`JSON.parse(localStorage.getItem('italy-journal-v1'))`)).find((e) => e.text.startsWith('Last night'));
    check(storedTricky.text === 'Last night in Venice &lt;/3 &lt;b>ciao&lt;/b> <3', `stored as ${storedTricky.text}`);
    step(13, 'typed "</3 <b>ciao</b> <3" → saved through the share sheet → wiped → restored: shows exactly as typed (stored defused)');

    // ── A crafted copy carrying every attack the 2026-10-09 cold read tried
    const run = 'window.__pwned=(window.__pwned||0)+1';
    const evil = JSON.parse(await readFile(trickyCopy, 'utf8'));
    const seal = (text) => Buffer.from(text, 'utf8').toString('base64');
    evil.keys['italy-journal-v1'].push(
      { date: '2026-06-26', city: 'Venice', day: 14, prompt: 'x', text: `<img src=x onerror="${run}">`, id: 'j-crafted', timestamp: 1782500000000 },
      { text: { toString: 1 }, id: 'j-crash', timestamp: 1 });
    evil.keys['italy-letters-v1'].push(
      { from: 'Hope', recipient: 'Dylan', unlockDate: '2026-06-26', id: `x');${run};('`, createdAt: 1, sealedText: seal('hi'), sealed: true },
      { from: 'Hope', recipient: 'Dylan', unlockDate: '2026-06-26', id: 'letter-crafted', createdAt: 2, sealedText: seal(`<img src=x onerror="${run}">`), sealed: true });
    evil.keys['italy-bookings-v1']['gift-2'] = { status: `x" style="animation:modalBounceIn 1ms" onanimationstart="${run}` };
    evil.keys['italy-settings-v1'].userName = `Dylan&lt;img src=x onerror=${run}&gt;`;
    const evilText = JSON.stringify(evil).replace('"italy-achievements-v1":{', '"italy-achievements-v1":{"__proto__":{"unlocked":true,"unlockedAt":1},');
    const crafted = path.join(downloads, 'crafted-copy.json');
    await writeFile(crafted, evilText);

    await openPage(cdp, '#settings', SETTINGS_READY);
    await cdp.page('(() => { localStorage.clear(); return 1; })()');
    await reload(cdp, SETTINGS_READY);
    await pickFile(cdp, crafted);
    await waitFor(cdp, `document.querySelector('#surprise-modal.open .keepsakes-leftout')`, 'the confirm with a left-out line');
    const leftOutLine = await cdp.page(`document.querySelector('.keepsakes-leftout').textContent`);
    check(leftOutLine === "Left out, couldn't be read safely: Journal entries (1), Letters (1), Achievements (1), Booking checklist (1).",
      `left-out line reads "${leftOutLine}"`);
    await tap(cdp, 'button[onclick="Keepsakes.confirmRestore()"]');
    await waitToast(cdp, 'restored');
    const visit = async (hash, ready) => { await openPage(cdp, hash, ready); await sleep(600); };   // onerror fires late
    await visit('#journal', `document.querySelector('#page-journal.active .journal-entry')`);
    check((await cdp.page(`document.getElementById('journal-content').innerText`)).includes('<img src=x onerror='), 'the crafted journal text is not shown as text');
    await visit('#bookings', `document.querySelector('#page-bookings.active .booking-card-gift')`);
    await visit('#place/l1', `document.querySelector('#page-place.active')`);
    await visit('#city/rome', `document.querySelector('#page-city.active')`);
    await visit('#letters', `document.querySelector('#page-letters.active .letter-card')`);
    await tap(cdp, '.letter-card[onclick*="letter-crafted"]');
    await waitFor(cdp, `document.querySelector('#surprise-modal.open .letter-body')`, 'the crafted letter to open');
    await sleep(600);
    check((await cdp.page(`document.querySelector('.letter-body').innerText`)).includes('<img src=x'), 'the crafted letter is not shown as text');
    await tap(cdp, '#surprise-content .btn-primary');
    await visit('#letters', `document.querySelector('#page-letters.active #write-letter-btn')`);
    await tap(cdp, '#write-letter-btn');
    const fromField = await cdp.page(`document.getElementById('letter-from').value`);
    check(fromField === `Dylan&lt;img src=x onerror=${run}&gt;`, `the From field decoded the name: ${fromField}`);
    await cdp.page(`(() => { document.getElementById('letter-text').value = 'Ti amo'; document.getElementById('letter-date').value = '2026-12-25'; return 1; })()`);
    await tap(cdp, 'button[onclick="sealLetter()"]');
    await waitToast(cdp, 'letter sealed');
    await sleep(600);
    check(await cdp.page('window.__pwned === undefined'), `crafted code ran ${await cdp.page('window.__pwned')} time(s)`);
    await openPage(cdp, '#settings', SETTINGS_READY);
    step(14, 'crafted copy (script in a journal entry and a sealed letter, onclick-breaking id, class-breaking gift status, entity name, __proto__, a crash object): 4 left out and named, the rest defused; journal, bookings, place, city, letters, open letter, Write a Letter → Seal It visited: nothing ran');

    // ── New file, three places (CLAUDE.md): script tag, precache list, cache bump
    check(await cdp.page(`!!document.querySelector('script[src="js/keepsakes.js"]')`), 'index.html has no keepsakes.js script tag');
    check(SW_SOURCE.includes("'/js/keepsakes.js'"), 'sw.js APP_FILES lacks /js/keepsakes.js');
    await waitFor(cdp, `navigator.serviceWorker.ready.then(() => caches.open(${JSON.stringify(CACHE_NAME)}))
      .then((c) => c.match('/js/keepsakes.js')).then((r) => !!r)`, 'the service worker to precache keepsakes.js', 30000);
    const cachedBody = await cdp.page(`caches.open(${JSON.stringify(CACHE_NAME)}).then((c) => c.match('/js/keepsakes.js')).then((r) => r.text())`);
    check(cachedBody === readFileSync(path.join(REPO, 'js/keepsakes.js'), 'utf8'), 'the precached keepsakes.js differs from the file');
    step(15, `service worker ${CACHE_NAME} installed and precached js/keepsakes.js`);

    console.log(`\nKEEPSAKES DRIVE PASS — ${checks} checks`);
  } catch (err) {
    failed = true;
    console.error(`\nKEEPSAKES DRIVE FAIL — ${err.message}`);
  } finally {
    cdp?.ws.close();
    chrome?.kill('SIGKILL');   // SIGTERM can leave Chrome holding its port
    server.close();
    await sleep(300);
    await rm(profile, { recursive: true, force: true });
    await rm(downloads, { recursive: true, force: true });
  }
  // Exit explicitly: a killed Chrome can leave a handle that keeps node alive,
  // and a drive that hangs after PASS looks like one that hung mid-check.
  process.exit(failed ? 1 : 0);
}

main();
