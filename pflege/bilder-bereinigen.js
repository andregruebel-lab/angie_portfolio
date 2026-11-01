// Bilder-Bereinigung für das CMS: Jedes Foto, das im CMS hochgeladen wird, wird VOR dem Hochladen im Browser
//  - auf höchstens MAX_KANTE Pixel an der langen Seite verkleinert,
//  - als JPEG neu gespeichert. Dabei fallen alle versteckten Daten weg (Standort/GPS, Gerät, Aufnahmezeit, Urheber).
//  - mit neutralem Dateinamen versehen, wenn der Name nach Handy oder Datum aussieht (zum Beispiel PXL_2026…, IMG_1234, WhatsApp Image …).
// Gilt für beide Wege in Decap: den Hochladen-Knopf (Medien) und das Ziehen von Dateien in ein Bildfeld.
// Videos und Dateien, die keine Fotos sind, werden nicht verändert. Videos bitte vorher selbst von Metadaten befreien.
// Schlägt die Bereinigung fehl (zum Beispiel HEIC in Chrome), wird NICHT hochgeladen, damit nichts durchrutscht.
(() => {
  const MAX_KANTE = 1600;
  const QUALITAET = 0.82;
  const FOTO = /\.(jpe?g|png|webp|heic|heif|avif|tiff?)$/i;
  const erledigt = new WeakSet(); // Eingabefelder, deren Dateien schon bereinigt sind
  let neuVersand = false; // true, während wir selbst ein "drop" erneut auslösen

  const istFoto = (f) => /^image\/(jpeg|png|webp|heic|heif|avif|tiff)$/i.test(f.type) || ((!f.type || f.type === 'application/octet-stream') && FOTO.test(f.name));

  // Handy- oder Datumsnamen durch einen neutralen ersetzen; sonst den vorhandenen Namen (bereinigt) behalten.
  const zufall = () => Array.from(crypto.getRandomValues(new Uint8Array(3)), (b) => b.toString(16).padStart(2, '0')).join('');
  const neutralerName = (name) => {
    const basis = name.replace(/\.[^.]+$/, '');
    const slug = basis.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const verraeterisch = /^(img|pxl|dsc|dscf|dji|mvimg|whatsapp|screenshot|photo|image|foto|p\d)/.test(slug) || /\d{6,}/.test(slug) || slug.length < 3;
    return (verraeterisch ? 'foto-' + zufall() : slug) + '.jpg';
  };

  const bereinige = async (datei) => {
    const bild = await createImageBitmap(datei, { imageOrientation: 'from-image' }); // Drehung einrechnen, bevor Daten wegfallen
    const faktor = Math.min(1, MAX_KANTE / Math.max(bild.width, bild.height));
    const b = Math.max(1, Math.round(bild.width * faktor));
    const h = Math.max(1, Math.round(bild.height * faktor));
    const leinwand = document.createElement('canvas');
    leinwand.width = b; leinwand.height = h;
    const ctx = leinwand.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, b, h); // transparente Bereiche werden weiß
    ctx.drawImage(bild, 0, 0, b, h);
    if (bild.close) bild.close();
    const blob = await new Promise((ok) => leinwand.toBlob(ok, 'image/jpeg', QUALITAET));
    if (!blob) throw new Error('Bild konnte nicht umgewandelt werden');
    return new File([blob], neutralerName(datei.name), { type: 'image/jpeg', lastModified: Date.now() });
  };

  const hinweis = (text, fehler) => {
    const box = document.createElement('div');
    box.textContent = text;
    box.setAttribute('role', 'status');
    box.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;max-width:340px;padding:12px 16px;border-radius:8px;font:14px/1.4 system-ui,sans-serif;color:#fff;background:' + (fehler ? '#b3261e' : '#1e6b3a') + ';box-shadow:0 4px 16px rgba(0,0,0,.25)';
    document.body.appendChild(box);
    setTimeout(() => box.remove(), fehler ? 9000 : 6000);
  };

  const alleBereinigen = async (dateien) => {
    const aus = [];
    let bereinigt = 0;
    for (const f of dateien) {
      if (istFoto(f)) { aus.push(await bereinige(f)); bereinigt += 1; } else aus.push(f);
    }
    const dt = new DataTransfer();
    aus.forEach((f) => dt.items.add(f));
    return { dt, bereinigt };
  };

  const fehlerText = 'Das Foto konnte nicht bereinigt werden und wurde NICHT hochgeladen. Bitte als normales JPEG exportieren (ohne Standortdaten) und erneut versuchen. iPhone-Fotos im Format HEIC lassen sich in Chrome nicht verarbeiten.';

  // Weg 1: Hochladen-Knopf (Medienbibliothek) und Dateiauswahl in Bildfeldern
  document.addEventListener('change', async (e) => {
    const feld = e.target;
    if (!(feld instanceof HTMLInputElement) || feld.type !== 'file' || !feld.files || !feld.files.length) return;
    if (erledigt.has(feld)) { erledigt.delete(feld); return; }
    const dateien = Array.from(feld.files);
    if (!dateien.some(istFoto)) return;
    e.stopImmediatePropagation();
    try {
      const { dt, bereinigt } = await alleBereinigen(dateien);
      feld.files = dt.files;
      erledigt.add(feld);
      feld.dispatchEvent(new Event('change', { bubbles: true }));
      hinweis(bereinigt + ' Bild(er) vorbereitet: auf höchstens ' + MAX_KANTE + ' Pixel verkleinert, ohne Standort- und Gerätedaten.');
    } catch (err) {
      console.error('Bildbereinigung fehlgeschlagen', err);
      feld.value = '';
      hinweis(fehlerText, true);
    }
  }, true);

  // Weg 2: Dateien in ein Bildfeld ziehen
  document.addEventListener('drop', async (e) => {
    if (neuVersand) return;
    const dateien = e.dataTransfer ? Array.from(e.dataTransfer.files || []) : [];
    if (!dateien.some(istFoto)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const ziel = e.target;
    try {
      const { dt, bereinigt } = await alleBereinigen(dateien);
      neuVersand = true;
      ziel.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
      neuVersand = false;
      hinweis(bereinigt + ' Bild(er) vorbereitet: auf höchstens ' + MAX_KANTE + ' Pixel verkleinert, ohne Standort- und Gerätedaten.');
    } catch (err) {
      neuVersand = false;
      console.error('Bildbereinigung fehlgeschlagen', err);
      hinweis(fehlerText, true);
    }
  }, true);
})();
