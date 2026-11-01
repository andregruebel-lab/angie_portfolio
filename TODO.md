# To-do und Aufbau (Angies Portfolio)

Stand: 01.11.2026. Diese Datei wird **nicht** auf der Webseite veröffentlicht (steht in `.assetsignore`).

## 1. Vor dem öffentlichen Start (Pflicht bzw. dringend)
- [ ] **Impressum** als eigene Seite anlegen und im Fußbereich verlinken. Angaben: Name, ladungsfähige Anschrift, Kontakt (E-Mail). Ob und was Pflicht ist, hängt von der Art der Seite ab; im Zweifel rechtlich klären lassen.
- [ ] **Datenschutzerklärung** als eigene Seite anlegen und verlinken. Themen: Hosting bei Cloudflare (Server-Logfiles), E-Mail-Kontakt, Links zu Instagram/Are.na/Shop, Speicherung der gewählten Sprache im Browser (localStorage). Rechtlich klären lassen.
- [ ] **Externe Verbindungen entfernen:** Google Fonts (`fonts.googleapis.com`) und React/Babel von `unpkg.com` auf eigene Dateien im Repo umstellen (Schriften als Dateien ablegen, Adressen in `support.js` und den beiden Seiten ändern). Babel ist 3 MB groß. Danach testen, dass beim Öffnen keine Verbindung zu Google/unpkg mehr entsteht.
- [ ] **Link-Vorschau (WhatsApp, Instagram, Google)** reparieren: In `index.html` stehen im Seitenkopf noch Titel und Beschreibung der Vorlage („Mara Ellison, Lissabon“, og:title). Das lässt sich nur im Quelltext ändern, nicht im CMS. Außerdem `Series.dc.html` prüfen.

## 2. Domain
- [ ] Domain registrieren oder anbinden: bei Cloudflare im Worker `angie-portfolio` unter Settings → Domains & Routes als Custom Domain hinzufügen (je nach Anbieter DNS-Eintrag oder DNS zu Cloudflare umziehen).
- [ ] Im Login-Dienst (`sveltia-cms-auth`) die neue Domain bei `ALLOWED_DOMAINS` **zusätzlich** eintragen (in `wrangler.toml`, mit Komma getrennt).
- [ ] In der GitHub-OAuth-App die **Homepage URL** anpassen (die Callback-URL bleibt!).
- [ ] Danach die `workers.dev`-Adresse des Portfolio-Workers abschalten, damit keine zweite Adresse im Umlauf ist.
- [ ] E-Mail-Adresse im Fußbereich: später eine Adresse unter der eigenen Domain verwenden (die jetzige liegt bei Gmail).

## 3. GitHub und Zugänge
- [ ] Repos `angie_portfolio` und `sveltia-cms-auth` auf **privat** stellen (danach Cloudflare-Build und CMS-Login prüfen).
- [ ] Bei GitHub „Keep my email addresses private“ einschalten (Settings → Emails).
- [ ] Optional: Kontoname auf GitHub neutral machen oder Repos in ein neutral benanntes Konto verschieben. Der Repo-Name steht in `pflege/config.yml` (`repo:`), und diese Datei ist öffentlich abrufbar. Danach `repo:` in `config.yml`, die Cloudflare-Verbindung und die OAuth-App anpassen.
- [ ] Optional: `/pflege` mit Cloudflare Access zusätzlich schützen.
- [ ] Alte Netlify-Seite abschalten oder löschen, alte GitHub-OAuth-App (für Netlify) löschen.
- [ ] Client ID und Client Secret der OAuth-App in einem Passwort-Manager sichern (das Secret wird bei GitHub nur einmal angezeigt; im Zweifel ein neues erzeugen und in Cloudflare eintragen).

## 4. Sicherung (Backup)
Der Code liegt bisher **nur auf GitHub**. Ein Fehler dort (versehentlich gelöscht, Konto gesperrt) wäre sonst das Ende der Seite.
- [ ] **Lokale Kopie** auf dem eigenen Rechner anlegen: Git oder GitHub Desktop installieren, das Repo mit „Clone“ holen. Danach regelmäßig „Pull“, weil das CMS Änderungen direkt auf GitHub macht. Bei einem privaten Repo ist dafür eine Anmeldung bei GitHub nötig.
- [ ] Dasselbe für das Repo `sveltia-cms-auth` (klein, aber nötig für die CMS-Anmeldung).
- [ ] Optional: zweite Kopie (zum Beispiel automatisch auf einem anderen Git-Anbieter spiegeln oder ein Archiv `ZIP` der Fotos in `images/uploads/` an einem anderen Ort).
- [ ] Die Zugangsdaten zu Cloudflare, GitHub und der Domain sichern (Passwort-Manager, zweiter Faktor).

## 5. Inhalte und Feinschliff
- [ ] **Platzhalter der Vorlage ersetzen:** Die fünf Serien („Die lange Flut“ usw.) ohne Bilder, Instagram-/Are.na-/Shop-Links (`#`), Porträtfoto, Jahreszahlen bei den Fotos (aktuell Platzhalter 2024 bis 2026), Bildunterschrift und Jahr unter dem Titelvideo.
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
