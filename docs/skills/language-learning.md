# Language Learning Skill

Use this skill when the source material is a language lesson, textbook page,
classroom board photo, transcript, or audio recording.

## Output

- Cards for vocabulary, phrases, grammar chunks, and useful examples.
- Text entries only for real source texts or trusted transcripts.
- Notes that explain the lesson in the learner's preferred language.
- Optional audio for cards and texts.

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

