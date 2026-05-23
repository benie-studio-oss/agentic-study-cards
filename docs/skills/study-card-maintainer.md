# Study Card Maintainer Skill

Use this as the base skill for any agent that maintains this repository.

This file is intentionally written as both documentation and a copy-paste
agent instruction. If your agent runtime does not support "skills", paste the
sections from Mission through Final Report into the agent's task prompt.

## Mission

Maintain an agent-assisted study-card workflow.

Raw learning material enters through `input/`. Publishable study content lives
under `data/`, with optional audio under `audio/`. The agent drafts
source-backed cards, texts, notes, and optional audio references, then asks the
human to review before commit, push, or deploy.

## Read First

1. `AGENTS.md`
2. `docs/AGENT_WORKFLOW.md`
3. `docs/SCHEMA.md`
4. `docs/VALIDATION.md`
5. One matching domain skill from `docs/skills/`

For Markdown notes or transcripts, also read `docs/skills/markdown-to-deck.md`.

## Repository Contract

- `data/catalog.json` registers public decks.
- `data/decks/*.json` contains editable public deck content.
- `cards[]` is used for vocabulary, concepts, Q&A, technical terms, exam facts,
  and other review prompts.
- `texts[]` is used for real source texts, transcripts, or source-faithful
  study readings.
- `audio/cards/` and `audio/texts/` contain optional audio referenced from JSON.
- `input/` is ignored and may contain private raw material. Do not publish it.

## Workflow

1. Inspect `input/` and summarize the available source material.
2. Choose an existing deck or create a new deck in `data/decks/`.
3. Register new decks in `data/catalog.json`.
4. Extract cards and texts conservatively from the source.
5. Keep stable IDs and deterministic ordering.
6. Preserve source references in `sourceRefs`.
7. Add audio only when useful and allowed by the audio rules below.
8. Run validation.
9. Report changes, validation evidence, and uncertainty.
10. Wait for human approval before commit, push, or publish.

Ask one short clarification only when the deck target, domain, or publishing
boundary is genuinely ambiguous.

## Content Rules

- Stay source-faithful.
- Do not invent passages, answers, citations, source references, or audio.
- Prefer small, reviewable cards over broad summary cards.
- Keep uncertain OCR, transcription, or interpretation visible with
  `needs-review` tags or clear `detail` notes.
- Use repo-relative paths with forward slashes.
- Do not use absolute paths, local machine paths, tokens, private names, or raw
  unpublished source text in public examples.
- Keep notes separate from app data unless the project explicitly adds a notes
  schema.

## Audio Rules

- If matching source audio exists, reference it as:
  `{ "kind": "source", "file": "audio/texts/example.mp3" }`
- Generate or reference TTS only when no matching source audio exists and the
  user wants listening practice.
- Never overwrite source audio with TTS.
- Validation checks referenced files. It does not generate audio.

## Validation

Run:

```bash
npm run validate
node --check assets/app.js
node --check scripts/validate-content.js
```

For UI changes, also run a local static server and manually check:

- Library deck switching.
- Cards setup, session, list, and detail views.
- Text directory, reader, repeat-one, and playback speed menu.
- Settings day/night theme switching.

## Final Report

Report these items to the human:

- Deck files changed.
- Source material used.
- Number of cards and texts added, updated, or removed.
- Audio files added or referenced.
- Validation commands and results.
- Items marked `needs-review`.
- Whether commit, push, or deploy is waiting for approval.

