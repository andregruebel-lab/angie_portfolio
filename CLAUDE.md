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

## Regeln für Sprachen und Texte
**Welche Sprache ist die Leitfassung?** Das steht nicht fest. Ein Text kann zuerst auf Deutsch, Russisch oder Englisch geschrieben sein, die drei Sprachen sind gleichberechtigt. **Vor einer Übersetzung klären (fragen), welche Fassung maßgeblich ist**, und von dieser ausgehen.
1. **Bestehende Texte (in jeder Sprache) nur auf Anweisung ändern.** Fällt ein Tippfehler oder eine Lücke auf, melden und einen Vorschlag machen, nicht ungefragt korrigieren.
2. **Jeder sichtbare Text in drei Sprachen** (de, en, ru). Texte stehen in `content/*.json`, nicht fest im Quellcode (Ausnahme: kurze Bedien-Texte im Skript, zum Beispiel Vergrößerung und Fußzeile, und der Seitenkopf von `index.html`). Neue Textfelder immer in `config.yml`, in der JSON-Datei (alle drei Sprachen) und in der Seite anlegen.
3. **Vorschlag zuerst:** Wortlaut als Tabelle Deutsch / Englisch / Russisch vorlegen und die Bestätigung abwarten, erst dann ändern. Eigene Textideen nicht veröffentlichen.
4. **Englisch:** britische Schreibweise („enquiries“), Satzanfang groß, Listenzeilen mit kleinem Anfang nach dem ersten Wort („Styling, make-up & location scouting“). **Russisch:** weibliche Form für die Fotografin („Открыта“), Ich-Form, Satzanfang groß. Der **Name bleibt in allen Sprachen in lateinischer Schrift**: Anhelina Pylypiuk.
5. **Zeichen:** „&“ in Listenzeilen statt „und“, Gedankenstrich „—“ mit Leerzeichen in Titeln.
6. **Geprüft oder ungeprüft:** Welche Sprachfassung von einer Muttersprachlerin oder einem Muttersprachler gelesen wurde, steht in `TODO.md`. Bis dahin Übersetzungen (heute besonders das Russische mit Fachwörtern wie „мудборды“) als ungeprüft kennzeichnen.
7. **Rechtstexte** (Impressum, Datenschutz): nur als gekennzeichneter **Entwurf**, ohne Rechtsberatung, Platzhalter in eckigen Klammern. Derzeit nur auf Deutsch gepflegt, Englisch und Russisch fallen auf Deutsch zurück.

**Beschlossene Begriffe (nicht ohne Rückfrage ändern):**
| Deutsch | Englisch | Russisch |
|---|---|---|
| Szenen- und Porträtfotografin | Scene and portrait photographer | Фотограф тематических съёмок и портретов |
| Ich biete an: | I offer: | Я предлагаю: |
| Konzeptionelle Porträtfotografie | Conceptual portrait photography | Концептуальная портретная фотография |
| Themenentwicklung & Moodboards | Concept & theme development | Разработка концепции и мудборды |
| Styling, Make-up & Location-Scouting | Styling, make-up & location scouting | Стайлинг, макияж и подбор локаций |
| Aufträge & Anfragen | Bookings & enquiries | Заказы и запросы (Alternative offen: „Бронирование и запросы“) |
| Porträt / Landschaft / Szenen | Portrait / Landscape / Scenes | Портрет / Пейзаж / Сцены |

**Vermeiden:** „gestellt“ und „постановочный“ (klingt wie „inszeniert, nicht echt“), „I stage my clients“ (stattdessen „I bring clothing and environment together around my clients …“), „Commissions“ (zu nah an „Provision“).

## Gestaltung (damit Änderungen im Stil bleiben)
- Farben: Hintergrund `#efebe4`, Text `#191816`, Akzent (kursive Überschrift, Hover) `#9a4a2c`, gedämpfter Text `#5c5852`, Bildplatzhalter `#dcd6cc`. Fußbereich dunkel `#191816` mit Text `#efebe4`, gedämpft `#a8a29a`, Hover `#d98a66`.
- Schriften: **Instrument Serif** (Überschriften, E-Mail im Fußbereich), **IBM Plex Mono** (Fließtext, Menü, Beschriftungen, 12 bis 13 px, Menü und Beschriftungen in Großbuchstaben), Ersatzschrift Cormorant.
- Seitenrand `clamp(20px, 4vw, 56px)`, Filterknöpfe und Sprachumschalter als Pillen mit 1 px Rahmen. Die Überschrift ist auf dem Handy 20 % der Breite groß.
- Kein Aufhellen oder Verspielen: ruhig, viel Weißraum, Fotos im Mittelpunkt.
