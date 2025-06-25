import json
import sys
from typing import Any, Dict

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest


def main(path: str) -> None:
    try:
        df = pd.read_csv(path)
    except Exception as e:
        print(json.dumps({"error": f"Failed to read CSV: {e}"}))
        return

    headers = df.columns.tolist()
    numeric_cols = df.select_dtypes(include="number").columns.tolist()

    types = ["numeric" if col in numeric_cols else "categorical" for col in headers]

    # descriptive statistics
    stats: Dict[str, Dict[str, Any]] = {}
    histograms: Dict[str, Dict[str, Any]] = {}
    for col in headers:
        series = df[col]
        if col in numeric_cols:
            col_series = series.dropna().astype(float)
            mean = col_series.mean()
            median = col_series.median()
            std = col_series.std()
            min_v = col_series.min()
            max_v = col_series.max()
            q1 = col_series.quantile(0.25)
            q3 = col_series.quantile(0.75)
            iqr = q3 - q1
            outlier_mask = (col_series < q1 - 1.5 * iqr) | (col_series > q3 + 1.5 * iqr)
            stats[col] = {
                "mean": mean,
                "median": median,
                "std": std,
                "min": min_v,
                "max": max_v,
                "outliers": int(outlier_mask.sum()),
            }

            # histogram with 10 bins
            if len(col_series) > 0:
                bins = np.linspace(min_v, max_v, num=11)
                counts, _ = np.histogram(col_series, bins=bins)
                histograms[col] = {
                    "binEdges": bins[:-1].tolist(),
                    "counts": counts.tolist(),
                }
        else:
            stats[col] = {"unique": int(series.nunique())}

    # correlation matrix for numeric columns
    correlations: Dict[str, float] = {}
    if len(numeric_cols) >= 2:
        corr_df = df[numeric_cols].corr(method="pearson").fillna(0)
        for i, a in enumerate(numeric_cols):
            for b in numeric_cols[i + 1 :]:
                correlations[f"{a}__{b}"] = float(corr_df.at[a, b])

    # clustering with KMeans
    clusters: Dict[str, Any] | None = None
    if len(numeric_cols) >= 2:
        try:
            model = KMeans(n_clusters=3, n_init=10, random_state=0)
            points = df[numeric_cols].fillna(0).values
            assignments = model.fit_predict(points)
            clusters = {
                "assignments": assignments.tolist(),
                "centroids": model.cluster_centers_.tolist(),
                "points": points.tolist(),
            }
        except Exception as e:
            clusters = {"error": str(e)}

    # outlier detection using IsolationForest across numeric columns
    outlier_indices: list[int] = []
    if len(numeric_cols) >= 1:
        try:
            iso = IsolationForest(random_state=0)
            preds = iso.fit_predict(df[numeric_cols].fillna(0))
            outlier_indices = [int(i) for i, v in enumerate(preds) if v == -1]
        except Exception as e:
            outlier_indices = []

    insights = [f"Se analizaron {len(df)} registros."]
    for pair, val in correlations.items():
        if abs(val) > 0.8:
            a, b = pair.split("__")
            insights.append(f"Existe una fuerte correlación entre {a} e {b} (r = {val:.2f})")
    for key, st in stats.items():
        if isinstance(st, dict) and st.get("outliers", 0) > 0:
            insights.append(f"Se detectaron {st['outliers']} valores atípicos en la columna {key}")

    result = {
        "headers": headers,
        "types": types,
        "stats": stats,
        "correlations": correlations,
        "histograms": histograms,
        "clusters": clusters,
        "insights": insights,
        "rawRows": df.astype(str).values.tolist(),
        "outlier_indices": outlier_indices,
    }

    print(json.dumps(result))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No CSV path provided"}))
    else:
        main(sys.argv[1])
