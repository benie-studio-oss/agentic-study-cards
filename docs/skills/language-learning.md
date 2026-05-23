# Language Learning Skill

Use this skill when the source material is a language lesson, textbook page,
classroom board photo, transcript, or audio recording.

Pair it with `study-card-maintainer.md`. For cleaned Markdown notes or
transcripts, also use `markdown-to-deck.md`.

## Output

- Cards for vocabulary, phrases, grammar chunks, and useful examples.
- Text entries only for real source texts or trusted transcripts.
- Notes that explain the lesson in the learner's preferred language.
- Optional audio for cards and texts.

## Agent Checklist

1. Identify the target language, learner language, unit, lesson, and source
   type if the material provides them.
2. Extract vocabulary and phrases as `cards[]`.
3. Extract grammar points as small cards with source-backed examples.
4. Add `texts[]` only for actual readings, dialogues, transcripts, or
   source-faithful short passages.
5. Keep notes concept-oriented rather than OCR-order-oriented.
6. Mark uncertain OCR, handwriting, or listening as `needs-review`.

## Rules

- Stay source-faithful. Do not invent textbook passages, answers, or audio.
- Keep examples close to the visible or audible source.
- Prefer structured fields over long prose hints.
- If a text has source audio, reference that audio and mark it as `source`.
- Generate TTS only when no matching source audio exists and the user wants it.

## Validation

- Cards have `front` and `back`.
- Texts have `id`, `title`, and `body`.
- Referenced audio files exist and are non-empty.
- Uncertain OCR or listening results are marked for user review.

## Useful Tags

- `vocabulary`
- `phrase`
- `grammar`
- `listening`
- `reading`
- `needs-review`
