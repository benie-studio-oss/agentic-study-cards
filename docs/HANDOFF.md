# Maintainer Handoff

## Project Positioning

Agentic Study Cards is a public starter for an agent-maintained learning flow.
It is not meant to compete with full flashcard products. Its core promise is:

1. learners drop raw study material into `input/`,
2. an AI agent extracts source-backed cards, texts, notes, and optional audio,
3. validation checks the publishable JSON and referenced audio,
4. a human confirms the update before publishing the static site.

## Current App Surface

- `index.html` is the static app shell.
- `assets/app.js` loads `data/catalog.json`, deck JSON files, card sessions,
  card detail pages, text reading/listening, themes, and audio controls.
- `assets/styles.css` contains the mobile-first liquid-glass UI, including day
  and moonlight night themes.
- `data/decks/*.json` contains public sample data only.
- `scripts/validate-content.js` validates the public `cards[]` and `texts[]`
  schema. It intentionally rejects `words[]`; vocabulary should be represented
  as `cards[]`.

## Public Schema Boundary

The app keeps one prompt shape:

- `cards[]`: question/answer, vocabulary, exam concepts, or technical terms.
- `texts[]`: reading/listening material with optional translation/explanation
  and optional audio metadata.

Domain-specific skills can add extra fields to card objects. The app renders
standard fields directly and shows custom fields on the card detail page.

## Validation Evidence To Re-run

```bash
npm run validate
node --check assets/app.js
node --check scripts/validate-content.js
```

For UI verification, run a static server and check:

- Library deck switching.
- Cards setup -> Start -> flip -> previous/next.
- Cards setup -> View All Cards -> card detail.
- Texts directory -> reader -> repeat-one and playback speed menu.
- Settings day/night theme switching.

## Known Limits

- TTS generation is documented as an adapter responsibility and is not bundled.
- Browser speech fallback depends on available browser voices.
- Adapter docs describe an example agent-runtime boundary, but no runnable
  connector is bundled yet.
- The starter is intentionally static and file-based; SQLite or hosted APIs are
  out of scope until a real user workflow needs them.
