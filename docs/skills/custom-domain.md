# Custom Domain Skill

Use this as the starting point when no built-in skill fits the user's subject.

Pair it with `study-card-maintainer.md`. If the source is Markdown, also use
`markdown-to-deck.md`.

## First Questions

- What is the learner trying to do with the material?
- Should cards test recall, recognition, explanation, or procedure?
- Are texts useful for reading/listening practice, or should the app stay card-only?
- Is audio helpful, unnecessary, or actively distracting?

## Output Contract

- Cards use `front`, `back`, optional `detail`, `tags`, and `sourceRefs`.
- Texts use `id`, `title`, `body`, optional `translation`, optional `audio`, and
  `sourceRefs`.
- Notes stay separate from app data.

## Agent Checklist

1. Define the learning goal in one sentence.
2. Choose whether the deck should prioritize recall, recognition, explanation,
   procedures, or mixed review.
3. Create small source-backed cards.
4. Add texts only when longer reading or listening review is genuinely useful.
5. Choose a small, consistent tag set.
6. Mark uncertainty as `needs-review`.

## Rules

- Do not invent source-backed facts.
- Make uncertainty visible.
- Keep the schema stable unless the user explicitly changes the project shape.

## Useful Tags

Start with a small set. Examples:

- `definition`
- `procedure`
- `example`
- `comparison`
- `needs-review`
