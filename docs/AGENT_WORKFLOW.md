Agentic Workflow
================

## Scope
This workflow turns loose learning material into reviewed, deployable repository changes.

It is intentionally model-agnostic and deployment-agnostic.

## Participants
- User: submits materials and approves output.
- Agent: generates drafts from input.
- Reviewer: validates, edits, and approves.
- Orchestrator: validates schema, triggers deployment pipeline.

## File Routes
`input/` -> `data/` / `audio/` -> review -> commit -> deploy

### Queue and Inbox
- `input/` holds new submissions.
- Unsupported formats or parse failures are reported and may move to an
  adapter-specific ignored quarantine folder.
- Processed items are moved or marked once generated drafts are attached in `data/`.

## Detailed Steps

1. Intake
   - User uploads one or more: image, PDF, text, mp3.
   - Ingestion captures basic metadata:
     - source type
     - language/topic hints
     - submitter and timestamp
     - source integrity summary

2. Draft Generation (Agent)
   - Produce draft files:
     - `cards` JSON
     - `texts` JSON
     - optional `notes` JSON or Markdown, if the local workflow uses notes
     - audio entries
   - Keep generated items linked to input provenance.
   - Apply deterministic ordering and stable IDs.

3. Audio Draft Rule
   - First, attempt to match existing source audio from user uploads.
   - If matching source audio exists for an item, attach it.
   - If no source audio exists, optionally generate TTS draft.
   - Never overwrite source audio with TTS output.
   - Explicitly mark audio with `kind: source|tts`.

4. Validation
   - Run schema checks for each artifact.
   - Detect duplication/conflicts for IDs and references.
   - Flag low-confidence content and missing dependencies.
   - Produce a validation summary that users can review with the diff.

5. Human Review
   - User inspects generated artifacts before publication.
   - User edits required fields (wording, tags, difficulty, answers, references).
   - Approval is explicit (single action/state marker).

6. Commit and Publish
   - Approved artifacts are committed.
   - Deployment starts only after approval.
   - Recommended targets: Vercel / Cloudflare Pages / GitHub Pages (or equivalent).

7. Post-Publish
   - Keep publish commit hash and source artifact refs.
   - Maintain changelog entries for each release slice.
   - Optionally archive deprecated materials.

## Workflow Contracts
- Agent may create or update drafts only in draft locations.
- Orchestrator may not publish without reviewer approval state.
- Publish adapter may not modify `data/` content.

## Suggested States
- `submitted` -> `drafted` -> `validation_failed`/`validation_passed` -> `reviewing` -> `approved` -> `published`

## Optional Tracks
Starter variants can reuse the same pipeline with different prompts, tags, and validation rules:
- language learning decks
- exam concept sets
- technical certification notes
- custom domain/role-specific content tracks

## Minimal Checklist
- Input routed correctly to staging or an adapter-specific quarantine.
- Drafts created under `data/` and `audio/` with stable IDs.
- Validation summary generated and visible.
- Human approval recorded.
- Deployment only after approved state.
- Commit does not overwrite source audio with TTS.

## Handoff for Next Agent
- Background: this starter is scoped as an agent-maintained learning pipeline with human-in-the-loop review, not a one-shot flashcard generator.
- Current checkpoint: the app, schema docs, validation script, and public sample data are aligned around `cards[]`, `texts[]`, optional audio, and explicit approval before publish.
- Validation evidence: run `npm run validate`, `node --check assets/app.js`, and `node --check scripts/validate-content.js`.
- Remaining risk: runnable agent-runtime adapters are documented as boundaries but not implemented.
- Next priority: add one real adapter example only after choosing a target runtime and event payload shape.
