# Public Release Checklist

Use this before publishing the starter to a public GitHub repository.

## Privacy And Content

- Confirm `input/` contains only `.gitkeep` or intentionally public samples.
- Confirm `audio/` contains only files that can be redistributed.
- Search for local paths, personal names, private repo names, tokens, and
  machine-specific notes.
- Keep sample decks small, generic, and clearly hand-authored or redistributable.

## Repository Metadata

- Choose a public repository name, for example `agentic-study-cards`.
- Publish under the `benie-studio-oss` GitHub account or organization.
- Use `benie-studio-oss <benie-studio@proton.me>` for local git author metadata.
- Keep `package.json` repository/homepage/bugs URLs pointed at
  `https://github.com/benie-studio-oss/agentic-study-cards`.
- Keep `AGENTS.md` at the repository root so code agents can orient themselves
  without reading the entire project first.
- Keep `docs/skills/study-card-maintainer.md` and `docs/skills/markdown-to-deck.md`
  copy-paste-ready for agent runtimes that do not have native skill loading.
- Upload `docs/assets/social-preview.png` as the GitHub repository social
  preview. `docs/assets/social-preview.html` is the cross-platform layout
  template used to recreate it.
- Add GitHub topics such as `study-cards`, `study`, `ai-agent`, `static-site`,
  `learning-tools`, and `agent-workflow`.
- Keep the MIT license or replace it before first public release.

## Validation

```bash
npm run validate
node --check assets/app.js
node --check scripts/validate-content.js
```

Open the app through a local static server and verify:

- Library.
- Cards start/session/list/detail.
- Text directory/reader/audio controls.
- Settings day/night themes.
- Mobile viewport layout and bottom navigation.

## Platform Compatibility

- Do not describe this as a Windows version. It is a cross-platform static app.
- Mention `python3 -m http.server 4173` for macOS/Linux and
  `python -m http.server 4173` for Windows.
- Keep JSON paths repo-relative with forward slashes so agents and static hosts
  can use the same files across operating systems.

## Positioning

The README should describe the project as an agent-maintained learning workflow,
not only a flashcard UI. The public promise is the workflow:

`input/` raw material -> agent extraction -> JSON/source-backed cards and texts
-> validation -> human confirmation -> static deploy.

## Deployment

- Vercel, Cloudflare Pages, Netlify, and GitHub Pages can all serve the static
  files directly.
- No build step is required.
- If using GitHub Pages, publish from the repository root or copy the app into a
  configured Pages branch/folder.

## Optional Next Steps

- Add a runnable adapter example for one agent system.
- Add full app localization only after more UI copy stabilizes. A translated
  README is enough for the first public release.
