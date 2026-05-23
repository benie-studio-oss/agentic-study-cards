#!/usr/bin/env node
/**
 * Validate study-card content used by the public starter.
 * Uses only Node built-in modules.
 */

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(repoRoot, "data", "catalog.json");

const errors = [];
const summary = {
  deckEntries: 0,
  deckFilesChecked: 0,
  cardsChecked: 0,
  textsChecked: 0,
  audioRefsChecked: 0,
};

function addError(location, message) {
  errors.push(`${location}: ${message}`);
}

function toRelative(p) {
  const rel = path.relative(repoRoot, p);
  return rel.startsWith("..") ? p : rel;
}

function parseJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    addError(toRelative(filePath), `JSON parse failed (${error.message})`);
    return null;
  }
}

function isNonEmptyFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

function resolveRepoPath(candidate, options = {}) {
  const { fallbackToAudio = false, mustExist = false } = options;
  if (typeof candidate !== "string" || !candidate.trim()) {
    return null;
  }

  if (path.isAbsolute(candidate)) {
    return null;
  }

  const direct = path.resolve(repoRoot, candidate);
  const rel = path.relative(repoRoot, direct);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }

  if (fs.existsSync(direct)) {
    return direct;
  }

  if (!fallbackToAudio) {
    return mustExist ? null : direct;
  }

  const audioCandidate = path.join(repoRoot, "audio", candidate);
  return fs.existsSync(audioCandidate) ? audioCandidate : (mustExist ? null : direct);
}

function validateAudioReference(context, audioRef) {
  if (!audioRef) {
    return;
  }

  if (!audioRef || typeof audioRef !== "object" || Array.isArray(audioRef)) {
    addError(context, "audio reference must be an object with `kind` and `file`");
    return;
  }

  const audioFile = typeof audioRef.file === "string" ? audioRef.file : "";
  if (!audioFile) {
    addError(context, "audio.file is required");
    return;
  }

  if (!["source", "tts"].includes(audioRef.kind)) {
    addError(context, "audio.kind must be `source` or `tts`");
  }

  summary.audioRefsChecked += 1;
  const audioPath = resolveRepoPath(audioFile, { fallbackToAudio: true, mustExist: true });
  if (!audioPath) {
    addError(context, `audio.file must be a repo-relative path inside this project: ${audioFile}`);
    return;
  }

  if (!isNonEmptyFile(audioPath)) {
    addError(context, `audio file missing or empty: ${toRelative(audioPath)}`);
  }
}

function validateStringArray(context, value, fieldName) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    addError(context, `${fieldName} must be an array of strings`);
    return;
  }
  value.forEach((item, index) => {
    if (typeof item !== "string" || !item.trim()) {
      addError(context, `${fieldName}[${index}] must be a non-empty string`);
    }
  });
}

function validateSourceRefs(context, sourceRefs) {
  validateStringArray(context, sourceRefs, "sourceRefs");
  if (!Array.isArray(sourceRefs)) return;
  sourceRefs.forEach((sourceRef, index) => {
    if (typeof sourceRef !== "string") return;
    const filePart = sourceRef.split("#")[0];
    if (!filePart) {
      addError(context, `sourceRefs[${index}] must include a repo-relative source path`);
      return;
    }
    if (!resolveRepoPath(filePart)) {
      addError(context, `sourceRefs[${index}] must stay inside this project: ${sourceRef}`);
    }
  });
}

function validateCards(deck, resolvedDeckPath) {
  if (deck.cards === undefined) {
    return;
  }

  if (!Array.isArray(deck.cards)) {
    addError(toRelative(resolvedDeckPath), "deck.cards must be an array");
    return;
  }

  const frontSeen = new Set();
  deck.cards.forEach((entry, entryIndex) => {
    const location = `${toRelative(resolvedDeckPath)} -> cards[${entryIndex}]`;
    if (!entry || typeof entry !== "object") {
      addError(location, "card entry must be an object");
      return;
    }

    const front = typeof entry.front === "string" ? entry.front.trim() : "";
    const back = typeof entry.back === "string" ? entry.back.trim() : "";
    summary.cardsChecked += 1;

    if (!front) {
      addError(location, "front is required");
    } else if (frontSeen.has(front)) {
      addError(location, `duplicate front: "${front}"`);
    } else {
      frontSeen.add(front);
    }

    if (!back) {
      addError(location, "back is required");
    }

    validateStringArray(location, entry.tags, "tags");
    validateSourceRefs(location, entry.sourceRefs);
    validateAudioReference(`${location} -> audio`, entry.audio);
  });
}

function validateDeckEntry(item, index) {
  const deckLocation = `catalog.decks[${index}]`;

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    addError(deckLocation, "deck reference must be an object with `file`");
    return;
  }

  const rawPath = typeof item.file === "string" ? item.file : "";
  if (!rawPath) {
    addError(deckLocation, "deck reference missing `file`");
    return;
  }

  const resolvedDeckPath = resolveRepoPath(rawPath, { mustExist: true });
  if (!resolvedDeckPath) {
    addError(deckLocation, `deck file must be a repo-relative existing path: ${rawPath}`);
    return;
  }
  if (!fs.statSync(resolvedDeckPath).isFile()) {
    addError(deckLocation, `deck path is not a file: ${toRelative(resolvedDeckPath)}`);
    return;
  }

  const deck = parseJson(resolvedDeckPath);
  if (!deck) {
    return;
  }
  if (!deck || typeof deck !== "object" || Array.isArray(deck)) {
    addError(toRelative(resolvedDeckPath), "deck JSON must be an object");
    return;
  }

  summary.deckFilesChecked += 1;

  if (Object.prototype.hasOwnProperty.call(deck, "words")) {
    addError(toRelative(resolvedDeckPath), "deck.words is not part of the public schema; write vocabulary as deck.cards entries");
  }

  validateCards(deck, resolvedDeckPath);

  if (deck.texts !== undefined) {
    if (!Array.isArray(deck.texts)) {
      addError(toRelative(resolvedDeckPath), "deck.texts must be an array");
    } else {
      const textIds = new Set();
      deck.texts.forEach((text, textIndex) => {
        const location = `${toRelative(resolvedDeckPath)} -> texts[${textIndex}]`;
        if (!text || typeof text !== "object") {
          addError(location, "text entry must be an object");
          return;
        }
        const id = typeof text.id === "string" ? text.id.trim() : "";
        const title = typeof text.title === "string" ? text.title.trim() : "";
        const body = typeof text.body === "string" ? text.body.trim() : "";
        summary.textsChecked += 1;

        if (!id) {
          addError(location, "id is required");
        } else if (textIds.has(id)) {
          addError(location, `duplicate id: "${id}"`);
        } else {
          textIds.add(id);
        }

        if (!title) addError(location, "title is required");
        if (!body) addError(location, "body is required");

        validateSourceRefs(location, text.sourceRefs);
        validateAudioReference(`${location} -> text.audio`, text.audio);
      });
    }
  }

}

function printSummary() {
  console.log("Validation summary");
  console.log(`Catalog: ${toRelative(catalogPath)}`);
  console.log(`Deck entries in catalog: ${summary.deckEntries}`);
  console.log(`Deck files parsed: ${summary.deckFilesChecked}`);
  console.log(`Cards checked: ${summary.cardsChecked}`);
  console.log(`Texts checked: ${summary.textsChecked}`);
  console.log(`Audio references checked: ${summary.audioRefsChecked}`);

  if (errors.length === 0) {
    console.log("Result: PASS");
    return;
  }

  console.log(`Result: FAIL (${errors.length} error${errors.length === 1 ? "" : "s"})`);
  console.log("Errors:");
  for (const error of errors) {
    console.log(`- ${error}`);
  }
}

(function main() {
  if (!fs.existsSync(catalogPath)) {
    addError(toRelative(catalogPath), "catalog file is missing");
    printSummary();
    process.exitCode = 1;
    return;
  }

  const catalog = parseJson(catalogPath);
  if (!catalog) {
    printSummary();
    process.exitCode = 1;
    return;
  }

  if (typeof catalog !== "object" || catalog === null || Array.isArray(catalog)) {
    addError(toRelative(catalogPath), "catalog JSON must be an object");
    printSummary();
    process.exitCode = 1;
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(catalog, "schema")) {
    addError(toRelative(catalogPath), "required field `schema` is missing");
  }

  if (!Array.isArray(catalog.decks)) {
    addError(toRelative(catalogPath), "required field `decks` must be an array");
    printSummary();
    process.exitCode = 1;
    return;
  }

  summary.deckEntries = catalog.decks.length;
  catalog.decks.forEach((entry, index) => {
    validateDeckEntry(entry, index);
  });

  printSummary();
  if (errors.length > 0) {
    process.exitCode = 1;
  }
})();
