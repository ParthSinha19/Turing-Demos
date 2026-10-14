# Machine Learning Lab

A static, browser-only learning lab for Years 3–4. Children can explore a small fruit dataset and a locally stored copy of the Iris flower dataset, then try real classification and clustering algorithms.

## Run locally

No Python server, database, API key, or install step is required. From this folder, run a local static server so the browser can load `datasets/iris.csv`:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

Opening `index.html` directly with `file://` is not recommended because browsers usually block CSV fetches from local files.

## Deploy to GitHub Pages

1. Commit the complete project folder to a repository.
2. In GitHub, open **Settings → Pages**.
3. Select **Deploy from a branch**, choose the branch and `/ (root)` folder, then save.
4. Wait for the Pages URL to appear. The site uses relative asset paths (`./src/...` and `./datasets/...`) so it works from a repository subpath such as `https://username.github.io/repository-name/`.

There is no build step: these are static HTML, CSS and JavaScript files. The CSV is committed with the site; the browser does not contact UCI or another dataset host at runtime. Once the page and assets have loaded, model training and clustering run locally in the browser.

## What is implemented

- Fruit Lab is the default and uses 24 hand-authored classroom examples.
- Flower Lab loads and validates `datasets/iris.csv` (150 rows, four numeric measurements and a species label).
- Classification uses a small CART-style decision tree trained on a deterministic train/test split. Test rows are excluded from fitting. The interface reports genuine test predictions and accuracy.
- Clustering uses deterministic-initialisation k-means on standardised selected numerical features. Species labels are not passed to the algorithm. The chart and group counts are computed from the resulting assignments.
- Dataset metadata and source notes are in `datasets/dataset-manifest.json` and `datasets/README.md`.

## Dataset attribution

The Iris dataset is attributed to the UCI Machine Learning Repository, DOI `10.24432/C56C76`, with a source link and licence notes in `datasets/README.md`. Review the current UCI terms before reusing the CSV elsewhere.

## Limitations

This is a teaching implementation, not a general-purpose data science toolkit. The decision tree is intentionally small and the fruit scores are illustrative. K-means standardises the selected features so features with larger numeric scales do not automatically dominate. Clustering groups may not correspond to the human-provided species labels.
