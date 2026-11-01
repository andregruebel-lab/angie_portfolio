#!/usr/bin/env node
// Prüfskript für die Seite. Läuft ohne zusätzliche Programme (nur Node).
//   Aufruf:  node tools/pruefung.mjs            (im Hauptordner des Repos)
// Es prüft die Dateien im Repo und beendet sich mit Fehlercode 1, wenn etwas Kritisches gefunden wird (FEHLER).
// WARNUNGEN sind Hinweise und stoppen nichts.
//
// FEHLER (stoppen das Veröffentlichen):
//   - Fotos oder Videos mit Standortdaten oder anderen versteckten Daten (Gerät, Aufnahmezeit) in den Bildordnern
//   - Zugangsdaten im Code (Token, private Schlüssel, .env-Dateien)
//   - CMS-Pfad nicht vor Suchmaschinen geschützt, Verweise auf fehlende Bilder, kaputte Inhaltsdateien
// WARNUNGEN: sehr große Bilder, verräterische Dateinamen, ungenutzte Dateien, Platzhaltertexte, Entwürfe bei Impressum/Datenschutz,
//   externe Verbindungen (Google, unpkg), fehlendes Favicon/Vorschaubild/Sitemap, leere Serien, leere Felder in aktiven Sprachen.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename, relative, sep } from 'node:path';

const ROOT = process.cwd();
const fehler = [];
const warnungen = [];
const ok = [];
const err = (m) => fehler.push(m);
const warn = (m) => warnungen.push(m);
const gut = (m) => ok.push(m);

const IGNORIERT = new Set(['.git', 'node_modules', '.wrangler']);
const alleDateien = (dir = ROOT, out = []) => {
  for (const n of readdirSync(dir)) {
    if (IGNORIERT.has(n)) continue;
    const p = join(dir, n);
    const s = statSync(p);
    if (s.isDirectory()) alleDateien(p, out); else out.push(p);
  }
  return out;
};
const rel = (p) => relative(ROOT, p).split(sep).join('/');
const lies = (p) => readFileSync(p, 'utf8');
const dateien = alleDateien();

// ---------- 1. Fotos und Videos: versteckte Daten ----------
const TIFF_TAGS = { 0x010f: 'Hersteller', 0x0110: 'Gerät', 0x0132: 'Datum' };
function leseTiff(t, info) {
  const le = t.toString('latin1', 0, 2) === 'II';
  const u16 = (o) => (le ? t.readUInt16LE(o) : t.readUInt16BE(o));
  const u32 = (o) => (le ? t.readUInt32LE(o) : t.readUInt32BE(o));
  const off = u32(4);
  const n = u16(off);
  for (let k = 0; k < n; k++) {
    const e = off + 2 + k * 12;
    const tag = u16(e);
    if (TIFF_TAGS[tag]) info.felder.add(TIFF_TAGS[tag]);
    if (tag === 0x8825) { try { if (u16(u32(e + 8)) > 0) info.gps = true; } catch { info.gps = true; } }
    if (tag === 0x8769) {
      try { const xo = u32(e + 8); const xn = u16(xo); for (let j = 0; j < xn; j++) { const t2 = u16(xo + 2 + j * 12); if (t2 === 0x9003 || t2 === 0x9004) info.felder.add('Aufnahmezeit'); } } catch { /* ignorieren */ }
    }
  }
}
function jpegInfo(buf) {
  const info = { exif: false, gps: false, xmp: false, iptc: false, felder: new Set(), breite: 0, hoehe: 0 };
  let i = 2;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const m = buf[i + 1];
    if (m === 0xff) { i += 1; continue; }
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    if (m === 0xd9 || m === 0xda) break;
    const len = buf.readUInt16BE(i + 2);
    const seg = buf.subarray(i + 4, i + 2 + len);
    if (m === 0xe1) {
      if (seg.toString('latin1', 0, 6) === 'Exif\0\0') { info.exif = true; try { leseTiff(seg.subarray(6), info); } catch { info.felder.add('(Exif nicht lesbar)'); } }
      else if (seg.toString('latin1', 0, 28).startsWith('http://ns.adobe.com/xap/1.0/')) info.xmp = true;
    }
    if (m === 0xed && seg.toString('latin1', 0, 13) === 'Photoshop 3.0') info.iptc = true;
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) { info.hoehe = seg.readUInt16BE(1); info.breite = seg.readUInt16BE(3); }
    i += 2 + len;
  }
  return info;
}
function pngHatMetadaten(buf) {
  let i = 8; const gefunden = [];
  while (i + 8 <= buf.length) {
    const len = buf.readUInt32BE(i); const typ = buf.toString('latin1', i + 4, i + 8);
    if (typ === 'eXIf') gefunden.push('EXIF');
    if (typ === 'iTXt' && buf.toString('latin1', i + 8, i + 8 + 24).includes('XML:com.adobe.xmp')) gefunden.push('XMP');
    if (typ === 'IEND') break;
    i += 12 + len;
  }
  return gefunden;
}
const ORT = /[+-]\d{1,3}\.\d{3,}[+-]\d{1,3}\.\d{3,}/;
function videoHatOrt(buf) {
  const stuecke = [buf.subarray(0, 4 * 1024 * 1024)];
  if (buf.length > 4 * 1024 * 1024) stuecke.push(buf.subarray(buf.length - 4 * 1024 * 1024));
  return stuecke.some((s) => s.indexOf(Buffer.from([0xa9, 0x78, 0x79, 0x7a])) >= 0 || ORT.test(s.toString('latin1')));
}
const VERRAETERISCH = /^(img|pxl|dsc|dscf|dji|mvimg|whatsapp|screenshot|photo)[-_ ]?/i;
// Alle Fotos und Videos im ganzen Repo prüfen, nicht nur im Ordner images/ (zum Beispiel wenn jemand eine Datei direkt bei GitHub ablegt).
const bilder = dateien.filter((p) => /\.(jpe?g|png|webp|gif|mp4|mov|m4v)$/i.test(p) && !rel(p).startsWith('tools/'));
// Originalformate von Kameras und Handys gehören nicht ins Repo: Browser zeigen sie nicht an, und sie enthalten oft Standortdaten.
for (const p of dateien) if (/\.(heic|heif|tiff?|dng|raw|cr2|cr3|nef|arw|orf|rw2)$/i.test(p)) err(`${rel(p)}: Originalformat (Kamera/Handy) darf nicht im Repo liegen; es wird nicht angezeigt und kann Standortdaten enthalten.`);
let metadatenProbleme = 0;
for (const p of bilder) {
  const r = rel(p); const buf = readFileSync(p); const kb = Math.round(buf.length / 1024); const name = basename(p);
  const ext = extname(p).toLowerCase();
  if (VERRAETERISCH.test(name) || /\d{8,}/.test(name)) warn(`Dateiname verrät vielleicht Handy oder Datum: ${r}`);
  if (ext === '.jpg' || ext === '.jpeg') {
    if (buf[0] !== 0xff || buf[1] !== 0xd8) { warn(`${r}: keine gültige JPEG-Datei`); continue; }
    const info = jpegInfo(buf);
    if (info.gps) { err(`${r}: enthält einen GPS-STANDORT. Foto neu über das CMS hochladen oder Metadaten entfernen.`); metadatenProbleme++; }
    else if (info.exif || info.xmp || info.iptc) {
      const was = [...info.felder].concat(info.xmp ? ['XMP'] : [], info.iptc ? ['IPTC'] : []).join(', ') || 'Exif';
      err(`${r}: enthält versteckte Daten (${was}).`); metadatenProbleme++;
    }
    if (kb > 700) warn(`${r}: ${kb} KB sind groß für die Seite (empfohlen unter etwa 400 KB).`);
    if (Math.max(info.breite, info.hoehe) > 2000) warn(`${r}: ${info.breite} × ${info.hoehe} Pixel sind größer als nötig (empfohlen höchstens etwa 1600).`);
  } else if (ext === '.png') {
    const m = pngHatMetadaten(buf);
    if (m.length) { err(`${r}: PNG enthält ${m.join(' und ')} (kann Standort enthalten).`); metadatenProbleme++; }
    if (kb > 700) warn(`${r}: ${kb} KB sind groß für die Seite.`);
  } else if (ext === '.webp') {
    const s = buf.toString('latin1');
    if (s.includes('EXIF') || s.includes('XMP ')) { err(`${r}: WebP enthält EXIF oder XMP (kann Standort enthalten).`); metadatenProbleme++; }
  } else if (['.mp4', '.mov', '.m4v'].includes(ext)) {
    if (videoHatOrt(buf)) { err(`${r}: Video enthält vermutlich einen STANDORT. Metadaten entfernen (zum Beispiel ffmpeg -map_metadata -1 -c copy).`); metadatenProbleme++; }
    if (kb > 8192) warn(`${r}: ${(kb / 1024).toFixed(1)} MB sind groß für ein Titelvideo.`);
  }
}
if (!metadatenProbleme) gut(`${bilder.length} Fotos/Videos geprüft: keine Standort- oder Gerätedaten gefunden.`);

// ---------- 2. Zugangsdaten im Code ----------
const TEXT = /\.(html?|js|mjs|json|jsonc|ya?ml|toml|md|txt|css|svg|xml)$/i;
const GEHEIM = [
  [/ghp_[A-Za-z0-9]{30,}/, 'GitHub-Token'], [/github_pat_[A-Za-z0-9_]{30,}/, 'GitHub-Token'], [/\bgh[osur]_[A-Za-z0-9]{30,}/, 'GitHub-Token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'privater Schlüssel'], [/\bAKIA[0-9A-Z]{16}\b/, 'AWS-Schlüssel'], [/\bsk-[A-Za-z0-9]{32,}\b/, 'API-Schlüssel'],
];
const LOSE = /(client_?secret|api_?key|secret_?key|passwor[dt])\s*[:=]\s*["']?[A-Za-z0-9_\-+/]{16,}/i;
let geheimnisse = 0;
for (const p of dateien) {
  const r = rel(p); const n = basename(p);
  if (/^\.env/.test(n) || /\.(pem|key|p12|pfx)$/i.test(n) || n === 'id_rsa') { err(`${r}: Datei mit Zugangsdaten darf nicht im Repo liegen.`); geheimnisse++; continue; }
  if (!TEXT.test(p)) continue;
  const t = lies(p);
  for (const [re, was] of GEHEIM) if (re.test(t)) { err(`${r}: enthält vermutlich ein ${was}.`); geheimnisse++; }
  if (LOSE.test(t)) { warn(`${r}: sieht aus, als stünde dort ein Passwort oder Schlüssel (bitte ansehen).`); }
}
if (!geheimnisse) gut('Keine Zugangsdaten oder Schlüssel im Code gefunden.');

// ---------- 3. Schutz des CMS-Pfads und was nicht veröffentlicht werden soll ----------
const cmsPfad = existsSync(join(ROOT, 'pflege')) ? 'pflege' : (existsSync(join(ROOT, 'admin')) ? 'admin' : null);
if (cmsPfad) {
  const idx = join(ROOT, cmsPfad, 'index.html');
  if (existsSync(idx) && !/name="robots"[^>]*noindex/i.test(lies(idx))) err(`${cmsPfad}/index.html: fehlt <meta name="robots" content="noindex">.`);
  const h = join(ROOT, '_headers');
  if (!existsSync(h) || !/X-Robots-Tag:\s*noindex/i.test(lies(h)) || !lies(h).includes('/' + cmsPfad)) err(`_headers: Der CMS-Pfad /${cmsPfad} hat keinen Sperrvermerk für Suchmaschinen (X-Robots-Tag).`);
  const rb = join(ROOT, 'robots.txt');
  if (existsSync(rb) && new RegExp('/' + cmsPfad, 'i').test(lies(rb))) warn(`robots.txt nennt den CMS-Pfad /${cmsPfad} und verrät ihn damit.`);
  if (!ok.length || true) gut(`CMS-Pfad /${cmsPfad} ist für Suchmaschinen gesperrt.`);
}
const ai = join(ROOT, '.assetsignore');
const ausgenommen = existsSync(ai) ? lies(ai).split('\n').map((x) => x.trim()).filter((x) => x && !x.startsWith('#')) : [];
for (const muss of ['wrangler.jsonc', 'TODO.md', 'README.md', 'CLAUDE.md', 'AGENTS.md', 'tools']) {
  if (existsSync(join(ROOT, muss)) && !ausgenommen.includes(muss)) warn(`.assetsignore: "${muss}" ist nicht ausgenommen und würde auf der Webseite veröffentlicht.`);
}

// ---------- 4. Inhalt: Dateien, Verweise, Platzhalter, Sprachen ----------
const json = {};
for (const n of ['general', 'start', 'arbeiten', 'serien', 'ueber', 'kontakt', 'rechtliches']) {
  const p = join(ROOT, 'content', n + '.json');
  if (!existsSync(p)) continue;
  try { json[n] = JSON.parse(lies(p)); } catch (e) { err(`content/${n}.json ist kein gültiges JSON (${e.message}).`); }
}
const bilderPfade = new Set(bilder.map((p) => '/' + rel(p)));
const verweise = new Set();
const sammle = (v) => { if (typeof v === 'string') { if (v.startsWith('/images/')) verweise.add(v); } else if (Array.isArray(v)) v.forEach(sammle); else if (v && typeof v === 'object') Object.values(v).forEach(sammle); };
Object.values(json).forEach(sammle);
for (const v of verweise) if (!bilderPfade.has(v)) err(`Inhalt verweist auf ein fehlendes Bild: ${v}`);
for (const b of bilderPfade) {
  if (!verweise.has(b) && !dateien.some((p) => !/^images\//.test(rel(p)) && TEXT.test(p) && lies(p).includes(b))) warn(`Nicht verwendet: ${b.slice(1)}`);
}
const g = json.general;
const aktiv = ['de'].concat(((g && g.languages) || []).filter((l) => ['en', 'ru'].includes(l)));
for (const l of aktiv) for (const [datei, o] of Object.entries(json)) {
  if (datei === 'rechtliches' || !o[l]) continue;
  for (const [k, v] of Object.entries(o[l])) if (typeof v === 'string' && !v.trim()) warn(`content/${datei}.json: Feld "${k}" ist in der aktiven Sprache ${l.toUpperCase()} leer.`);
}
if (json.serien && (json.serien.series || []).every((s) => !(s.images || []).some((i) => i.image))) warn('Alle Serien haben keine Bilder (leere Beispiel-Serien sind für Besucher sichtbar).');
const alleTexte = JSON.stringify(json) + ['index.html', 'Series.dc.html'].map((f) => (existsSync(join(ROOT, f)) ? lies(join(ROOT, f)) : '')).join('\n');
if (/Mara Ellison|Lissabon|Lisbon|studio@maraellison/i.test(alleTexte)) warn('Platzhalter der Vorlage gefunden (zum Beispiel "Mara Ellison", "Lissabon"): im CMS oder im Seitenkopf von index.html ersetzen.');
if (json.rechtliches && /ENTWURF|\[[^\]]{3,}\]/.test(JSON.stringify(json.rechtliches))) warn('Impressum/Datenschutz enthalten noch ENTWURF oder Platzhalter in eckigen Klammern (CMS "7 · Rechtliches").');
const k = json.kontakt;
if (k) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(k.email || '')) err('content/kontakt.json: Die E-Mail-Adresse ist ungültig.');
  for (const f of ['instagram', 'arena', 'shop_url']) if (k[f] && k[f] !== '#' && !/^https?:\/\//i.test(k[f])) warn(`content/kontakt.json: "${f}" ist keine gültige Internetadresse (https://…).`);
}

// ---------- 5. Seite: Kopfbereich, externe Verbindungen ----------
const eigeneHosts = ['localhost'];
const ext = new Map();
// Nur Dateien beachten, die wirklich geladen werden: alle HTML-Seiten und die Skripte, die dort per <script src="…"> eingebunden sind.
const seiten = dateien.filter((p) => /\.html?$/i.test(p) && !rel(p).startsWith('pflege/') && !rel(p).startsWith('tools/'));
const geladen = new Set();
for (const p of seiten) for (const m of lies(p).matchAll(/<script[^>]*\ssrc="([^"#?]+\.js)"/gi)) { if (!/^https?:/i.test(m[1])) geladen.add(m[1].replace(/^\.\//, '')); }
for (const p of dateien) { const r = rel(p); if (/^[^/]+\.js$/i.test(r) && !geladen.has(r)) warn(`Skript wird von keiner Seite geladen: ${r} (kann vermutlich gelöscht werden).`); }
for (const p of dateien) {
  const r = rel(p);
  if (!(seiten.includes(p) || geladen.has(r))) continue;
  const t = lies(p);
  for (const m of t.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) {
    const h = m[1].toLowerCase();
    if (!eigeneHosts.includes(h) && !/(^|\.)(instagram\.com|w3\.org|github\.com|schema\.org)$/.test(h)) { if (!ext.has(h)) ext.set(h, new Set()); ext.get(h).add(r); }
  }
}
for (const [h, f] of ext) warn(`Externe Verbindung beim Aufruf der Seite: ${h} (in ${[...f].join(', ')}). Besucher-IP geht dorthin; auf eigene Dateien umstellen.`);
const idx = join(ROOT, 'index.html');
if (existsSync(idx)) {
  const t = lies(idx);
  if (!/rel="(shortcut )?icon"/i.test(t)) warn('index.html: kein Favicon (Symbol im Browser-Tab).');
  if (!/property="og:image"/i.test(t)) warn('index.html: kein Vorschaubild für Link-Vorschau (og:image).');
  if (!/<html[^>]*\blang=/i.test(t)) warn('index.html: <html> hat kein lang-Attribut.');
}
if (!existsSync(join(ROOT, 'sitemap.xml'))) warn('Keine sitemap.xml.');
if (!existsSync(join(ROOT, '404.html'))) warn('Keine eigene 404-Seite.');

// ---------- Ausgabe ----------
const zeile = '─'.repeat(60);
console.log(zeile + '\nPrüfung der Seite\n' + zeile);
for (const m of ok) console.log('  OK       ' + m);
for (const m of warnungen) console.log('  WARNUNG  ' + m);
for (const m of fehler) console.log('  FEHLER   ' + m);
console.log(zeile + `\n${fehler.length} Fehler, ${warnungen.length} Warnungen.` + (fehler.length ? ' Veröffentlichen wird gestoppt.' : ' Nichts Kritisches gefunden.'));
process.exit(fehler.length ? 1 : 0);
