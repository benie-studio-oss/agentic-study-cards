const CATALOG_FILE = "data/catalog.json";
const DATA_VERSION = String(Date.now());
const SPEECH_LANG_BY_DOMAIN = {
  "language-learning": "fr-FR",
  "exam-concepts": "en-US",
  "technical-certification": "en-US",
  "custom-domain": "en-US"
};
const THEMES = [
  { id: "day", label: "Day" },
  { id: "night", label: "Night" }
];

const state = {
  catalog: null,
  decks: [],
  activeDeckId: "",
  activeDeck: null,
  cards: [],
  filteredCards: [],
  studyCards: [],
  activeCardIndex: 0,
  activeDetailIndex: 0,
  batchSize: 0,
  flipped: false,
  cardsView: "setup",
  activeTextIndex: 0,
  textView: "directory",
  textAudio: null,
  textRate: 1,
  repeatText: false,
  speaking: false,
  theme: "day"
};

const $ = selector => document.querySelector(selector);

function versioned(file) {
  const separator = String(file).includes("?") ? "&" : "?";
  return `${file}${separator}v=${encodeURIComponent(DATA_VERSION)}`;
}

async function fetchJson(file) {
  const response = await fetch(versioned(file), { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${file}`);
  return response.json();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function showScreen(name) {
  document.body.dataset.screen = name;
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.toggle("active", screen.id === `screen-${name}`);
  });
  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.toggle("active", button.dataset.screen === name);
  });
  if (name !== "texts") pauseTextAudio();
  if (name === "cards") setCardsView("setup", { scroll: false });
  if (name === "texts") setTextView("directory", { scroll: false });
  window.scrollTo({ top: 0, left: 0 });
}

function setCardsView(view, options = {}) {
  const validViews = new Set(["setup", "session", "list", "detail"]);
  state.cardsView = validViews.has(view) ? view : "setup";
  document.querySelectorAll(".cards-view").forEach(item => {
    item.classList.toggle("active", item.id === `cards-${state.cardsView}-view`);
  });
  if (options.scroll !== false) window.scrollTo({ top: 0, left: 0 });
}

function setTextView(view, options = {}) {
  state.textView = view === "reader" ? "reader" : "directory";
  document.querySelectorAll(".text-view").forEach(item => {
    item.classList.toggle("active", item.id === `text-${state.textView}-view`);
  });
  if (state.textView !== "reader") pauseTextAudio();
  if (options.scroll !== false) window.scrollTo({ top: 0, left: 0 });
}

function cardsForDeck(deck) {
  return deck?.cards || [];
}

function selectedDeckMeta() {
  return state.catalog?.decks?.find(deck => deck.id === state.activeDeckId) || null;
}

function getActiveText() {
  return state.activeDeck?.texts?.[state.activeTextIndex] || null;
}

function getSessionCards() {
  return state.studyCards.length ? state.studyCards : state.cards;
}

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function sourceHtml(sourceRefs = []) {
  if (!sourceRefs.length) return "";
  return sourceRefs
    .map(ref => `<div>Source: <code>${escapeHtml(ref)}</code></div>`)
    .join("");
}

function renderAppChrome() {
  const catalog = state.catalog || {};
  $("#app-title").textContent = catalog.title || "Agentic Study Cards";
  $("#app-subtitle").textContent = catalog.subtitle || "Source-backed study decks maintained by agents.";
}

function renderLibrary() {
  const grid = $("#deck-grid");
  const decks = state.catalog?.decks || [];
  $("#library-count").textContent = `${decks.length} deck${decks.length === 1 ? "" : "s"}`;
  grid.innerHTML = decks.map(deck => {
    const active = deck.id === state.activeDeckId ? " active" : "";
    const stats = state.decks.find(item => item.id === deck.id);
    const cardCount = cardsForDeck(stats).length;
    const textCount = stats?.texts?.length || 0;
    return `
      <button class="deck-card${active}" type="button" data-deck-id="${escapeHtml(deck.id)}">
        <p class="eyebrow">${escapeHtml(deck.domain || "custom")}</p>
        <h3>${escapeHtml(deck.title || deck.id)}</h3>
        <p>${escapeHtml(deck.description || "")}</p>
        <div class="chip-row">
          <span class="chip">${cardCount} cards</span>
          <span class="chip">${textCount} texts</span>
        </div>
      </button>
    `;
  }).join("");
}

function renderThemes() {
  const row = $("#theme-row");
  if (!row) return;
  row.innerHTML = THEMES.map(theme => `
    <button class="theme-button ${state.theme === theme.id ? "active" : ""}" type="button" data-theme-id="${theme.id}">
      ${escapeHtml(theme.label)}
    </button>
  `).join("");
}

function setTheme(themeId) {
  state.theme = THEMES.some(theme => theme.id === themeId) ? themeId : "day";
  document.body.dataset.theme = state.theme;
  localStorage.setItem("agentic-study-cards-theme", state.theme);
  renderThemes();
}

function loadTheme() {
  setTheme(localStorage.getItem("agentic-study-cards-theme") || "day");
}

function setActiveDeck(deckId) {
  const deck = state.decks.find(item => item.id === deckId) || state.decks[0];
  if (!deck) return;
  state.activeDeckId = deck.id;
  state.activeDeck = deck;
  state.cards = cardsForDeck(deck);
  state.filteredCards = [...state.cards];
  state.studyCards = [];
  state.activeCardIndex = 0;
  state.activeDetailIndex = 0;
  state.activeTextIndex = 0;
  state.flipped = false;
  const searchInput = $("#card-search");
  if (searchInput) searchInput.value = "";
  pauseTextAudio();
  renderLibrary();
  renderCards();
  renderTexts();
}

function filterCards() {
  const query = normalize($("#card-search").value);
  state.filteredCards = state.cards.filter(card => {
    if (!query) return true;
    const haystack = normalize([
      card.front,
      card.back,
      card.detail,
      ...(card.tags || []),
      ...(card.sourceRefs || []),
      JSON.stringify(card)
    ].filter(Boolean).join(" "));
    return haystack.includes(query);
  });
  if (state.activeDetailIndex >= state.filteredCards.length) state.activeDetailIndex = 0;
  renderCards();
}

function renderBatchButtons() {
  document.querySelectorAll(".batch-button").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.batch) === state.batchSize);
  });
}

function renderCards() {
  const deck = state.activeDeck;
  const meta = selectedDeckMeta();
  const cards = getSessionCards();
  const card = cards[state.activeCardIndex] || null;
  $("#cards-domain").textContent = meta?.domain || deck?.domain || "Cards";
  $("#cards-title").textContent = deck?.title || "Study";
  $("#setup-card-count").textContent = `${state.cards.length} card${state.cards.length === 1 ? "" : "s"}`;
  $("#cards-progress").textContent = cards.length ? `${state.activeCardIndex + 1} / ${cards.length}` : "0 / 0";
  $("#card-nav-counter").textContent = cards.length ? `${state.activeCardIndex + 1} / ${cards.length}` : "0 / 0";
  $("#match-count").textContent = `${state.filteredCards.length} match${state.filteredCards.length === 1 ? "" : "es"}`;
  $("#study-card").classList.toggle("flipped", state.flipped);
  $("#start-study-button").disabled = !state.cards.length;

  if (!card) {
    $("#card-kicker").textContent = "No cards";
    $("#card-front").textContent = "No cards match this search.";
    $("#card-back").textContent = "";
    $("#card-detail").textContent = "";
    $("#card-tags").innerHTML = "";
    $("#card-sources").innerHTML = "";
    $("#card-audio-button").disabled = true;
    $("#card-audio-button").style.display = "none";
  } else {
    $("#card-kicker").textContent = card.kind || "Tap to flip";
    $("#card-front").textContent = card.front;
    $("#card-back").textContent = card.back;
    $("#card-detail").textContent = card.detail || "";
    $("#card-tags").innerHTML = (card.tags || [])
      .map(tag => `<span class="chip">${escapeHtml(tag)}</span>`)
      .join("");
    $("#card-sources").innerHTML = sourceHtml(card.sourceRefs);
    $("#card-audio-button").disabled = !card.audio?.file;
    $("#card-audio-button").style.display = card.audio?.file ? "inline-flex" : "none";
  }

  $("#card-list").innerHTML = state.filteredCards.map((item, index) => `
    <button class="compact-item${index === state.activeDetailIndex ? " active" : ""}" type="button" data-card-index="${index}">
      <strong>${escapeHtml(item.front)}</strong>
      <span>${escapeHtml(item.back)}</span>
    </button>
  `).join("");
  renderBatchButtons();
  renderCardDetail();
}

function setBatchSize(size) {
  state.batchSize = Number(size) || 0;
  renderBatchButtons();
}

function startCardSession() {
  if (!state.cards.length) return;
  const limit = state.batchSize > 0 ? state.batchSize : state.cards.length;
  state.studyCards = shuffle(state.cards).slice(0, limit);
  state.activeCardIndex = 0;
  state.flipped = false;
  renderCards();
  setCardsView("session");
}

function openCardDetail(index) {
  if (index < 0 || index >= state.filteredCards.length) return;
  state.activeDetailIndex = index;
  renderCards();
  setCardsView("detail");
}

function moveCard(delta) {
  const cards = getSessionCards();
  if (!cards.length) return;
  const total = cards.length;
  state.activeCardIndex = (state.activeCardIndex + delta + total) % total;
  state.flipped = false;
  renderCards();
}

function playCardAudio() {
  const card = getSessionCards()[state.activeCardIndex];
  if (!card?.audio?.file) return;
  const audio = new Audio(card.audio.file);
  audio.play().catch(() => showToast("Card audio could not be played."));
}

const BASE_CARD_FIELDS = new Set(["id", "front", "back", "detail", "tags", "sourceRefs", "audio"]);

function valueHtml(value) {
  if (value === undefined || value === null || value === "") return "<p>Not provided</p>";
  if (Array.isArray(value)) {
    if (!value.length) return "<p>Not provided</p>";
    return `<ul>${value.map(item => `<li>${escapeHtml(typeof item === "object" ? JSON.stringify(item) : item)}</li>`).join("")}</ul>`;
  }
  if (typeof value === "object") {
    return `<pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
  }
  return `<p>${escapeHtml(value)}</p>`;
}

function detailRow(label, value) {
  return `
    <section class="detail-row">
      <h4>${escapeHtml(label)}</h4>
      ${valueHtml(value)}
    </section>
  `;
}

function renderCardDetail() {
  const panel = $("#card-detail-panel");
  if (!panel) return;
  const card = state.filteredCards[state.activeDetailIndex] || null;
  $("#card-detail-progress").textContent = state.filteredCards.length
    ? `${state.activeDetailIndex + 1} / ${state.filteredCards.length}`
    : "0 / 0";
  if (!card) {
    panel.innerHTML = `<p class="empty-state">No card matches this search.</p>`;
    return;
  }

  const extraRows = Object.entries(card)
    .filter(([key]) => !BASE_CARD_FIELDS.has(key))
    .map(([key, value]) => detailRow(key, value))
    .join("");
  const audioRows = card.audio ? detailRow("Audio", card.audio) : "";

  panel.innerHTML = `
    <div class="detail-hero">
      <p class="eyebrow">${escapeHtml(card.kind || state.activeDeck?.domain || "Card")}</p>
      <h3>${escapeHtml(card.front)}</h3>
      <p>${escapeHtml(card.back)}</p>
    </div>
    ${detailRow("Detail", card.detail)}
    ${detailRow("Tags", card.tags || [])}
    ${detailRow("Sources", card.sourceRefs || [])}
    ${audioRows}
    ${extraRows ? `<div class="detail-extra">${extraRows}</div>` : ""}
  `;
}

function setTextRate(rate) {
  state.textRate = rate;
  if (state.textAudio) state.textAudio.playbackRate = rate;
  const speedButton = $("#text-speed-button");
  if (speedButton) speedButton.textContent = formatTextRate(rate);
  document.querySelectorAll(".rate-button").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.rate) === rate);
  });
  closeTextSpeedMenu();
}

function formatTextRate(rate = state.textRate) {
  return Number.isInteger(rate) ? `${rate}.0x` : `${rate}x`;
}

function toggleTextSpeedMenu(event) {
  if (event) event.stopPropagation();
  const menu = $("#text-speed-menu");
  const trigger = $("#text-speed-button");
  if (!menu || !trigger) return;
  const willOpen = !menu.classList.contains("show");
  menu.classList.toggle("show", willOpen);
  trigger.setAttribute("aria-expanded", String(willOpen));
}

function closeTextSpeedMenu() {
  const menu = $("#text-speed-menu");
  const trigger = $("#text-speed-button");
  if (menu) menu.classList.remove("show");
  if (trigger) trigger.setAttribute("aria-expanded", "false");
}

function renderTexts() {
  const texts = state.activeDeck?.texts || [];
  const text = getActiveText();
  $("#texts-title").textContent = state.activeDeck?.title || "Reading and Listening";
  $("#texts-count").textContent = `${texts.length} text${texts.length === 1 ? "" : "s"}`;
  $("#text-list").innerHTML = texts.map((item, index) => `
    <button class="compact-item${index === state.activeTextIndex ? " active" : ""}" type="button" data-text-index="${index}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.audio?.kind ? `${item.audio.kind} audio` : "no audio file")}</span>
    </button>
  `).join("");

  if (!text) {
    $("#text-source").textContent = "No text selected";
    $("#text-title").textContent = "Choose a text";
    $("#text-audio-kind").textContent = "No audio";
    $("#text-body").textContent = "";
    $("#text-translation").textContent = "";
    $("#text-sources").innerHTML = "";
    $("#text-play-button").disabled = true;
    return;
  }

  const audioLabel = text.audio?.kind ? `${text.audio.kind} audio` : "speech preview";
  $("#text-source").textContent = text.source || state.activeDeck?.source || "Source-backed text";
  $("#text-title").textContent = text.title;
  $("#text-audio-kind").textContent = audioLabel;
  $("#text-body").textContent = text.body;
  $("#text-translation").textContent = text.translation || text.explanation || "";
  $("#text-sources").innerHTML = sourceHtml(text.sourceRefs);
  $("#text-play-button").disabled = false;
  $("#text-play-button").textContent = state.speaking || (state.textAudio && !state.textAudio.paused) ? "Pause" : "Play";
  $("#text-repeat-button").classList.toggle("active", state.repeatText);
  $("#text-repeat-button").setAttribute("aria-pressed", String(state.repeatText));
}

function selectText(index) {
  if (!state.activeDeck?.texts?.[index]) return;
  pauseTextAudio();
  state.activeTextIndex = index;
  renderTexts();
  setTextView("reader");
}

function pauseTextAudio() {
  if (state.textAudio) {
    state.textAudio.pause();
    state.textAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  state.speaking = false;
  const playButton = $("#text-play-button");
  if (playButton) playButton.textContent = "Play";
}

function speakText(text) {
  if (!window.speechSynthesis) {
    showToast("No audio file and browser speech is unavailable.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text.body);
  utterance.lang = text.speechLang || SPEECH_LANG_BY_DOMAIN[state.activeDeck?.domain] || "en-US";
  utterance.rate = state.textRate;
  utterance.onend = () => {
    state.speaking = false;
    if (state.repeatText) {
      setTimeout(() => speakText(text), 120);
    } else {
      renderTexts();
    }
  };
  state.speaking = true;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  renderTexts();
}

function toggleTextAudio() {
  const text = getActiveText();
  if (!text) return;

  if (state.textAudio && !state.textAudio.paused) {
    pauseTextAudio();
    renderTexts();
    return;
  }
  if (state.speaking) {
    pauseTextAudio();
    renderTexts();
    return;
  }

  if (text.audio?.file) {
    state.textAudio = new Audio(text.audio.file);
    state.textAudio.playbackRate = state.textRate;
    state.textAudio.loop = state.repeatText;
    state.textAudio.addEventListener("ended", renderTexts);
    state.textAudio.play()
      .then(renderTexts)
      .catch(() => {
        pauseTextAudio();
        showToast("Audio file could not be played. Trying browser speech.");
        speakText(text);
      });
    return;
  }

  speakText(text);
}

function toggleRepeatText() {
  state.repeatText = !state.repeatText;
  if (state.textAudio) state.textAudio.loop = state.repeatText;
  renderTexts();
}

async function loadAll() {
  pauseTextAudio();
  state.catalog = await fetchJson(CATALOG_FILE);
  state.decks = await Promise.all((state.catalog.decks || []).map(async deck => {
    const data = await fetchJson(deck.file);
    return { ...data, id: data.id || deck.id, domain: data.domain || deck.domain };
  }));
  renderAppChrome();
  setActiveDeck(state.activeDeckId || state.decks[0]?.id);
}

function bindEvents() {
  $("#refresh-button").addEventListener("click", () => {
    loadAll().then(() => showToast("Content reloaded.")).catch(error => showToast(error.message));
  });
  $("#deck-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-deck-id]");
    if (!button) return;
    setActiveDeck(button.dataset.deckId);
    showScreen("cards");
  });
  $(".bottom-nav").addEventListener("click", event => {
    const button = event.target.closest("[data-screen]");
    if (button) showScreen(button.dataset.screen);
  });
  $("#study-card").addEventListener("click", () => {
    state.flipped = !state.flipped;
    renderCards();
  });
  $("#prev-card").addEventListener("click", () => moveCard(-1));
  $("#next-card").addEventListener("click", () => moveCard(1));
  $("#start-study-button").addEventListener("click", startCardSession);
  $("#view-all-cards").addEventListener("click", () => setCardsView("list"));
  $("#back-to-card-setup").addEventListener("click", () => setCardsView("setup"));
  $("#back-to-card-setup-from-list").addEventListener("click", () => setCardsView("setup"));
  $("#back-to-card-list").addEventListener("click", () => setCardsView("list"));
  $("#batch-row").addEventListener("click", event => {
    const button = event.target.closest("[data-batch]");
    if (button) setBatchSize(Number(button.dataset.batch));
  });
  $("#card-search").addEventListener("input", filterCards);
  $("#card-audio-button").addEventListener("click", event => {
    event.stopPropagation();
    playCardAudio();
  });
  $("#card-list").addEventListener("click", event => {
    const button = event.target.closest("[data-card-index]");
    if (button) openCardDetail(Number(button.dataset.cardIndex));
  });
  $("#text-list").addEventListener("click", event => {
    const button = event.target.closest("[data-text-index]");
    if (button) selectText(Number(button.dataset.textIndex));
  });
  $("#back-to-texts").addEventListener("click", () => setTextView("directory"));
  $("#text-play-button").addEventListener("click", toggleTextAudio);
  $("#text-repeat-button").addEventListener("click", toggleRepeatText);
  $("#text-speed-button").addEventListener("click", toggleTextSpeedMenu);
  document.querySelectorAll(".rate-button").forEach(button => {
    button.addEventListener("click", () => setTextRate(Number(button.dataset.rate)));
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".speed-menu-wrap")) closeTextSpeedMenu();
  });
  $("#theme-row").addEventListener("click", event => {
    const button = event.target.closest("[data-theme-id]");
    if (button) setTheme(button.dataset.themeId);
  });
  document.addEventListener("keydown", event => {
    if (!$("#screen-cards").classList.contains("active")) return;
    if (state.cardsView !== "session") return;
    if (event.key === "ArrowLeft") moveCard(-1);
    if (event.key === "ArrowRight") moveCard(1);
    if (event.key === " ") {
      event.preventDefault();
      state.flipped = !state.flipped;
      renderCards();
    }
  });
}

loadTheme();
bindEvents();
loadAll().catch(error => {
  renderAppChrome();
  showToast(error.message);
});
