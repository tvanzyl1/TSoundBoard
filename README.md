# TSoundBoard

TSoundBoard is a static single-page soundboard built for GitHub Pages. It loads each sound category from a `manifest.json`, renders large touch-friendly sound cards, and plays one clip at a time with a playful arcade-inspired UI.

Sample manifests are included, but no MP3 binaries are committed. Add your own sound files to make the buttons playable.

## Project structure

```text
/
  index.html
  style.css
  script.js
  /sounds
    /meme
      manifest.json
    /laugh
      manifest.json
    /fart
      manifest.json
    /other
      manifest.json
  /.github
    /workflows
      deploy.yml
```

## How manifests work

Each category has its own `manifest.json` in `sounds/<category>/manifest.json`.

Example:

```json
[
  { "name": "Airhorn", "file": "airhorn.mp3", "emoji": "📣", "description": "A dramatic horn blast." },
  { "name": "Bruh", "file": "bruh.mp3" }
]
```

Required fields:

- `name`: display label in the soundboard
- `file`: MP3 filename relative to that category folder

Optional fields:

- `emoji`
- `color`
- `description`

## Adding a sound

1. Place the MP3 into the correct category folder, for example `sounds/meme/airhorn.mp3`.
2. Add a matching entry to that category's `manifest.json`.
3. Commit and push your changes.
4. GitHub Actions deploys the updated site to GitHub Pages.

## Adding a new category

1. Create a new folder under `sounds/`.
2. Add a `manifest.json` in that folder.
3. Add the category metadata in `script.js` inside the `categories` array.

## GitHub Pages deployment

The repository includes `.github/workflows/deploy.yml`, which deploys the static site to GitHub Pages on every push to the default branch.

One-time repository setup:

1. In GitHub, open `Settings -> Pages`.
2. Set the source to `GitHub Actions`.
3. Ensure Actions are allowed to deploy Pages for the repository.

The workflow:

- checks out the repository
- configures GitHub Pages
- uploads the repository root as the Pages artifact
- deploys the site
