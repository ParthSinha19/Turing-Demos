# Self-Driving Lab

A browser game that teaches the basics of autonomous driving by programming a virtual car with Blockly. Four missions plus a sandbox. Plain HTML, CSS and JavaScript; Blockly is loaded from a CDN (unpkg).

This is a **rule-based driving simulator**, not a trained machine-learning model. Students write the rules; the car follows them. The interface highlights four ideas: perception (sensors), decision-making (rules), control (moving or stopping) and testing (Retry).

## Run locally

Opening `index.html` directly usually works. If your browser blocks anything, serve the folder:

```
cd self-driving-lab
python3 -m http.server 8000   # then open http://localhost:8000
```

An internet connection is needed for Blockly and the web fonts (the fonts fall back gracefully).

## Add to the site

Copy this folder to `turing-demos/self-driving-lab/`. All paths are relative, so it works under a subdirectory on GitHub Pages. Nothing in the repository, including workflows, needs changing.

## Structure

| File | Purpose |
|---|---|
| `js/sim.js` | Core simulation: car, collisions, lights, pedestrians, obstacles, sensors (no DOM) |
| `js/runtime.js` | Runs generated Blockly code a frame at a time; sensors and actions |
| `js/missions.js` | Mission registry (`SDL.MISSIONS`) and sandbox scenario builder |
| `js/blocks.js` | Blockly block definitions, code generators, toolbox |
| `js/render.js` | Canvas drawing: cached town, car, effects |
| `js/app.js` | Interface, saving, game loop |

To add a mission, append an entry to `SDL.MISSIONS` (roads, car start, destination, optional lights/pedestrians/obstacles, allowed blocks, hints, extension check). The engine does not change.

## Notes

- Progress and each workspace are saved in `localStorage` (keys start with `sdl.`). "Reset progress" clears them.
- Runaway loops are prevented: every loop pass waits one frame, and each scenario has a time limit.
- Traffic-light sensing and red-light checks apply to a car travelling right (east), which is how all scenarios start.
