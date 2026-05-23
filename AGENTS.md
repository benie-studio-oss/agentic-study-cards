# Agent Instructions

This repository is a public starter for an agent-maintained study workflow.
It is intentionally small and file-based so many agent runtimes can adapt it.

## First Files To Read

1. `README.md`
2. `docs/AGENT_WORKFLOW.md`
3. `docs/SCHEMA.md`
4. `docs/VALIDATION.md`
5. `docs/skills/study-card-maintainer.md`
6. `docs/ADAPTERS.md`

## Core Contract

- `data/catalog.json` registers decks.
- `data/decks/*.json` is the publishable study content.
- `audio/` stores optional referenced audio.
- `input/` is ignored and is only for local raw materials.
- `docs/sample-sources/` contains sanitized public sample sources.
- `docs/skills/` contains copy-paste-ready base and domain skills.

## Allowed Content Updates

When maintaining study content, update:

- `data/decks/*.json`
- `audio/cards/` or `audio/texts/`, only when audio is needed
- documentation that explains a workflow or schema change

Do not publish raw private material from `input/`.

## Validation

Run these before claiming a content or app change is ready:

```bash
npm run validate
node --check assets/app.js
node --check scripts/validate-content.js
```

For UI work, also run a local static server and manually verify:

- Library deck switching.
- Cards setup, session, list, and detail views.
- Text directory, reader, repeat-one, and playback speed menu.
- Settings day/night theme switching.

## Source And Audio Rules

- Keep cards and texts source-backed.
- Do not invent source references.
- Use repo-relative paths with forward slashes.
- If source audio exists, reference it as `kind: "source"`.
- Generate or reference TTS only when no source audio exists and the user wants it.
- Never overwrite source audio with TTS.

## Human Approval

Agents may draft content and validation summaries, but publishing should remain
human-confirmed. Do not commit, push, deploy, or overwrite user material unless
the human explicitly asks for it.
