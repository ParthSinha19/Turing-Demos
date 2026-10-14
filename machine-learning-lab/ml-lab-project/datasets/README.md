# Dataset notes

## Iris Flower Lab

- **Source:** UCI Machine Learning Repository, [Iris](https://archive.ics.uci.edu/dataset/53/iris)
- **DOI:** 10.24432/C56C76
- **Attribution:** Iris dataset, UCI Machine Learning Repository; originally associated with R. A. Fisher (1936).
- **Licence:** UCI lists the dataset under CC BY 4.0. Review the source page's current terms before redistributing this file independently.
- **Local file:** `iris.csv`
- **Download location:** UCI dataset page above. The website does not fetch from UCI at runtime.
- **Transformations:** The classic 150 observations are stored as CSV with descriptive snake_case column names. Measurements remain in centimetres, rounded to the source's one-decimal precision. No rows are filtered. The species label is retained for classification and post-clustering comparison only.
- **Clustering safety:** `species` is never passed to k-means. Only selected numeric measurements are passed.

## Fruit Lab

The fruit examples are small, hand-authored classroom examples created for this project. Numeric values are illustrative teaching scores, not real-world measurements. They are intentionally simple and are not presented as a scientific dataset.
