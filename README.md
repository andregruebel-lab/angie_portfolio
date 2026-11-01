# Portfolio (Fotografie)

Statische Webseite mit drei Sprachen (Deutsch, Englisch, Russisch), Pflege über ein CMS.

## Bearbeiten
- **Inhalte, Texte, Fotos:** im CMS unter `/pflege` (Anmeldung mit GitHub, nur für eingeladene Mitarbeiter). Änderungen erscheinen etwa ein bis zwei Minuten nach dem Veröffentlichen.
- **Sprachen:** im CMS unter „1 · Allgemein & Menü“ freischalten.
- **Fotos:** werden beim Hochladen im CMS automatisch verkleinert und von Standort- und Gerätedaten befreit.

## Aufbau
- `index.html`, `Series.dc.html`, `impressum.html`, `datenschutz.html`: die Seiten
- `content/`: alle Texte und Listen (JSON), `images/uploads/`: Fotos und Video
- `pflege/`: CMS (Konfiguration, Bildbereinigung)
- `tools/pruefung.mjs`: Prüfung der Seite (Fotos, Zugangsdaten, Schutz des CMS, Inhalte). Aufruf: `node tools/pruefung.mjs`
- `TODO.md`: offene Aufgaben und der Aufbau im Überblick, `CLAUDE.md`: Regeln für KI-Assistenten

Die Dateien `README.md`, `CLAUDE.md`, `AGENTS.md`, `TODO.md` und `tools/` werden **nicht** auf der Webseite veröffentlicht (siehe `.assetsignore`).
