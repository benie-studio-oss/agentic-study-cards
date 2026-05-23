# Content Validation

This repo stores publishable data under `data/` and audio assets under `audio/`.
Use the validation script to quickly check whether these files are internally consistent.

Run from the repository root:

```bash
node scripts/validate-content.js
```

## What the script validates

### `data/catalog.json`
- File exists and is valid JSON.
- `schema` field exists.
- `decks` field exists and is an array.

### Deck entries in `catalog.decks`
For each deck entry, the script checks:

- The referenced deck file exists.
- Deck JSON can be parsed.

Each deck reference must be an object with a repo-relative `file` path:

```json
{ "file": "data/decks/deck-id.json" }
```

### Deck structure checks
Inside each deck file:

- `cards[]` entries:
  - `front` required.
  - `back` required.
  - `tags`, if present, must be an array of strings.
  - `sourceRefs`, if present, must be an array of repo-relative strings.
  - duplicate `front` values are reported as errors.

- `words[]` is rejected in the public schema. Vocabulary should be represented
  as `cards[]` entries so the app has one prompt shape to maintain.

- `texts[]` entries:
  - `id` required.
  - `title` required.
  - `body` required.
  - `sourceRefs`, if present, must be an array of repo-relative strings.
  - duplicate `id` values are reported as errors.

### Audio reference checks

- `text.audio.file`:
  - if present, `text.audio` must be an object with `kind` and `file`.
  - `kind` must be `source` or `tts`.
  - `file` must be repo-relative, inside this project, and non-empty.

- `card.audio`:
  - if present, `card.audio` must be an object with `kind` and `file`.
  - `kind` must be `source` or `tts`.
  - `file` must be repo-relative, inside this project, and non-empty.

- `text.audio.kind === "source"`:
  - no files are generated.
  - only existence/size checks are performed.

## Result and exit behavior

- If issues are found, the script prints a clear summary and sets `process.exitCode = 1`.
- If all checks pass, it prints `Result: PASS` and exits with success status.

## Notes

- The validator does not read from `input/`.
- Only Node built-in modules are used (no external dependencies).
- Absolute paths and `..` paths are rejected for publishable references.
