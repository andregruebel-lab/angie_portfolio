// Impressum und Datenschutz: Text kommt aus content/rechtliches.json (im CMS unter "7 · Rechtliches" bearbeitbar).
// Reiner Text: Absätze durch Leerzeile, Zeilen mit "## " am Anfang sind Überschriften. E-Mail-Adressen und Links werden anklickbar.
(async () => {
  const LANGS = ['de', 'en', 'ru'];
  const TXT = {
    de: { imprint: 'Impressum', privacy: 'Datenschutzerklärung', back: '← Zurück', other: { imprint: 'Datenschutz', privacy: 'Impressum' } },
    en: { imprint: 'Legal notice', privacy: 'Privacy policy', back: '← Back', other: { imprint: 'Privacy policy', privacy: 'Legal notice' } },
    ru: { imprint: 'Выходные данные', privacy: 'Политика конфиденциальности', back: '← Назад', other: { imprint: 'Конфиденциальность', privacy: 'Выходные данные' } },
  };
  const page = document.body.dataset.page === 'privacy' ? 'privacy' : 'imprint';
  const get = (f) => fetch('content/' + f + '.json', { cache: 'no-cache' }).then((r) => r.json());
  let g = {}; let legal = {};
  try { [g, legal] = await Promise.all([get('general'), get('rechtliches')]); } catch (e) { console.error('Inhalte konnten nicht geladen werden', e); }
  const on = g.languages || [];
  const active = LANGS.filter((l) => l === 'de' || on.includes(l));
  let lang = null;
  try { lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('portfolio-lang'); } catch (e) { /* ignorieren */ }
  if (!active.includes(lang)) lang = 'de';
  const t = TXT[lang];
  const text = ((legal[lang] || {})[page] || '').trim() || ((legal.de || {})[page] || '').trim();
  document.documentElement.lang = lang;
  document.title = t[page] + (g.name ? ' — ' + g.name : '');
  document.getElementById('title').textContent = t[page];
  const home = document.getElementById('home'); home.textContent = g.name || ''; home.href = './?lang=' + lang;
  const back = document.getElementById('back'); back.textContent = t.back; back.href = './?lang=' + lang;
  const other = document.getElementById('other'); other.textContent = t.other[page];
  other.href = (page === 'imprint' ? 'datenschutz.html' : 'impressum.html') + '?lang=' + lang;
  document.getElementById('copy').textContent = '© ' + new Date().getFullYear() + ' ' + (g.name || '');
  const box = document.getElementById('content'); box.textContent = '';
  const LINK = /(https?:\/\/[^\s<>"']+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
  const addLinked = (parent, line) => {
    line.split(LINK).forEach((part, i) => {
      if (i % 2 === 0) { if (part) parent.appendChild(document.createTextNode(part)); return; }
      const a = document.createElement('a');
      a.textContent = part;
      a.href = part.includes('@') && !/^https?:/i.test(part) ? 'mailto:' + part : part;
      if (/^https?:/i.test(part)) { a.target = '_blank'; a.rel = 'noopener'; }
      parent.appendChild(a);
    });
  };
  text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean).forEach((block) => {
    let lines = block.split('\n');
    if (lines[0].startsWith('## ')) {
      const h = document.createElement('h2'); h.textContent = lines[0].slice(3); box.appendChild(h);
      lines = lines.slice(1);
    }
    if (!lines.length) return;
    const p = document.createElement('p');
    lines.forEach((line, i) => { if (i) p.appendChild(document.createElement('br')); addLinked(p, line); });
    box.appendChild(p);
  });
})();
