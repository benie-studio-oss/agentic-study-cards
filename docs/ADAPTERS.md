Adapters and Integrations
========================

## Design Goal
Keep the core pipeline model-neutral and provider-agnostic.

Adapters should isolate external systems while leaving the workflow logic and repository contracts unchanged.

The starter should be easy to pull into any agent runtime. If a framework can
read files, write JSON, run a validation command, and ask the user for approval,
it can use this repo without a custom SDK.

## Smallest Useful Adapter

The smallest adapter is a file contract, not a package:

1. Receive user materials from chat, upload, sync folder, or another gateway.
2. Save those materials into `input/`.
3. Ask the agent to read `docs/AGENT_WORKFLOW.md` and `docs/SCHEMA.md`.
4. Let the agent update `data/decks/*.json` and optional files under `audio/`.
5. Run `node scripts/validate-content.js`.
6. Show the diff and validation summary to the user.
7. Commit/publish only after explicit user approval.

Everything else is optional glue.

## Current Boundaries
- **No single provider lock-in**: no provider-specific behavior in core logic.
- **No hidden coupling**: adapters emit and consume normalized event/data shapes.
- **Gateway is thin**: only file handoff + job trigger.

## Example Agent Runtime Adapter Boundary

### What the gateway may do
- receive submission events from external tools
- persist/drop files into `input/` and `ignored-inbox/`
- emit a canonical job event to the orchestrator (`start_processing`, `retry`, `status` requests)
- expose health/check endpoints and job identifiers

### What the gateway must not do
- write deployment config
- auto-run publish operations
- hide or alter validation outcomes
- directly patch generated content

### Operational rule
Any publish or config update should require explicit user confirmation and an approved workflow state.

## Adapter Surface

1. **Ingestion Adapter**
   - Converts uploads/API payloads into internal `submission` objects.
   - Normalizes file metadata and language/topic hints.

2. **Generation Adapter**
   - Converts normalized input into draft artifacts.
   - Enforces stable IDs and artifact schema shape.

3. **Validation Adapter**
   - Executes lint/schema checks and returns pass/fail reports.
   - Keeps validation independent of generation quality.

4. **Publish Adapter**
   - Maps approved states to hosting provider actions.
   - Supports provider-specific commands for:
     - Vercel
     - Cloudflare Pages
     - GitHub Pages
   - Keeps deploy provider config explicit and auditable.

## Configuration and Deployment Flow
- Config changes (API keys, publish targets, path mappings) must be explicit, reviewable, and separate from runtime job triggers.
- Never trigger deployment with placeholder, expired, or missing secrets.
- Deployment adapters must fail closed when required approvals are missing.

## Audio Strategy in Adapters
- Treat source audio as authoritative input.
- Adapter resolution order:
  1. matching source audio
  2. TTS-generated audio only if no match exists
- Do not replace source audio metadata once attached, unless a human review action creates a new revision.

## Migration and Extensibility
Adding a new model or provider should only require a new adapter module and configuration.

Core file contracts should remain:
- input payload format
- draft artifact schema
- validation state model
- approval marker format

## Handoff Notes for Next Agent
- Keep this boundary document updated whenever external API behavior changes.
- If a new provider is added, document:
  1. required secrets
  2. event payload mapping
  3. failure modes
  4. rollback path
