# To-do und Aufbau (Angies Portfolio)

Stand: 01.11.2026. Diese Datei wird **nicht** auf der Webseite veröffentlicht (steht in `.assetsignore`).

## 0a. Als Allererstes: Bilder anonymisieren und verkleinern
Fotos aus dem Handy enthalten versteckte Daten (Standort, Gerät, Zeitpunkt) und sind sehr groß. Beides muss weg, bevor die Seite öffentlich ist.
- [x] **Porträtfoto bei „Über mich“ erledigt.** Vorher: 8,3 MB, 3072 × 4080 Pixel, mit GPS-Standort (Raum Bologna), Gerät (Pixel 8 Pro), Aufnahmezeit und einem Dateinamen mit Datum. Jetzt: `portrait-ueber-mich.jpg`, 1100 × 1461 Pixel, etwa 330 KB, ohne Metadaten. Die anderen Fotos und das Video habe ich geprüft: keine Standortdaten.
- [ ] **Alte Fassung mit Standort:** Sie bleibt im Verlauf auf GitHub, solange das Repo öffentlich ist (siehe 0b). Auch danach können Mitarbeiter des Repos sie sehen. Ganz entfernen ginge nur mit Umschreiben des Verlaufs (aufwendig, nicht empfohlen).
- [x] **Prüfskript `tools/pruefung.mjs`** (ohne zusätzliche Programme, nur Node): prüft Fotos und Videos auf Standort-, Geräte- und Zeitdaten, den Code auf Zugangsdaten, den Schutz des CMS-Pfads vor Suchmaschinen, fehlende Bilder, ungültige E-Mail/JSON, außerdem Hinweise zu Platzhaltern, großen Bildern, externen Verbindungen und Entwürfen bei Impressum/Datenschutz. Aufruf: `node tools/pruefung.mjs`. Getestet an der echten Seite (0 Fehler) und an einer Kopie mit acht eingebauten Fehlern (alle erkannt). Es gibt zwei Auslöser:
  - Die Prüfung gilt für den **Inhalt des Repos, egal wie die Datei hineinkam** (CMS, Hochladen bei GitHub, Git). Sie durchsucht alle Fotos und Videos im ganzen Repo, nicht nur `images/`. Sie **findet** Standortdaten, **entfernt** sie aber nicht: Die automatische Bereinigung gibt es nur beim Hochladen im CMS.
  - **GitHub (automatisch):** `.github/workflows/pruefung.yml` läuft bei jeder Änderung auf `main`, auch bei CMS-Änderungen. Bei einem Fehler kommt eine E-Mail und ein rotes Kreuz am Commit. Das Foto ist dann aber schon im Repo.
  - [ ] **Cloudflare (verhindert das Veröffentlichen):** Beim Worker `angie-portfolio` unter Settings → Build (Menünamen können abweichen) als **Build command** `node tools/pruefung.mjs` eintragen. Bei einem Fehler bricht der Build ab, und die alte Seite bleibt online. Diesen Schritt muss Andre selbst einstellen.
  - [ ] Das Skript später erweitern: Zugriffsschutz-Header (`X-Content-Type-Options`, `Referrer-Policy`) prüfen, kaputte Links, Bild-Beschreibungen. Zusätzlich von außen prüfen lassen, sobald die Domain läuft (zum Beispiel Mozilla Observatory, SecurityHeaders.com, SSL Labs, PageSpeed Insights).
- [x] **Fotos werden im CMS jetzt automatisch bereinigt, bevor sie hochgeladen werden** (`pflege/bilder-bereinigen.js`). Jedes Foto (JPEG, PNG, WebP) wird im Browser auf höchstens 1600 Pixel an der langen Seite verkleinert, als JPEG neu gespeichert (dabei fallen Standort, Gerät und Aufnahmezeit weg) und bekommt einen neutralen Dateinamen, wenn der Name nach Handy oder Datum aussieht. Getestet mit einem Foto mit GPS-Daten (3 MB, 3000 × 2000, gedreht): Ergebnis 220 KB, 1067 × 1600, keine Metadaten, Drehung richtig. Grenzen:
  - **Videos werden nicht bereinigt.** Standortdaten vor dem Hochladen entfernen (Export mit „Metadaten entfernen“ oder `ffmpeg -map_metadata -1`).
  - **iPhone-Fotos im Format HEIC** kann Chrome nicht lesen: Das Foto wird dann **nicht hochgeladen** (mit roter Meldung). In Safari geht es, oder als JPEG exportieren.
  - **Nur im CMS wirksam.** Wer Dateien direkt bei GitHub hochlädt (im Browser oder per Git), umgeht die Bereinigung. Dann bitte vorher selbst bereinigen oder mir geben.
  - Vorhandene Bilder wurden nicht erneut verarbeitet (sie sind geprüft: keine Standortdaten).
  - Transparente PNGs bekommen einen weißen Hintergrund.
- [ ] Nicht verwendetes Foto `whatsapp-image-2026-10-31-at-14.27.04-11-.jpeg` (Porträt vor Seerosen, Datum im Dateinamen): aufnehmen (dann vorher umbenennen) oder löschen.
- [ ] Fotos in mehreren Größen und als WebP anbieten (siehe 1c).

## 0b. Danach: Repos auf privat stellen
Solange `angie_portfolio` öffentlich ist, kann jeder, der den Repo-Link kennt oder das GitHub-Profil ansieht, den **Verlauf** (mit E-Mail-Adresse aus den CMS-Änderungen) und diese **To-do-Liste** lesen. Die Webseite selbst zeigt das nicht, GitHub schon.
- [ ] GitHub → Repo `angie_portfolio` → Settings → ganz unten **Danger Zone** → **Change visibility** → **Make private**. Dasselbe für `sveltia-cms-auth` (optional, dort steht nur der Programmcode).
- [ ] GitHub → Settings → Applications → Installed GitHub Apps → **Cloudflare Workers and Pages** → Configure → beide Repos unter „Repository access“ eintragen.
- [ ] In Cloudflare prüfen, dass der Build noch läuft (neuer Commit oder „Retry build“). Dann `…/pflege` öffnen, anmelden, eine Änderung probieren.
- [ ] Bei GitHub „Keep my email addresses private“ einschalten (Settings → Emails).
- [ ] **Unterpunkt: `/pflege` mit Cloudflare Access schützen.** Danach kommt über die Webseite niemand mehr an die CMS-Seite und an `pflege/config.yml`, und damit findet auch niemand mehr den Repo-Namen und von dort den Weg zum Repo. Das ersetzt das Privatstellen nicht (das Repo bliebe sonst für jeden lesbar, der den Link auf anderem Weg kennt), ergänzt es aber: privat schützt den Inhalt, Access verbirgt zusätzlich den Namen.
  - Cloudflare → Zero Trust → Access → Anwendung für `deinedomain/pflege*` anlegen (Menünamen können abweichen). Erlaubt nur deine E-Mail-Adresse oder dein GitHub-Konto.
  - Noch zu klären: ob der Schutz zusammen mit dem GitHub-Anmelde-Fenster des CMS reibungslos läuft (nicht getestet), und ob Access für dich dann eine zweite Anmeldung bedeutet.
  - Die Adresse des Login-Dienstes (`sveltia-cms-auth…workers.dev`) und `/callback` dürfen **nicht** durch Access geschützt werden, sonst scheitert die Anmeldung.
- Das Repo `trading_agent` ist davon unabhängig: Jedes Repo hat seine eigene Einstellung (Public/Private).
- **Wichtig:** Ein Schutz des Pfades `/pflege` (Cloudflare Access) ersetzt das Privatstellen **nicht**. Er verhindert nur, dass jemand über `pflege/config.yml` auf der Webseite den Repo-Namen findet. Ein öffentliches Repo bleibt auf GitHub lesbar (Profil, Suchmaschinen, bekannter Link), auch ohne Link von der Webseite. Nur „privat“ schützt Verlauf, E-Mail-Adresse und diese Liste. Was dann trotzdem öffentlich bleibt, steht weiter unten bei „Was bedeutet ‚Repo privat‘ genau?“.

## 1. Vor dem öffentlichen Start (Pflicht bzw. dringend)
- [ ] **Impressum und Datenschutzerklärung ausfüllen.** Die Seiten `impressum.html` und `datenschutz.html` gibt es schon, sie sind im Fußbereich verlinkt (auch auf den Serienseiten). Der Text steht als **Entwurf** im CMS unter **„7 · Rechtliches“** (Deutsch; Englisch und Russisch bleiben leer, dann wird der deutsche Text angezeigt). Zu tun:
  - Alle Angaben in eckigen Klammern ersetzen (Name, Anschrift, ggf. Telefon und Umsatzsteuer-ID) und den Absatz „ENTWURF“ löschen.
  - Beide Texte **rechtlich prüfen lassen**. Ich habe sie nach dem tatsächlichen Stand der Seite geschrieben (Cloudflare, keine Cookies, Sprache im Browser, Instagram-Link), aber ich kann keine Rechtsberatung geben. Zuständige Datenschutzbehörde und Hinweis zur Datenübermittlung in die USA prüfen.
  - Nach dem Auslagern von Schriften und Bausteinen (nächster Punkt) den Abschnitt „Externe Inhalte“ in der Datenschutzerklärung löschen.
  - Optional: Texte auf Englisch und Russisch übersetzen lassen (im CMS in den eingeklappten Blöcken).
  - Auch diese Seiten laden noch Schriften von Google; sie sind bei der Umstellung mit zu berücksichtigen.
- [ ] **Externe Verbindungen entfernen:** Google Fonts (`fonts.googleapis.com`) und React/Babel von `unpkg.com` auf eigene Dateien im Repo umstellen (Schriften als Dateien ablegen, Adressen in `support.js` und den beiden Seiten ändern). Babel ist 3 MB groß. Danach testen, dass beim Öffnen keine Verbindung zu Google/unpkg mehr entsteht.
- [ ] **Link-Vorschau (WhatsApp, Instagram, Google)** reparieren: In `index.html` stehen im Seitenkopf noch Titel und Beschreibung der Vorlage („Mara Ellison, Lissabon“, og:title). Das lässt sich nur im Quelltext ändern, nicht im CMS. Außerdem `Series.dc.html` prüfen.

## 1b. Neu aufgenommen (Durchsicht der Seite, 02.11.2026)
**Wichtig, vor dem öffentlichen Start**
- [x] Porträtfoto bei „Über mich“ verkleinert und anonymisiert: siehe Abschnitt 0a (erledigt).
- [ ] **Serien ausblenden, solange sie leer sind.** Alle fünf Serien sind Beispiele ohne Bilder. Besucher können sie anklicken und sehen leere Rahmen. Bis echte Serien da sind, Abschnitt „Serien“ und Menüpunkt ausblenden (kann ich einbauen).
- [ ] **Einwilligungen der abgebildeten Personen schriftlich festhalten** (Model Release), besonders beim Kind, beim Badewannenbild und für die Veröffentlichung im Netz. Notieren, wer auf welchem Foto zu sehen ist.
- [ ] **Zwei-Faktor-Anmeldung** bei GitHub, Cloudflare, Domain-Anbieter und E-Mail einschalten. Wer Zugang zu GitHub hat, kann die ganze Seite ändern.
- [ ] **Auf echten Geräten testen:** iPhone (Safari), Android (Chrome) und Desktop (Chrome, Safari, Firefox). Besonders: Video startet, Vergrößerung der Fotos, Sprünge im Menü, Schriften, Anmeldung im CMS.
- [ ] **Ladezeit auf dem Handy messen** (zum Beispiel mit PageSpeed Insights). Die Seite lädt zum Zusammenbauen 3 MB Programmcode (Babel) im Browser, dazu Video und Bilder. Gegebenenfalls Bilder verkleinern oder die Seite vorab fertig bauen (größerer Umbau).

**Sichtbarkeit und Auffindbarkeit**
- [ ] **Favicon** (Symbol im Browser-Tab) und Symbol für den Startbildschirm: fehlt bisher.
- [ ] **Vorschaubild für Link-Vorschau** (`og:image`): fehlt, gehört zum Punkt „Link-Vorschau“ oben.
- [ ] **`sitemap.xml`** anlegen, in der `robots.txt` eintragen, Seite bei der Google Search Console anmelden (nach der Domain).
- [ ] **Eigene 404-Seite** im Stil der Seite.
- [ ] Optional, Entscheidung: Browser-Sprache automatisch vorwählen (heute immer Deutsch, wenn nichts gemerkt ist); getrennte Adressen oder `hreflang` pro Sprache für Suchmaschinen.

**Technik und Betrieb**
- [ ] **Decap-Version festlegen:** `pflege/index.html` lädt `decap-cms@^3.0.0` (schwebend, nimmt künftig die jeweils neueste 3.x). Auf eine feste Version setzen oder mit den anderen Bausteinen auf eigene Dateien legen.
- [ ] **Benachrichtigung bei fehlgeschlagenem Build** in Cloudflare einrichten, damit Fehler auffallen.
- [ ] **Nicht verwendetes Foto** `whatsapp-image-…-11-.jpeg` (Porträt vor Seerosen): in die Galerie aufnehmen oder löschen.
- [ ] **Zweite Person zur Pflege:** auf GitHub als Mitarbeiterin einladen (braucht ein GitHub-Konto) und eine Kurzanleitung schreiben (Foto hinzufügen, Text ändern, Veröffentlichen; Änderungen erscheinen nach etwa 1 bis 2 Minuten).
- [ ] **E-Mail unter eigener Domain:** Absenden mit SPF/DKIM prüfen, damit Antworten nicht im Spam landen. Dazu `www`-Adresse auf die Hauptadresse weiterleiten.
- [ ] **Bildrechte-Hinweis** (Urheberrecht für die Fotos) im Fußbereich oder Impressum ergänzen.
- [ ] **Statistik:** bewusst keine eingebaut (kein Tracking). Wenn doch gewünscht, datenschutzfreundliche Lösung wählen und die Datenschutzerklärung anpassen.
- [ ] **Offen, Rückfrage an Andre:** Der YouTube-Link vom 02.11. (`xfPTagIR60Q`) konnte nicht geöffnet werden. Was soll daraus in die Liste?

## 1c. Qualität: Aussehen und Geschwindigkeit (Durchsicht nach dem Video „Website mit KI bauen, die gut aussehen und performen, gratis Skill“)
**Geschwindigkeit**
- [ ] **Bilder in mehreren Größen** (kleinere für Handys) und als WebP; Breite und Höhe angeben, damit die Seite beim Laden nicht springt.
- [ ] **Video:** kürzere oder kleinere Fassung oder erst die Eckdaten laden (`preload="metadata"`); das Ersatzbild bleibt.
- [ ] **Zwischenspeicher:** in `_headers` festlegen, dass Bilder und Video lange gespeichert werden (Dateien bekommen bei Änderung einen neuen Namen) und Texte kurz.
- [ ] **Die sechs Inhaltsdateien** beim Start zusammenfassen (heute sechs Anfragen nacheinander).
- [ ] **Zielwerte nach der Messung festlegen:** schnelle Anzeige (LCP unter 2,5 s) und keine Layoutsprünge (CLS unter 0,1).
- [ ] **Seite ohne JavaScript ist leer.** Die Inhalte erscheinen nur über das Programm im Browser. Mindestens ein `<noscript>`-Hinweis; langfristig die Seite vorab fertig bauen. Das würde auch Link-Vorschau und Suchmaschinen helfen und den 3-MB-Baustein (Babel) überflüssig machen.

**Barrierefreiheit**
- [ ] **Bewegung reduzieren respektieren** (`prefers-reduced-motion`): Video nicht automatisch abspielen, wenn die Person das am Gerät so eingestellt hat.
- [ ] **Kontraste prüfen** (graue Texte auf beigem und schwarzem Grund), sichtbarer Fokusrahmen, Tastaturbedienung für Galerie und Vergrößerung (Fokus, Esc, Rückkehr), Link „Zum Inhalt springen“.
- [ ] **Alt-Texte:** Im CMS ein Feld für eine kurze Bildbeschreibung ergänzen (heute dient der Titel als Alt-Text).

**Auffindbarkeit**
- [ ] **Strukturierte Daten** (schema.org: Person/Fotografin, Instagram als `sameAs`) und eine `canonical`-Adresse.

**Design-Test**
- [ ] Aussehen auf sehr großen Monitoren (ab 1920 Pixel), Tablets und im Querformat prüfen.

**Das Video selbst**
- [ ] Das Video erwähnt ein kostenloses „Skill“ (Vorlage für KI-Assistenten). Ich kann es nicht ansehen. Wenn du Link oder Datei dazu hast, vergleiche ich es mit unserer Seite.

## 2. Domain
- [ ] Domain registrieren oder anbinden: bei Cloudflare im Worker `angie-portfolio` unter Settings → Domains & Routes als Custom Domain hinzufügen (je nach Anbieter DNS-Eintrag oder DNS zu Cloudflare umziehen).
- [ ] Im Login-Dienst (`sveltia-cms-auth`) die neue Domain bei `ALLOWED_DOMAINS` **zusätzlich** eintragen (in `wrangler.toml`, mit Komma getrennt).
- [ ] In der GitHub-OAuth-App die **Homepage URL** anpassen (die Callback-URL bleibt!).
- [ ] Danach die `workers.dev`-Adresse des Portfolio-Workers abschalten, damit keine zweite Adresse im Umlauf ist.
- [ ] **E-Mail auf die neue Domain umstellen.** Heute steht die Gmail-Adresse auf der Seite. Zu tun, sobald die Domain läuft:
  1. Eine Adresse unter der Domain anlegen, zum Beispiel `kontakt@deinedomain.de`, und als **Weiterleitung an die Gmail-Adresse** einrichten. Die meisten Domain-Anbieter bieten das an; liegt die Domain bei Cloudflare, geht es mit **Cloudflare Email Routing** (kostenlos, nicht getestet).
  2. Testen: eine Mail an die neue Adresse schicken und im Gmail-Posteingang (auch im Spam-Ordner) nachsehen.
  3. Im CMS unter „6 · Kontakt“ die E-Mail-Adresse ändern.
  4. Dieselbe Adresse im **Impressum** und in der **Datenschutzerklärung** ändern (CMS „7 · Rechtliches“).
  5. Optional: In Gmail unter Einstellungen → Konten → „Senden als“ die neue Adresse einrichten, damit Antworten auch von der Domain-Adresse kommen. Ohne das sieht der Empfänger bei einer Antwort die Gmail-Adresse. Dafür braucht man meist die Zugangsdaten (SMTP) des Anbieters.
  6. Die alte Gmail-Adresse bleibt weiter erreichbar; eine Weiterleitung ersetzt kein richtiges Postfach (keine Sicherung bei Ausfall des Anbieters).

## 3. GitHub und Zugänge
- [ ] Repos auf **privat** stellen: siehe Abschnitt 0b.
  - Danach in GitHub unter Settings → Applications → Installed GitHub Apps → **Cloudflare Workers and Pages** → Configure prüfen, dass beide Repos als erlaubt eingetragen sind. Sonst findet Cloudflare sie nicht mehr.
  - Es müssen keine Passwörter bei Cloudflare hinterlegt werden. Der Zugriff läuft über die GitHub-App. Das CMS meldet sich bei jedem Login über GitHub an (das Token liegt nur im Browser der Person, die sich anmeldet).
  - Wer das CMS nutzt, muss weiterhin Mitarbeiter (Collaborator) des Repos sein.
  - Privat schützt Verlauf, E-Mail-Adressen und nicht ausgelieferte Dateien. **Die Dateien der Webseite selbst bleiben öffentlich** (alles, was veröffentlicht wird, kann jeder abrufen, auch `content/*.json` und `pflege/config.yml`).
- [ ] Bei GitHub „Keep my email addresses private“ einschalten (Settings → Emails).
- [ ] Optional: Kontoname auf GitHub neutral machen oder Repos in ein neutral benanntes Konto verschieben. Der Repo-Name steht in `pflege/config.yml` (`repo:`), und diese Datei ist öffentlich abrufbar. Danach `repo:` in `config.yml`, die Cloudflare-Verbindung und die OAuth-App anpassen.
- [ ] `/pflege` mit Cloudflare Access schützen: siehe Abschnitt 0b (Unterpunkt beim Privatstellen).
- [ ] Alte Netlify-Seite abschalten oder löschen, alte GitHub-OAuth-App (für Netlify) löschen.
- [ ] Client ID und Client Secret der OAuth-App in einem Passwort-Manager sichern (das Secret wird bei GitHub nur einmal angezeigt; im Zweifel ein neues erzeugen und in Cloudflare eintragen).

### Was bedeutet „Repo privat“ genau? (Bitte vor dem Umstellen lesen)
**Heute (Repo öffentlich):** Jeder, der den Repo-Link kennt oder auf dem GitHub-Profil nachsieht, kann **alles** im Repo lesen: Code, `TODO.md`, den gesamten Verlauf der Änderungen (mit E-Mail-Adresse aus den CMS-Änderungen). Das gilt für GitHub, **nicht** für die Webseite, dort steht `TODO.md` nicht.

**Nach dem Umstellen auf privat:**
- *Nicht mehr sichtbar für Fremde:* der Code im Repo, der Verlauf der Änderungen und die E-Mail-Adresse darin, `TODO.md`, `wrangler.jsonc`, `.assetsignore`, `README`-Dateien, der Repo-Name als abrufbarer Link.
- *Weiterhin öffentlich, weil die Webseite sie ausliefert* (jeder mit der Webadresse kann sie abrufen):
  - `index.html`, `Series.dc.html`, `support.js`, `image-slot.js`
  - `content/*.json` (alle Texte und Listen der Seite)
  - `images/` (alle Fotos und das Video)
  - `pflege/index.html` und `pflege/config.yml` (dort steht der Repo-Name im Eintrag `repo:`)
  - `robots.txt`
- *Nicht ausgeliefert* (Webseite zeigt 404): `TODO.md`, `wrangler.jsonc`, `.assetsignore`, `_headers`, der Ordner `.git`.
- Fazit: „Privat“ schützt den Verlauf und die internen Dateien. Es schützt nicht den Inhalt der Seite, das war auch nie das Ziel, denn der soll ja öffentlich sein.

## 4. Sicherung (Backup)
Der Code und alle Fotos liegen bisher **nur auf GitHub**. Ein Fehler dort (versehentlich gelöscht, Konto gesperrt, Zugang verloren) wäre sonst das Ende der Seite. Faustregel: **mindestens drei Kopien, auf zwei verschiedenen Arten von Speicher, eine davon an einem anderen Ort.**
- [ ] **Kopie 1: lokal auf dem eigenen Rechner.** GitHub Desktop (oder Git) installieren, das Repo mit „Clone“ holen. Danach regelmäßig **Pull**, weil das CMS Änderungen direkt auf GitHub macht. Bei einem privaten Repo ist dafür die Anmeldung bei GitHub nötig.
- [ ] Dasselbe für das Repo `sveltia-cms-auth` (klein, aber nötig für die CMS-Anmeldung).
- [ ] **Kopie 2: außerhalb des Rechners**, zum Beispiel ein Archiv (ZIP) des ganzen Ordners auf einer externen Festplatte oder in einem Cloud-Speicher. Mindestens nach größeren Änderungen und vor Umbauten wiederholen.
- [ ] **Kopie 3 (optional): Spiegelung auf einen zweiten Git-Anbieter** (zum Beispiel GitLab oder Codeberg), damit ein Ausfall oder eine Sperre bei GitHub nicht alles trifft.
- [ ] **Originalfotos getrennt aufbewahren.** Im Repo liegen nur die verkleinerten Fassungen (`images/uploads/`). Die Originale und das Originalvideo (höhere Auflösung) sollten zusätzlich auf einer eigenen Festplatte oder einem Cloud-Speicher liegen.
- [ ] **Einstellungen sichern, die nicht im Repo stehen:** Cloudflare (welche Worker, welche Variablen: `GITHUB_CLIENT_ID`, `ALLOWED_DOMAINS`; das Secret nur im Passwort-Manager), GitHub-OAuth-App (Name, Callback-URL), Domain-Einstellungen. Am besten als Notiz oder Screenshots im Passwort-Manager.
- [ ] **Zugangsdaten sichern:** Cloudflare, GitHub, Domain-Anbieter, E-Mail-Konto (Passwort-Manager, zweiter Faktor, Wiederherstellungscodes an einem zweiten Ort).
- [ ] **Wiederherstellung einmal üben:** Aus der lokalen Kopie ein neues Repo erzeugen und prüfen, dass die Seite daraus gebaut werden kann.

## 5. Inhalte und Feinschliff
- [ ] **Instagram-Adresse prüfen:** Eingetragen ist `https://www.instagram.com/anhely_pyly` (erscheint als „@anhely_pyly“ neben der E-Mail im Fußbereich). Ob der Name stimmt, bitte kontrollieren.
- [ ] Are.na- und Print-Shop-Link: Sie erscheinen im Fußbereich nur, wenn im CMS („6 · Kontakt“) eine echte Adresse (http/https) steht. Heute stehen dort Platzhalter (`#`), deshalb sind sie ausgeblendet.
- [ ] **Platzhalter der Vorlage ersetzen:** Die fünf Serien („Die lange Flut“ usw.) ohne Bilder, Porträtfoto, Jahreszahlen bei den Fotos (aktuell Platzhalter 2024 bis 2026), Bildunterschrift und Jahr unter dem Titelvideo.
- [ ] Russischen Text von einer Muttersprachlerin / einem Muttersprachler prüfen lassen.
- [x] Deutscher Text „Über mich“: „setze … in Szene“ korrigiert (Commit folgt in der Historie). Offen: Titel „Anhelina Pylypiuk  — Fotografin“ hat ein doppeltes Leerzeichen (im CMS unter „1 · Allgemein & Menü“ ändern).
- [x] Englischer Text „Über mich“: „I stage my clients“ ersetzt durch „I bring clothing and environment together around my clients in a perfect interplay …“.
- [ ] **Am Schluss prüfen:** Zeilenumbrüche auf sehr schmalen Handys, zum Beispiel „Location-Scouting“ am Bindestrich bei 320 Pixeln Breite, und dass die E-Mail im Fußbereich auf dem eigenen Handy in einer Zeile steht. Das ist bewusst zurückgestellt.
- [ ] Leistungen unter „Über mich“ (optional): Darstellung mit Trennzeichen (Punkt oder senkrechter Strich) statt drei Zeilen untereinander. Wortlaut ist entschieden und steht so auf der Seite; nur das Aussehen ist offen. Bleibt vorerst untereinander ohne Zeichen.
- [ ] Titelvideo in höherer Auflösung (jetzt 832 × 464).
- [ ] Optional: Menü auf dem Handy linksbündig, Fotos der Galerie auch per Tastatur öffnen.

## Aufbau (so läuft es heute)
- **Seite:** Cloudflare-Worker `angie-portfolio` (nur Dateien), gebaut aus dem Repo `angie_portfolio` (Branch `main`). Festgelegt in `wrangler.jsonc` (Hauptordner wird veröffentlicht), `_headers` (Sperrvermerk für `/pflege`), `.assetsignore`.
- **CMS (Decap):** unter `/pflege`. Konfiguration `pflege/config.yml`. Sechs Einträge, Inhalte in `content/*.json`, Bilder in `images/uploads/`. Änderungen im CMS sind Commits auf `main` und lösen einen neuen Build aus.
- **Anmeldung:** Cloudflare-Worker `sveltia-cms-auth` (Kopie des öffentlichen Programms `sveltia/sveltia-cms-auth`, `src/index.js` unverändert), Repo `sveltia-cms-auth`. Einstellungen im Cloudflare-Dashboard: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (Secret), `ALLOWED_DOMAINS` (steht auch in `wrangler.toml`).
- **GitHub-OAuth-App:** Callback-URL = `<Adresse des Login-Dienstes>/callback`.
- **Account-Subdomain bei Cloudflare:** `agwebsites` (also `angie-portfolio.agwebsites.workers.dev`).
- **Hinweise für KI-Assistenten:** `CLAUDE.md` (Regeln: Fotos bereinigen, Prüfung vor jedem Push, keine Zugangsdaten, Texte nicht ungefragt ändern) und `AGENTS.md` (Verweis darauf), `README.md` für Menschen. Alle drei werden nicht auf der Webseite veröffentlicht.
- **Prüfung:** `tools/pruefung.mjs` (Fotos, Zugangsdaten, CMS-Schutz), ausgelöst über GitHub Action und optional beim Cloudflare-Build.
- **Bildbereinigung im CMS:** `pflege/bilder-bereinigen.js` (verkleinern, Metadaten entfernen), geladen in `pflege/index.html` vor Decap.
- **Sprachen:** Deutsch immer, Englisch/Russisch im CMS unter „1 · Allgemein & Menü“ freischaltbar.
- **Credits:** Auf Cloudflare gibt es keine Credit-Zählung wie bei Netlify (Netlify kostete 15 Credits je Veröffentlichung).
