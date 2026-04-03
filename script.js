const categories = [
  {
    id: "meme",
    name: "Meme",
    emoji: "📣",
    tagline: "Reaction sounds, sudden chaos, and instant internet energy.",
    accent: "linear-gradient(135deg, #49f2c2, #4b9cff)"
  },
  {
    id: "laugh",
    name: "Laugh",
    emoji: "😂",
    tagline: "Giggles, cackles, and dramatic audience approval on demand.",
    accent: "linear-gradient(135deg, #ffd166, #ff8f5a)"
  },
  {
    id: "fart",
    name: "Fart",
    emoji: "💨",
    tagline: "Pure maturity. Zero apologies. Maximum disruption.",
    accent: "linear-gradient(135deg, #c2ff66, #49f2c2)"
  },
  {
    id: "other",
    name: "Other",
    emoji: "🎛️",
    tagline: "Everything weird, useful, or gloriously uncategorized.",
    accent: "linear-gradient(135deg, #ff6fb7, #9d7dff)"
  }
];

const appState = {
  currentCategory: null,
  sounds: [],
  filteredSounds: [],
  activeAudio: null,
  activeSoundFile: null,
  manifestCache: new Map(),
  searchTerm: ""
};

const categoryView = document.querySelector("#category-view");
const soundView = document.querySelector("#sound-view");
const categoryGrid = document.querySelector("#category-grid");
const soundGrid = document.querySelector("#sound-grid");
const categoryTemplate = document.querySelector("#category-card-template");
const soundTemplate = document.querySelector("#sound-card-template");
const backButton = document.querySelector("#back-button");
const randomButton = document.querySelector("#random-button");
const stopButton = document.querySelector("#stop-button");
const searchInput = document.querySelector("#search-input");
const feedback = document.querySelector("#feedback");
const clipCount = document.querySelector("#clip-count");
const soundHeading = document.querySelector("#sound-heading");
const categoryKicker = document.querySelector("#category-kicker");
const nowPlayingText = document.querySelector("#now-playing-text");
const statusChip = document.querySelector("#status-chip");

function init() {
  renderCategoryCards();
  attachEvents();

  const hashCategory = window.location.hash.replace("#", "").trim();
  if (categories.some((category) => category.id === hashCategory)) {
    openCategory(hashCategory);
  } else {
    showCategoryView();
  }
}

function attachEvents() {
  backButton.addEventListener("click", () => {
    stopAudio();
    appState.currentCategory = null;
    appState.searchTerm = "";
    searchInput.value = "";
    window.location.hash = "";
    showCategoryView();
  });

  randomButton.addEventListener("click", () => {
    if (!appState.filteredSounds.length) {
      showFeedback("No clips available to play right now.", "error");
      return;
    }

    const nextSound = appState.filteredSounds[Math.floor(Math.random() * appState.filteredSounds.length)];
    playSound(nextSound);
  });

  stopButton.addEventListener("click", () => {
    stopAudio();
    clearPlayingState();
    updateStatus("Stopped. Ready for the next noise.", "Idle");
  });

  searchInput.addEventListener("input", (event) => {
    appState.searchTerm = event.target.value.trim().toLowerCase();
    appState.filteredSounds = filterSounds(appState.sounds, appState.searchTerm);
    renderSoundGrid();
  });

  window.addEventListener("hashchange", () => {
    const hashCategory = window.location.hash.replace("#", "").trim();

    if (!hashCategory) {
      stopAudio();
      showCategoryView();
      return;
    }

    if (hashCategory !== appState.currentCategory && categories.some((category) => category.id === hashCategory)) {
      openCategory(hashCategory);
    }
  });
}

function renderCategoryCards() {
  categoryGrid.innerHTML = "";

  categories.forEach((category) => {
    const fragment = categoryTemplate.content.cloneNode(true);
    const button = fragment.querySelector(".category-card");

    button.style.setProperty("--category-accent", category.accent);
    button.querySelector(".category-emoji").textContent = category.emoji;
    button.querySelector(".category-name").textContent = category.name;
    button.querySelector(".category-tagline").textContent = category.tagline;
    button.setAttribute("aria-label", `Open ${category.name} category`);
    button.addEventListener("click", () => openCategory(category.id));

    categoryGrid.appendChild(fragment);
  });
}

async function openCategory(categoryId) {
  const category = categories.find((entry) => entry.id === categoryId);
  if (!category) {
    return;
  }

  stopAudio();
  clearPlayingState();
  appState.currentCategory = categoryId;
  appState.searchTerm = "";
  searchInput.value = "";

  soundHeading.textContent = `${category.name} soundboard`;
  categoryKicker.textContent = `${category.emoji} ${category.name}`;
  document.documentElement.style.setProperty("--category-accent", category.accent);

  showSoundView();
  showFeedback("Loading sound manifest...", "loading");
  clipCount.textContent = "Loading...";
  soundGrid.innerHTML = "";
  updateStatus(`Loading ${category.name} sounds...`, "Loading");

  try {
    const sounds = await loadManifest(categoryId);
    appState.sounds = sounds;
    appState.filteredSounds = filterSounds(sounds, "");
    renderSoundGrid();

    if (!sounds.length) {
      showFeedback("This category is empty for now. Drop in some MP3s and update the manifest to fill it up.", "");
      updateStatus(`No sounds loaded in ${category.name}.`, "Empty");
    } else {
      showFeedback(`Loaded ${sounds.length} clip${sounds.length === 1 ? "" : "s"}. Tap one to start the nonsense.`, "");
      updateStatus(`${category.name} is loaded and ready.`, "Ready");
    }
  } catch (error) {
    appState.sounds = [];
    appState.filteredSounds = [];
    renderSoundGrid();
    showFeedback("Could not load this category right now. Check the manifest file and try again.", "error");
    clipCount.textContent = "Manifest error";
    updateStatus("Manifest failed to load.", "Error", true);
    console.error(error);
  }

  if (window.location.hash !== `#${categoryId}`) {
    window.location.hash = categoryId;
  }
}

async function loadManifest(categoryId) {
  if (appState.manifestCache.has(categoryId)) {
    return appState.manifestCache.get(categoryId);
  }

  const response = await fetch(`sounds/${categoryId}/manifest.json`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Manifest request failed with status ${response.status}`);
  }

  const manifest = await response.json();
  if (!Array.isArray(manifest)) {
    throw new Error("Manifest must be an array");
  }

  const sounds = manifest
    .filter((item) => item && typeof item.name === "string" && typeof item.file === "string")
    .map((item, index) => ({
      name: item.name.trim(),
      file: item.file.trim(),
      emoji: typeof item.emoji === "string" ? item.emoji : "🔊",
      color: typeof item.color === "string" ? item.color : "",
      description:
        typeof item.description === "string" && item.description.trim()
          ? item.description.trim()
          : `Clip ${index + 1} in the ${categoryId} pack.`,
      path: `sounds/${categoryId}/${item.file.trim()}`
    }));

  appState.manifestCache.set(categoryId, sounds);
  return sounds;
}

function renderSoundGrid() {
  soundGrid.innerHTML = "";

  if (!appState.sounds.length) {
    clipCount.textContent = "0 clips";
    soundGrid.innerHTML = `<div class="empty-state">No sounds here yet. Add MP3 files and list them in this category's manifest.</div>`;
    return;
  }

  if (!appState.filteredSounds.length) {
    clipCount.textContent = `${appState.sounds.length} clips`;
    soundGrid.innerHTML = `<div class="empty-state">No sounds match that filter. Try a different search term.</div>`;
    return;
  }

  clipCount.textContent = `${appState.filteredSounds.length} of ${appState.sounds.length} clips`;

  appState.filteredSounds.forEach((sound) => {
    const fragment = soundTemplate.content.cloneNode(true);
    const button = fragment.querySelector(".sound-card");

    button.dataset.file = sound.file;
    if (sound.color) {
      button.style.setProperty("--category-accent", sound.color);
    }

    fragment.querySelector(".sound-emoji").textContent = sound.emoji;
    fragment.querySelector(".sound-name").textContent = sound.name;
    fragment.querySelector(".sound-description").textContent = sound.description;
    button.setAttribute("aria-label", `Play ${sound.name}`);
    button.addEventListener("click", () => playSound(sound));

    soundGrid.appendChild(fragment);
  });
}

async function playSound(sound) {
  try {
    stopAudio();
    clearPlayingState();

    const audio = new Audio(sound.path);
    appState.activeAudio = audio;
    appState.activeSoundFile = sound.file;

    audio.addEventListener("ended", () => {
      if (appState.activeAudio === audio) {
        clearPlayingState();
        appState.activeAudio = null;
        appState.activeSoundFile = null;
        updateStatus(`${sound.name} finished. Queue up the next banger.`, "Idle");
      }
    });

    audio.addEventListener("error", () => {
      if (appState.activeAudio === audio) {
        clearPlayingState();
        appState.activeAudio = null;
        appState.activeSoundFile = null;
        showFeedback("That sound could not be played. Make sure the MP3 exists and the manifest filename matches.", "error");
        updateStatus("Playback error.", "Error", true);
      }
    });

    await audio.play();
    markPlaying(sound.file);
    showFeedback(`Now playing ${sound.name}.`, "");
    updateStatus(`${sound.name} is live.`, "Playing");
  } catch (error) {
    clearPlayingState();
    appState.activeAudio = null;
    appState.activeSoundFile = null;
    showFeedback("Playback was blocked or failed. Try again with a direct click on the sound button.", "error");
    updateStatus("Playback failed.", "Error", true);
    console.error(error);
  }
}

function stopAudio() {
  if (!appState.activeAudio) {
    return;
  }

  appState.activeAudio.pause();
  appState.activeAudio.currentTime = 0;
  appState.activeAudio = null;
  appState.activeSoundFile = null;
}

function clearPlayingState() {
  soundGrid.querySelectorAll(".sound-card.playing").forEach((card) => {
    card.classList.remove("playing");
  });
}

function markPlaying(fileName) {
  soundGrid.querySelectorAll(".sound-card").forEach((card) => {
    card.classList.toggle("playing", card.dataset.file === fileName);
  });
}

function filterSounds(sounds, term) {
  if (!term) {
    return sounds;
  }

  return sounds.filter((sound) => {
    const haystack = `${sound.name} ${sound.description}`.toLowerCase();
    return haystack.includes(term);
  });
}

function showCategoryView() {
  categoryView.hidden = false;
  categoryView.classList.add("active");
  soundView.hidden = true;
  soundView.classList.remove("active");
  showFeedback("", "");
  updateStatus("Nothing yet. Pick a category to begin.", "Idle");
}

function showSoundView() {
  categoryView.hidden = true;
  categoryView.classList.remove("active");
  soundView.hidden = false;
  soundView.classList.add("active");
}

function showFeedback(message, tone) {
  feedback.textContent = message;
  feedback.className = "feedback";

  if (tone === "error") {
    feedback.classList.add("is-error");
  }

  if (tone === "loading") {
    feedback.classList.add("is-loading");
  }
}

function updateStatus(message, chipLabel, isError = false) {
  nowPlayingText.textContent = message;
  statusChip.textContent = chipLabel;
  statusChip.classList.toggle("is-playing", chipLabel === "Playing");
  statusChip.classList.toggle("is-error", isError);
}

init();
