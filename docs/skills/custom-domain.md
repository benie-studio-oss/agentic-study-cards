# Custom Domain Skill

Use this as the starting point when no built-in skill fits the user's subject.

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

## Rules

- Do not invent source-backed facts.
- Make uncertainty visible.
- Keep the schema stable unless the user explicitly changes the project shape.

