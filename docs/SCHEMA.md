# Data Schema

This starter keeps publishable learning content in JSON so humans and agents can
review diffs easily.

## Catalog

`data/catalog.json` registers every deck shown in the app.

```json
{
  "schema": "agentic-study-cards.catalog.v1",
  "title": "Agentic Study Cards",
  "subtitle": "Source-backed study decks maintained by agents.",
  "decks": [
    {
      "id": "language-learning-sample",
      "title": "Language Learning Sample",
      "domain": "language-learning",
      "description": "A small public sample.",
      "file": "data/decks/language-learning-sample.json"
    }
  ]
}
```

## Deck

Deck files live in `data/decks/`.

```json
{
  "schema": "agentic-study-cards.deck.v1",
  "id": "language-learning-sample",
  "title": "Language Learning Sample",
  "domain": "language-learning",
  "source": "Public hand-authored sample data",
  "cards": [],
  "texts": []
}
```

Recommended `domain` values:

- `language-learning`
- `exam-concepts`
- `technical-certification`
- `custom-domain`

## Cards

```json
{
  "id": "cloud-iaas",
  "front": "What does IaaS stand for?",
  "back": "Infrastructure as a Service",
  "detail": "A cloud service model where infrastructure is rented.",
  "tags": ["cloud", "service-model"],
  "sourceRefs": ["input/sample-cloud-notes.md#iaas"],
  "audio": {
    "kind": "tts",
    "file": "audio/cards/cloud-iaas.mp3"
  }
}
```

Required:

- `front`
- `back`

Recommended:

- stable `id`
- `detail`
- `tags`
- `sourceRefs`

`sourceRefs` should be repo-relative strings. They may point to local `input/`
files during a private workflow or to sanitized public sample sources such as
`docs/sample-sources/...`.

## Texts

```json
{
  "id": "shared-responsibility",
  "title": "Shared Responsibility",
  "source": "Public hand-authored sample data",
  "body": "In cloud computing, security work is shared...",
  "translation": "Optional translation or explanation.",
  "speechLang": "en-US",
  "audio": {
    "kind": "source",
    "file": "audio/texts/shared-responsibility.mp3"
  },
  "sourceRefs": ["input/sample-cloud-notes.md#shared-responsibility"]
}
```

Required:

- `id`
- `title`
- `body`

Audio is optional. If an audio object exists, `file` must point to a non-empty
file and `kind` should be one of:

- `source` - user-provided or authoritative source audio.
- `tts` - generated fallback audio.

Source audio must not be overwritten by TTS.

## Notes

Notes are intentionally separate from deck JSON. They can be Markdown or JSON
depending on the user's workflow, but they should not silently change the app's
published card/text data.
