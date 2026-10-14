# Inside the Text Machine

An interactive lab for Years 3–4 (ages 7–9) that shows how AI can generate text one word at a time. Everything runs in the browser: no server, no API keys, no accounts, and no student text leaves the page.

## What students do

Six stages, all optional to complete in order:

1. **Predict** – guess the next word, as a person would.
2. **Learn** – view, edit, add and remove training sentences, then press *Train My Model*.
3. **Context** – compare two prompts and see which words the model looks at.
4. **Choose** – compare *Most Common* with *Different Choices* (three randomness settings).
5. **Generate** – watch text appear word by word (pause, step, finish, stop).
6. **Experiment** – switch between animal and robot sentences, add a sentence, retrain and compare.

A reflection page follows. The right-hand **Inside the Model** panel shows real counts and probabilities from the model.

## The model

A trigram language model written in TypeScript (`src/model/ngram.ts`).

- **Tokenising:** lower-case, keep letters, digits and apostrophes, drop punctuation. Each sentence ends with an end marker.
- **Training:** counts which word follows each 2-word, 1-word and empty context.
- **Probabilities:** observed frequency = `count / total` for that context. These are simple counts, not the scores of a neural network.
- **Backoff:** tries the last 2 words, then the last word, then overall word counts. The UI says which one was used. With no data at all, generation stops and explains why.
- **Most common:** highest count wins; ties go to the alphabetically earlier word.
- **Randomness:** samples from `p^(1/T)` renormalised, with T = 0.5 (more predictable), 1 (balanced), 2 (more varied). Invalid temperatures fall back to most-common.
- **Limits:** it only sees the last two words, so it can write odd or wrong sentences. It is a simplified introduction, not the model behind ChatGPT.

Changing the training sentences marks the model as *needs retraining*; generation is disabled until the student retrains.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (model + bundled data)
npm run build    # type-check and build to dist/
npm run preview  # serve the production build
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository whose default branch is `main`.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually). `.github/workflows/deploy.yml` runs the tests, builds, and publishes `dist/`.

The app is a single page with no client-side routes, so refreshes and direct links work. `vite.config.ts` sets `base: "./"`, so assets load from any Pages path (`https://<user>.github.io/<repo>/`). To use an absolute path instead, build with `VITE_BASE=/<repo>/ npm run build`.

## Project layout

```
src/model/ngram.ts   tokeniser, training, probabilities, backoff, sampling, generation
src/model/*.test.ts  unit tests
src/data.ts          training collections, practice examples, stage text
src/stages.tsx       the six stages, welcome screen and reflection
src/ui.tsx           shared components (frequency bars, context line, banners)
src/App.tsx          layout, navigation, progress, model inspector
```
