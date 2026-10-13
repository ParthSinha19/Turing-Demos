# Robot Detective — The Learning Lab

A browser-based machine-learning mystery game for school-age learners. Players invent categories, label fictional creatures, train a real classifier, inspect predictions, and compare models on a fixed held-out test set. No backend, accounts, or AI API calls are required.

## What is implemented

- **Real classifiers:** a categorical decision tree (greedy Gini-impurity splits) and a 3-nearest-neighbour classifier (Hamming distance over eight explicit categorical features).
- **Explicit model lifecycle:** dataset edits increment a version and mark a trained model stale; inference is disabled until the user retrains. Each successful model stores a snapshot of its training examples and categories.
- **Held-out evaluation:** a fixed 12-creature test set is separate from editable training examples. Metrics record model and test-set versions; a confusion matrix and per-category scores are shown.
- **Hands-on UX:** six mission briefs, 40 generated creature designs, an SVG creature creator, custom categories, relabelling/removal, diagnostics for sparse classes and conflicting labels, prediction evidence, nearest-neighbour examples / tree paths, field notes, local persistence, reset confirmation, responsive layouts, keyboard focus states, and reduced-motion support.
- **Local-first:** progress is stored in browser localStorage when available. No personal details are requested.

## Quick start

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Vite prints the local URL. Open it in a browser. Your progress is stored on that browser/device.

## Test and benchmark

```bash
npm test
npm run bench
npm run build
```

The tests cover feature distance, learning from labels, decision-tree splits, conflicting labels, empty training data, evaluation versioning, and exclusion of creature IDs/names from inference. The benchmark runs nine deterministic synthetic scenarios: separable classes, sparse examples, one-feature lookalikes, conflicting labels, class imbalance, unseen feature combinations, irrelevant-feature variation, dataset modification before/after retraining, and repeatability. Scores are printed from actual held-out predictions; these are scenario-specific observations, not a broad claim about which classifier is universally better.

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In `vite.config.ts`, the Pages base is `/robot-detective/` when `GITHUB_PAGES=true`. If your repository has a different name, change that base to `/<repo-name>/` or use a configurable environment variable.
3. Add a GitHub Actions workflow that runs `npm install`, `npm run build` with `GITHUB_PAGES=true`, and publishes `dist/` using GitHub Pages Actions.
4. In repository Settings → Pages, select GitHub Actions as the deployment source.

A ready-to-use workflow is included in `.github/workflows/pages.yml`. It deploys the repository named `robot-detective`; update the Vite base if you rename the repository.

## Architecture

```text
src/
  App.tsx                  Product UI and explicit user interactions
  components/CreatureArt   SVG renderer (visuals only)
  data/creatures.ts        Feature vocabulary, curated collection, fixed test set
  ml/types.ts              Domain types and versioned model/evaluation contracts
  ml/classifiers.ts        Decision tree and nearest-neighbour implementations
  ml/evaluation.ts         Accuracy, per-class metrics, confusion matrix
  ml/benchmark.ts          Nine-scenario deterministic benchmark suite
  styles.css               Responsive design and accessibility affordances
tests/
  classifiers.test.ts      Classifier and evaluation tests
```

### Feature representation

Each creature exposes exactly eight categorical features: colour, eye count, antennae count, horns, tail, pattern, body shape, and limb count. The renderer is not imported by the classifier. IDs, names, illustration markup, and category display names are not features. Identical feature vectors therefore receive identical classifier inputs, even if creature identities differ.

### Algorithms

- **Nearest neighbour:** categorical Hamming distance (number of mismatched features), a `k=3` nearest-neighbour cutoff (including ties at the cutoff), inverse-distance weighted votes; exact matches receive extra weight. Displayed vote shares are descriptive, not calibrated probabilities.
- **Decision tree:** recursively chooses the feature with the greatest Gini-impurity reduction, stopping when a node is pure, no positive split remains, no features remain, or depth reaches the number of features. Unseen feature values stop at the current node and use that node's majority label.

Both classifiers are deterministic for a fixed input ordering and dataset. Ties are resolved by category ID ordering. Contradictory labels are retained; the UI surfaces conflicting identical feature patterns rather than silently correcting them.

### Evaluation honesty

The fixed test set is held apart from training examples. The UI reports the test-set version and model version with each result. Accuracy is `correct / total`; per-category results and confusion matrix use reference-label rows and predicted-label columns. A small test set is noisy and cannot guarantee performance on future creatures. If a category is deleted, evaluation filters out its test examples rather than attempting to score a missing class.

## Current limitations / next engineering steps

- The starter labels and held-out reference labels are curated teaching data, not a real-world dataset. The benchmark suite is synthetic and educational rather than representative of a real deployment dataset. Recorded scenario results and interpretation are in [`docs/benchmark-results.md`](docs/benchmark-results.md). Add randomized seeds, more repeated trials, and statistical summaries before making broad comparative model claims.
- The starter catalogue is deterministic and varied but not generated from a hidden semantic classification rule. Learners create the label semantics themselves.
- Progress is device-local; there are no accounts or cloud sync. Export/import and IndexedDB are possible follow-ups.
- Browser localStorage is synchronous and has a practical size limit. If progress grows significantly, migrate to IndexedDB.
- Mission briefs are available as guided case cards. The first three missions are usable as open-ended activities, but automatic mission-specific success validation is intentionally not faked.
- For a school release, add a broader accessibility audit and test on actual tablets and browsers.

## Privacy

The MVP makes no network requests for inference and asks for no student identity. Google Fonts are optional styling imports; remove the `@import` line in `src/styles.css` for a fully offline/no-third-party-font deployment.
