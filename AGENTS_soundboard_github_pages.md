# AGENTS.md — GitHub Pages Soundboard (Manifest-Driven)

Use this file as the **build prompt / implementation guide** for GPT Codex, Codex CLI, or another coding agent to create a **single-page soundboard web app** hosted on **GitHub Pages**, with **GitHub Actions** used to deploy the site.

The soundboard must preserve the **look, feel, UI polish, and presentation DNA** from the attached generic style template, while adapting it to a **soundboard** rather than a game.

---

## Project goal

Build a **single-page HTML soundboard app** using only:

- `index.html`
- `style.css`
- `script.js`

Optional additional static files:
- category `manifest.json` files
- `.mp3` files
- optional image/icon assets
- `.github/workflows/deploy.yml`
- `README.md`

The app will be hosted on **GitHub Pages**.

The app must allow the user to:

1. land on a category selection screen
2. choose a category
3. load the list of sounds for that category from a `manifest.json`
4. render one button/card per sound clip
5. press a sound to play it
6. interrupt the currently playing sound if another one is pressed
7. navigate back to categories and switch freely

---

## Hosting and deployment requirements

This project must work as a **static site** on GitHub Pages.

### Required hosting assumptions
- No backend
- No database
- No server-side code
- No bundler required
- No Node dependency required for the app itself unless only used for tooling
- The actual site should run as plain static files in the browser

### Deployment requirements
Create a **GitHub Actions workflow** that deploys the static site to GitHub Pages.

Preferred approach:
- use the official Pages workflow approach
- deploy from the repository automatically on push to the default branch

The workflow should:
- check out the repo
- configure Pages
- upload the site artifact
- deploy it

Keep the workflow simple and production-appropriate for a static site.

---

## Content structure

Use a folder structure like this:

```text
/
  index.html
  style.css
  script.js
  README.md
  /sounds
    /meme
      manifest.json
      sound1.mp3
      sound2.mp3
    /laugh
      manifest.json
      sound1.mp3
      sound2.mp3
    /fart
      manifest.json
      sound1.mp3
      sound2.mp3
    /other
      manifest.json
      sound1.mp3
      sound2.mp3
  /.github
    /workflows
      deploy.yml
```

### Categories
The app must support these categories:

- meme
- laugh
- fart
- other

The app should be structured so more categories can be added later with minimal changes.

---

## Manifest format

Each category folder contains a `manifest.json`.

Use a format like:

```json
[
  { "name": "Airhorn", "file": "airhorn.mp3" },
  { "name": "Bruh", "file": "bruh.mp3" }
]
```

### Manifest rules
- `name`: display label for the sound button
- `file`: filename relative to that category folder
- optional future-friendly fields may be supported such as:
  - `emoji`
  - `color`
  - `description`

The app should function correctly with just `name` and `file`.

---

## Functional requirements

### Core behaviour
- Show a category selection view first
- On selecting a category:
  - fetch that category's `manifest.json`
  - render the sound buttons dynamically
- On clicking/tapping a sound:
  - stop any currently playing audio
  - reset that audio
  - start the newly selected audio
- Only one clip can play at a time
- Pressing the same or another sound while one is playing should interrupt the first immediately
- The UI should show some visible “now playing” state

### Navigation
- Include a clear way to return to the category screen
- Switching category should stop any sound that is currently playing
- The URL may optionally support hash routing such as `#meme`, but keep it lightweight

### Error handling
- If a manifest fails to load:
  - show a friendly error message in the UI
- If a sound file fails to play:
  - show a visible non-technical message
- If a category has an empty manifest:
  - show an empty-state panel rather than a broken layout

### Performance / usability
- Fast initial load
- Touch-friendly on mobile/tablet
- Responsive layout for desktop and phone
- Buttons must be easy to press
- Avoid tiny text or cramped controls

---

## Style and feel requirements

Use the attached style template as the **visual and UX source of truth**.

Adapt its design language to a soundboard app:

- playful
- polished
- colourful
- readable
- premium-feeling
- slightly cheeky / humorous
- dark-base background with bright accents
- rounded panels and buttons
- strong visual hierarchy
- responsive and mobile-friendly
- animated and lively without becoming messy

### The soundboard should feel like:
- a premium arcade-style meme console
- polished and fun immediately
- visually satisfying even though gameplay is replaced by sound interaction

### Preserve from the style template
- bright readable visuals on darker backgrounds
- rounded corners
- layered cards/panels
- gradient accents
- subtle glow
- polished transitions
- oversized readable UI
- playful energy
- humorous personality in labels and flavour text

### Avoid
- plain corporate dashboard styling
- tiny utility-style buttons
- dull file-list appearance
- cluttered noisy layout
- harsh realism
- bland placeholder UI

---

## UI / UX requirements

### Landing / category view
The first screen should present the four categories as large polished cards or buttons.

Each category card/button should:
- be large and touch-friendly
- have a fun icon, emoji, or visual accent
- clearly indicate it is selectable
- animate subtly on hover/press where supported

Possible examples:
- Meme
- Laugh
- Fart
- Other

### Category page
Once inside a category:
- show a polished category header
- show a back button
- show a grid of sound buttons/cards
- show a “now playing” area or status chip
- optionally show the count of available clips

### Sound buttons
Each sound should appear as a large button or card with:
- sound name
- optional emoji/icon
- clear pressed/active state
- visual feedback when playing

### States
Include visible styles for:
- idle
- hover
- active/pressed
- playing
- loading
- error
- empty

---

## Juice / feedback requirements

Even though this is not a game, preserve the “juicy” feel from the style template.

Include tasteful feedback such as:
- animated button press state
- subtle pulse/glow for the currently playing sound
- smooth transitions when entering categories
- lightweight status changes for loading / playing / stopped
- maybe a tiny equalizer-style accent or waveform pulse while audio is playing
- polished hover/tap feedback

Do not overdo effects such that the UI becomes distracting.

---

## Technical implementation rules

### Tech stack
Use only:
- HTML
- CSS
- JavaScript

No frameworks.

### Audio handling
Use the browser audio APIs in a simple robust way.

Implementation requirements:
- keep a single active `Audio` instance, or equivalent controlled playback approach
- when a new sound is triggered:
  - pause old audio
  - reset old audio time to 0
  - start the new clip
- handle end-of-playback to clear the playing state

### File loading
Do not attempt to scan directories at runtime.

The app must load sound lists through `manifest.json` files.

### Code organisation
Keep code clear and maintainable:
- `index.html` for structure
- `style.css` for presentation
- `script.js` for logic

The JavaScript should be modular enough to extend later.

Suggested responsibilities:
- app state
- category loading
- manifest fetch logic
- render functions
- audio playback control
- UI state updates
- error handling

---

## Accessibility and robustness

Include sensible accessibility support:
- semantic buttons
- clear focus states
- keyboard usable where reasonable
- good contrast
- readable font sizing
- avoid relying only on color to indicate state

The app should degrade gracefully if:
- audio autoplay policies require a user gesture
- one file is missing
- a manifest is malformed

---

## Optional enhancements

If time and simplicity allow, include some of these:
- search/filter within a category
- random sound button
- replay button
- stop button
- hash-based deep linking to categories
- favorite/pin sounds stored in `localStorage`
- theme accent per category
- preload next/most-used sounds lightly
- tiny sound duration display if easy to obtain
- animated “Now Playing” marquee or badge

Keep optional features lightweight. The core experience matters more.

---

## README requirements

Create a concise `README.md` that explains:
- what the project is
- folder structure
- how manifests work
- how to add new sounds
- how GitHub Pages deployment works
- any repo settings needed for Pages

Include a short “Adding a sound” section:
1. place mp3 into the category folder
2. add an entry to that category's `manifest.json`
3. commit and push
4. GitHub Actions deploys the updated site

---

## GitHub Pages / Actions expectations

The agent should produce a workflow that is appropriate for static site deployment to GitHub Pages.

Also document any one-time repo setup needed, such as:
- enabling Pages
- selecting GitHub Actions as the source if required by the current Pages setup
- ensuring the workflow has permissions needed to deploy Pages

Do not overcomplicate the deployment.

---

## Quality bar

The result should feel like:
- immediately usable
- attractive on first load
- playful and polished
- clear and responsive
- easy to extend
- suitable for desktop and mobile
- production-clean for a small static app

This should not feel like a raw prototype or plain file explorer.

---

## Deliverables

Generate:

- `index.html`
- `style.css`
- `script.js`
- sample `manifest.json` files for each category
- `README.md`
- `.github/workflows/deploy.yml`

Optionally include:
- a few placeholder/example entries in manifests
- comments showing where the user will add real mp3 names

Do not generate fake binary mp3 files.

---

## Build instruction to agent

Create a polished single-page soundboard web app for GitHub Pages using only static files and plain HTML/CSS/JavaScript. Use category-based `manifest.json` files to dynamically load the available mp3 clips for each category. The categories are `meme`, `laugh`, `fart`, and `other`. When a sound is played, any currently playing sound must stop immediately and the new sound must begin. Preserve the attached AGENTS style template’s playful arcade polish, bright-on-dark readability, rounded UI, subtle glow, responsive mobile-friendly layout, and premium-feeling presentation, but adapt it to a soundboard rather than a game. Also create a GitHub Actions workflow that deploys the site to GitHub Pages automatically.
