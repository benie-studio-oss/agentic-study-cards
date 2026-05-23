Agentic Study Cards - Public Starter Design
=========================================

## 1) Vision
This starter is not just a flashcard app.

It is an **agent-maintained learning pipeline** for creating and publishing study content.

Users provide raw learning material; an agent turns it into source files (cards, notes, texts, audio), and a lightweight human approval step controls what is published.

## 2) Repository Role
The repository is designed as a publishable portfolio project:

- It demonstrates how to connect **human input -> agent output -> human review -> deployment**.
- It keeps generated learning artifacts in version control as first-class project files.
- It avoids coupling to one AI model provider or one deployment vendor.

## 3) Data and Directory Boundaries
Clear boundaries reduce accidental drift and keep the repo reviewable.

- `input/`
  - User-owned raw submissions.
  - Expected formats: image, PDF, audio, text.
  - This is a workspace buffer and may be mutable.
- Optional quarantine folder
  - Temporary/failed/untrusted incoming items can be routed to a local ignored
    folder chosen by the adapter.
  - The starter keeps only `input/` by default to stay small.
- `data/`
  - **Source of truth** for generated output.
  - Stores canonical `cards` and `texts` artifacts in structured JSON.
  - All publishable content should be derived from files under `data/`.
- `audio/`
  - `audio/cards/`: optional card audio.
  - `audio/texts/`: optional text/listening audio.
  - Source audio and TTS audio are distinguished by JSON metadata, not by
    trusting a folder name alone.
- `notes/`
  - Separate from `cards` and `texts`.
  - Optional future extension for reflections, correction notes, and study
    context, kept distinct to avoid mixing canonical content with commentary.

## 4) Data Model (Minimal)
- `cards`: question/answer style prompt objects with stable IDs and provenance metadata.
- `texts`: chapter/article summaries, glossary extracts, or rewritten study passages.
- `audio`: mapping from text/card IDs to audio source and fallback assets.

Generated artifacts can include optional metadata such as:
- source references
- generation timestamp
- confidence/validation state
- author/reviewer identity (human review stamp)
- provenance (generated / edited / verified)

## 5) Core Principle
Treat `data/` as immutable in intent and traceable in history.

Every publishable file should be:
- reproducible from source input
- reviewable in diff
- attributable to a source artifact and an approval step

## 6) Core Flow (High Level)
1. User submits `input/` materials.
2. Agent creates draft artifacts in `data/` and `audio/` staging area.
3. Human reviewer validates and edits draft content.
4. Approved set is committed to version control.
5. CI/CD publishes static site + assets.

## 7) Optional Starter Tracks
This starter can be adapted by domain:
- Language learning
- Exam concepts and knowledge maps
- Technical certification prep
- Domain-specific courses (custom sets, custom rules, and custom UI views)

## 8) Security and Privacy Defaults
- Never store secrets in repo files.
- Default to deterministic IDs and explicit provenance to support auditing.
- Restrict write permissions for gateway/agent endpoints.
- Keep ingestion and publishing auditable and review-driven.

## 9) What This Starter Does Not Claim
- It does not promise best-in-class language model behavior.
- It does not bind to one model provider.
- It does not claim zero-touch publishing.
- It does not auto-accept generated audio as authoritative when source audio exists.

## 10) Handoff Pointers
See `AGENT_WORKFLOW.md` for the operator sequence and checks.

For adapter and provider integrations, see `ADAPTERS.md`.
