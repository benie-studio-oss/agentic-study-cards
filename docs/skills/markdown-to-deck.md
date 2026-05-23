# Markdown To Deck Skill

Use this skill when the learner drops Markdown notes, transcripts, exported
lesson notes, or hand-cleaned OCR text into `input/` and wants a deck update.

Pair it with `docs/skills/study-card-maintainer.md` and the closest domain
skill, such as `language-learning.md`, `exam-concepts.md`, or
`technical-certification.md`.

## Intake

1. List Markdown files under `input/`.
2. Identify the likely domain and target deck.
3. Preserve source structure such as headings, tables, lists, code blocks, and
   quoted passages.
4. If multiple files overlap, prefer the clearest source and mark conflicts for
   review instead of merging guesses.

## Source References

Use source references that let a human find the original item later.

Good examples:

- `input/cloud-notes.md#shared-responsibility`
- `input/french-class-2026-05-20.md#line-42`
- `input/exam-review.md#table-networking-basics`

Avoid:

- absolute paths
- private machine paths
- vague references such as `notes`
- references to files outside the repository

## Extraction Rules

Create `cards[]` for:

- definitions
- acronyms
- vocabulary and phrases
- comparisons and boundaries
- formulas or rules
- common mistakes
- procedure steps
- scenario questions
- source-backed Q&A items

Create `texts[]` only for:

- real source readings
- source-backed transcripts
- short study readings that are explicitly derived from the Markdown and useful
  for reading or listening review

Do not create `texts[]` as a dumping ground for every note section.

## Card Shape

Use this shape unless the domain skill asks for a compatible extension:

```json
{
  "id": "stable-kebab-case-id",
  "front": "Question, term, or prompt",
  "back": "Answer",
  "detail": "Short source-backed explanation or review note.",
  "tags": ["topic", "type"],
  "sourceRefs": ["input/file.md#heading"]
}
```

## Quality Bar

- No duplicate `front` text inside the same deck.
- No empty `front`, `back`, `id`, `title`, or `body`.
- Each generated item has at least one useful `sourceRefs` entry.
- Long Markdown sections become several small cards, not one crowded card.
- Ambiguous facts are tagged `needs-review`.
- Generated summaries are clearly source-backed and do not add outside facts.

## Update Steps

1. Update or create one deck JSON under `data/decks/`.
2. Register new decks in `data/catalog.json`.
3. Add optional audio only if the user requested audio and no matching source
   audio already exists.
4. Run validation.
5. Report source coverage and all `needs-review` items.
6. Wait for human approval before commit, push, or publish.

## Validation

Run:

```bash
npm run validate
node --check assets/app.js
node --check scripts/validate-content.js
```

## Final Report

Report:

- Markdown files used.
- Target deck.
- Cards and texts added or updated.
- Audio policy used.
- Validation result.
- Remaining ambiguities.

