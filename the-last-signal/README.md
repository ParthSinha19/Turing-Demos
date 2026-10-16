# The Last Signal

**A story-driven computing and logic adventure for Years 3–4.** Students guide NOVA, a small exploration robot, through six locations on a failing research island. Their programs and decisions—not pre-scripted animations—determine whether systems are repaired.

## Features

- Six linked chapters: route programming, variables and conditionals, battery classification, debugging, a stateful repair route, and a final transmission sequence.
- A small block-programming interpreter with movement, turns, configurable repeat blocks, collision detection, step tracing, and target detection.
- Genuine Boolean state, property-based rule evaluation, editable debug steps, and state/inventory validation in the final repair challenge.
- Three progressive hints per chapter, optional engineering challenges, revisitable chapters, and teacher preview controls.
- Local progress and reflection persistence using `localStorage`; no account, backend, paid API, or runtime service dependency.
- Responsive layout, keyboard-operable controls, readable status feedback, and reduced-motion support.
- Automated tests for the program interpreter, rule checks, sequence validation, chapter locks, and persistence.

All required artwork is bundled as inline SVG/CSS. The application does not fetch external images or call external APIs.

## Local development

Requirements: Node.js 20.19+ or 22.12+ recommended, and npm.

```bash
npm install
npm run dev
```

Vite serves local development from the root URL, usually `http://localhost:5173/`.

Run the automated tests and production build:

```bash
npm test
npm run build
```

Local development uses the root path on `localhost`. The production build deliberately emits asset URLs for the nested GitHub Pages path, so use `npm run dev` for local work and validate the hosted path after the GitHub Actions deployment.

## GitHub Pages path configuration

The intended public path for this game is:

`/main-repository/the-next-game/`

`vite.config.ts` deliberately uses:

- `/` for `npm run dev`, so local use stays at `http://localhost:5173/`.
- `/main-repository/the-next-game/` for `npm run build`, so scripts and styles resolve when the game is served from the nested Pages path.

The release bundle includes a repository-root workflow that builds the app and places the built files inside a `the-next-game/` subdirectory of the Pages artifact. This suits the `main-repository` project site when the game is served at `/main-repository/the-next-game/`.

### Deploy with GitHub Actions

1. Put this project in the `the-next-game/` folder of your `main-repository` repository.
2. Commit and push the project to GitHub.
3. In **Settings → Pages**, choose **GitHub Actions** as the build and deployment source.
4. From the release bundle, copy `.github/workflows/deploy-pages.yml` to the repository-root `.github/workflows/deploy-pages.yml` (not inside the app folder). The workflow runs tests, builds Vite, and publishes the nested folder.
5. Visit `https://<your-github-username>.github.io/main-repository/the-next-game/` after the workflow succeeds.

If instead you later make `the-next-game` its own GitHub repository, change the production `base` in `vite.config.ts` to `/the-next-game/` and change the workflow to publish `dist/` at the artifact root. For a custom domain served from `/`, use `/` as the production base.

## Progress and classroom use

Progress is saved in the current browser and device. It is not shared across computers and there is no central teacher dashboard. The Teacher Mode panel unlocks locations for local preview/testing. The Reset All Progress button asks for confirmation and clears saved progress for this application.

## Project structure

```text
src/
  chapters/       Reusable chapter activities
  components/     NOVA, illustrations, and UI primitives
  data/           Chapter briefs, objectives, hints, outcomes
  engine/         Grid interpreter and logic evaluators + tests
  state/          localStorage progress and chapter unlock logic + tests
  styles/         Global design system and responsive layouts
  App.tsx         Home, island map, workspace, completion, epilogue
public/assets/    Reserved for additional locally bundled assets
.github/workflows/ GitHub Pages build/deploy workflow
```

## Educational note

The Battery Factory is a deterministic rule-classification activity, not a trained machine-learning model. The UI makes this explicit. Student attempts are evaluated locally against the actual properties of each object.
