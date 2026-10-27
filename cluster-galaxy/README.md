# Cluster Galaxy

**A story-driven AI clustering adventure for UK school Years 3–4 (ages 7–9).** Five missions teach features, rule-based sorting, free-form clustering, model training, testing on unseen examples, and improvement through experiments.

This is a static React + Vite game. It has no backend, accounts, API keys, remote data calls, or required external assets. The alien art is drawn with reusable inline SVG, and localStorage is used only for local mission-completion progress.

## Run locally

Requirements: Node.js 20 or newer recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To make a production build:

```bash
npm run build
npm run preview
```

Vite writes the deployable site to `dist/`.

## GitHub Pages

The Vite base is `./`, so built assets use relative URLs and can be hosted at the site root or beneath a repository path. Keep your existing GitHub Actions workflow; this package intentionally does not replace or add a workflow. Ensure the workflow installs dependencies, runs `npm run build`, and publishes the `dist/` directory.

## The five missions

1. **First Contact** — scan alien features and find matching body shapes.
2. **The Great Space Sort** — sort the same specimens by a chosen rule, then try another rule.
3. **Mystery of the Tribes** — freely create, rename, and populate groups without predefined labels.
4. **Train, Test & Improve** — configure a deterministic categorical k-modes clustering simulation; test separate unseen aliens; compare and retrain.
5. **Chief Galaxy Scientist** — repeat the complete process with a new training population and a separate test collection, then submit a field report and print a certificate.

## Model notes

The training module uses deterministic farthest-first initialisation and a small categorical k-modes implementation in `src/cluster.js`. The model uses only the selected features. Test specimens are maintained separately from each training collection and are assigned to the nearest learned mode; they do not update the model. Match descriptions are based on the number of selected features that differ, not a made-up accuracy score. Cluster numbers are labels, not ground-truth classes.

## Project map

- `src/App.jsx` — game shell, storyline, missions and UI.
- `src/styles.css` — custom space-adventure design system, responsive layouts, animations and print certificate.
- `src/data/aliens.js` — stable alien IDs, feature data and level populations.
- `src/cluster.js` — clustering model and unseen-specimen prediction.
- `vite.config.js` — relative base path for static hosting.

## Progress

Completed mission IDs are saved in this browser on this device. The map has a **Reset progress** action. No player name is collected or saved unless a child types one into the final certificate; that name is only held in the current page state and is not sent anywhere.

## Accessibility and classroom use

- Large buttons and touch-friendly click-to-select alternatives complement drag-and-drop.
- Instructions and a science explanation are available throughout a mission.
- Text labels accompany feature colours and group colours.
- The certificate has a print stylesheet.
- Reduced-motion preferences are respected.
- Sound is not required to play or understand the game.
