# COSMIC QUEST

**Build a robot. Explore the galaxy. Discover intelligence.**

A 3D space adventure for UK Years 3–4 (ages 7–9) from the Turing Education collection. The child builds a robot, then travels to five planets and teaches it how AI works. Built with React, Vite, Three.js and React Three Fiber. No backend, no API keys, no external assets: planets, robots and sounds are all generated in code.

| Planet | Mission | Idea | Reward |
|---|---|---|---|
| 🌍 Earth | Welcome to Intelligence | Clues (features), examples, predictions | Robot Scanner |
| 🔴 Mars | The Lost Rover | Planning, obstacles, shortest route | Navigation Module |
| 🟠 Jupiter | The Great Space Rescue | IF/THEN rules, rule order | Decision Module |
| 🪐 Saturn | The Mystery Scanner | Labelled examples, training vs testing, mistakes | Recognition Module |
| 🔵 Neptune | The Unknown Galaxy | k-means clustering (unsupervised) | Discovery Module |
| 🛸 Final | Restore the Galactic Network | Uses all five skills | Certificate |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # checks the game logic (navigation, rules, recogniser, clustering)
npm run build      # outputs dist/
npm run preview
```

Needs Node 18+.

## Deploy to GitHub Pages (inside Turing-Demos)

The build uses `base: './'`, so it works from any sub-folder.

1. Copy this whole folder into the repository as `cosmic-quest/` (do not touch other projects).
2. Open `.github/workflows/deploy.yaml` in the repository and add this step next to the existing build steps (before "Setup Pages"):

```yaml
      - name: Build Cosmic Quest
        run: |
          cd cosmic-quest
          npm ci
          npm run build
          cp -r dist/* .
```

(`deploy-snippet.yaml` in this folder holds the same step.) That follows the pattern already used for `cluster-galaxy` and `the-last-signal`. `package-lock.json` is included so `npm ci` works.

3. Optionally add a card linking to `./cosmic-quest/` on the repository's landing page `index.html`.

The game will be at `https://<user>.github.io/Turing-Demos/cosmic-quest/`.

## How the project is organised

```
src/
  game/       Pure logic, no 3D. save.js (localStorage + validation), nav.js (Mars), rules.js (Jupiter),
              classify.js (Earth + Saturn), cluster.js (Neptune k-means), sound.js, flow.js (screens)
  scenes/     Title, Academy (robot builder), Galaxy (solar system), Robot, Objects, Space, textures
  missions/   One lazily loaded file per mission: Earth, Mars, Jupiter, Saturn, Neptune, Final
  ui/         Shared HUD kit and overlays (rewards, ending, certificate)
tests/        Logic tests (node tests/logic.test.mjs)
```

## Adding or changing a mission

1. Create `src/missions/Name.jsx` exporting `Scene` (3D) and `UI` (HTML). Copy `Jupiter.jsx` as a starting point. Wrap the UI in `<Shell id="name" …>`.
2. Put logic in `src/game/` so it can be tested.
3. Register the loader in `src/missions/index.js`.
4. Add the planet to `STORY` in `src/game/flow.js`, `PLANET_ORDER` and `MODULES` in `src/game/save.js`, and its orbit in `DEFS` in `src/scenes/Galaxy.jsx`.
5. Call `finishMission('name')` when the child succeeds. This saves progress, unlocks the next planet and shows the reward.
6. To change the robot upgrade for a mission, edit the `done.<planet>` parts in `src/scenes/Robot.jsx`.

## Saving, quality and accessibility

- Progress is stored in `localStorage` (key `cosmic-quest-save-v1`) and is validated on load, so corrupt data is safely ignored. "Start again" asks for confirmation.
- 🐢 button: low quality mode (fewer stars, lower resolution). 🔊 mute. 🗣️ read-aloud uses the browser's built-in voice, no external service.
- Large buttons, keyboard support (arrow keys build the Mars plan), reduced-motion support, British English.

## Notes

- Everything is procedural, so there are no licences to track. To use GLB models later, put them in `public/` and load them with drei's `useGLTF` using a relative path.
- The main bundle is about 290 kB gzipped (mostly Three.js); each mission loads only when launched.
