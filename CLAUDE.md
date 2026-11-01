# Hinweise für KI-Assistenten (Claude u. a.): Portfolio-Seite

Lies zuerst diese Datei, danach `TODO.md`. Die Seite ist ein **öffentliches Fotografie-Portfolio** mit drei Sprachen. Zusammenarbeit auf Deutsch.

## Harte Regeln (Datenschutz und Sicherheit)
1. **Nur bereinigte Fotos und Videos ins Repo.** Handy-Fotos enthalten versteckte Daten (GPS-Standort, Gerät, Aufnahmezeit). Vor dem Ablegen:
   - Fotos: lange Seite höchstens **1600 Pixel**, unter **400 KB**, als **JPEG ohne Metadaten** speichern (mit Pillow: erst `ImageOps.exif_transpose`, dann speichern **ohne** `exif=`), in `images/uploads/`.
   - Dateiname **neutral**: kein Datum, kein `IMG_`/`PXL_`/`DSC`/`WhatsApp`. Besser: `portraet-name.jpg`.
   - Videos: `ffmpeg -i eingang.mp4 -map_metadata -1 -an -c:v copy -movflags +faststart ausgang.mp4`, unter 8 MB.
   - **Keine Originale** (HEIC, RAW, TIFF) im Repo.
2. **Vor jedem Push `node tools/pruefung.mjs` ausführen.** Bei FEHLER nicht pushen. WARNUNGEN lesen und dem Menschen nennen.
3. **Nie Zugangsdaten** (Tokens, Client Secret, Passwörter, `.env`) in Dateien, Commits oder im Chat. Geheimnisse liegen nur bei Cloudflare als „Secret“.
4. **Texte der Fotografin nicht ungefragt umschreiben.** Öffentliche Texte nur ändern, wenn es angewiesen wird. Übersetzungen (Englisch, Russisch) aus dem deutschen Text ableiten und als Übersetzung kennzeichnen. Bewusst vermiedene Wörter: „gestellt“/„постановочный“, „stage my clients“, „Commissions“.
5. **Ein Push auf `main` veröffentlicht sofort** (Cloudflare baut automatisch). Änderungen vorher testen und bündeln.

## Aufbau
- **Kein Build-Schritt.** Dateien werden so veröffentlicht, wie sie im Hauptordner liegen. `wrangler.jsonc` legt das fest.
- Seiten: `index.html` (Start), `Series.dc.html` (Serien), `impressum.html`, `datenschutz.html` (mit `legal.js`/`legal.css`). `support.js` ist das Seiten-Gerüst und wird nicht angefasst.
- Inhalte: `content/*.json` (general, start, arbeiten, serien, ueber, kontakt, rechtliches). Bilder: `images/uploads/`.
- **CMS (Decap)** unter `/pflege`, Konfiguration `pflege/config.yml`. **Die Felder in `config.yml` müssen genau zu den Schlüsseln in `content/*.json` passen.** Neue Felder immer in beiden anlegen. Eine Bildbereinigung beim Hochladen im CMS übernimmt `pflege/bilder-bereinigen.js` (gilt nicht für Dateien, die direkt bei GitHub hochgeladen werden).
- **Sprachen:** Deutsch immer, Englisch und Russisch sind in `content/general.json` unter `languages` freischaltbar. Jeder sichtbare Text in allen drei Sprachen pflegen.
- **Nicht veröffentlichen:** Alles, was nicht auf die Webseite soll (diese Datei, `TODO.md`, `tools/` …), steht in `.assetsignore`. Neue interne Dateien dort eintragen.
- **Anmeldung am CMS:** eigener Cloudflare-Worker in einem anderen Repo (`sveltia-cms-auth`). Die Callback-URL der GitHub-OAuth-App zeigt auf diesen Worker, nicht auf die Seite.
- **Prüfung:** `tools/pruefung.mjs` (Fotos, Zugangsdaten, Schutz des CMS-Pfads, Inhalte), automatisch über `.github/workflows/pruefung.yml`.

## Vorgehen
- Nach jeder Änderung: Seite lokal ansehen (zum Beispiel `python3 -m http.server`), mit Handy-Breite (390 px) und in allen drei Sprachen. Die Seite lädt React und Babel von `unpkg.com` und Schriften von Google (noch nicht auf eigene Dateien umgestellt, siehe `TODO.md`).
- Offene Aufgaben und Entscheidungen stehen in `TODO.md`. Neue Punkte dort eintragen, erledigte abhaken.
