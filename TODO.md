# To-do und Aufbau (Angies Portfolio)

Stand: 01.11.2026. Diese Datei wird **nicht** auf der Webseite veröffentlicht (steht in `.assetsignore`).

## 0. Als Erstes: Repos auf privat stellen
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

## 2. Domain
- [ ] Domain registrieren oder anbinden: bei Cloudflare im Worker `angie-portfolio` unter Settings → Domains & Routes als Custom Domain hinzufügen (je nach Anbieter DNS-Eintrag oder DNS zu Cloudflare umziehen).
- [ ] Im Login-Dienst (`sveltia-cms-auth`) die neue Domain bei `ALLOWED_DOMAINS` **zusätzlich** eintragen (in `wrangler.toml`, mit Komma getrennt).
- [ ] In der GitHub-OAuth-App die **Homepage URL** anpassen (die Callback-URL bleibt!).
- [ ] Danach die `workers.dev`-Adresse des Portfolio-Workers abschalten, damit keine zweite Adresse im Umlauf ist.
- [ ] E-Mail-Adresse im Fußbereich: später eine Adresse unter der eigenen Domain verwenden (die jetzige liegt bei Gmail).

## 3. GitHub und Zugänge
- [ ] Repos auf **privat** stellen: siehe Abschnitt 0 (das ist die erste Aufgabe).
  - Danach in GitHub unter Settings → Applications → Installed GitHub Apps → **Cloudflare Workers and Pages** → Configure prüfen, dass beide Repos als erlaubt eingetragen sind. Sonst findet Cloudflare sie nicht mehr.
  - Es müssen keine Passwörter bei Cloudflare hinterlegt werden. Der Zugriff läuft über die GitHub-App. Das CMS meldet sich bei jedem Login über GitHub an (das Token liegt nur im Browser der Person, die sich anmeldet).
  - Wer das CMS nutzt, muss weiterhin Mitarbeiter (Collaborator) des Repos sein.
  - Privat schützt Verlauf, E-Mail-Adressen und nicht ausgelieferte Dateien. **Die Dateien der Webseite selbst bleiben öffentlich** (alles, was veröffentlicht wird, kann jeder abrufen, auch `content/*.json` und `pflege/config.yml`).
- [ ] Bei GitHub „Keep my email addresses private“ einschalten (Settings → Emails).
- [ ] Optional: Kontoname auf GitHub neutral machen oder Repos in ein neutral benanntes Konto verschieben. Der Repo-Name steht in `pflege/config.yml` (`repo:`), und diese Datei ist öffentlich abrufbar. Danach `repo:` in `config.yml`, die Cloudflare-Verbindung und die OAuth-App anpassen.
- [ ] `/pflege` mit Cloudflare Access schützen: siehe Abschnitt 0 (Unterpunkt beim Privatstellen).
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
- [ ] Deutscher Text „Über mich“: „setzte“ → „setze“, und wohl „in Szene“ ergänzen. Titel: doppeltes Leerzeichen entfernen.
- [ ] Titelvideo in höherer Auflösung (jetzt 832 × 464).
- [ ] Optional: Menü auf dem Handy linksbündig, Fotos der Galerie auch per Tastatur öffnen.

## Aufbau (so läuft es heute)
- **Seite:** Cloudflare-Worker `angie-portfolio` (nur Dateien), gebaut aus dem Repo `angie_portfolio` (Branch `main`). Festgelegt in `wrangler.jsonc` (Hauptordner wird veröffentlicht), `_headers` (Sperrvermerk für `/pflege`), `.assetsignore`.
- **CMS (Decap):** unter `/pflege`. Konfiguration `pflege/config.yml`. Sechs Einträge, Inhalte in `content/*.json`, Bilder in `images/uploads/`. Änderungen im CMS sind Commits auf `main` und lösen einen neuen Build aus.
- **Anmeldung:** Cloudflare-Worker `sveltia-cms-auth` (Kopie des öffentlichen Programms `sveltia/sveltia-cms-auth`, `src/index.js` unverändert), Repo `sveltia-cms-auth`. Einstellungen im Cloudflare-Dashboard: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (Secret), `ALLOWED_DOMAINS` (steht auch in `wrangler.toml`).
- **GitHub-OAuth-App:** Callback-URL = `<Adresse des Login-Dienstes>/callback`.
- **Account-Subdomain bei Cloudflare:** `agwebsites` (also `angie-portfolio.agwebsites.workers.dev`).
- **Sprachen:** Deutsch immer, Englisch/Russisch im CMS unter „1 · Allgemein & Menü“ freischaltbar.
- **Credits:** Auf Cloudflare gibt es keine Credit-Zählung wie bei Netlify (Netlify kostete 15 Credits je Veröffentlichung).
