import json
import sys
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest


def main(path: str):
    try:
        df = pd.read_csv(path)
    except Exception as e:
        print(json.dumps({"error": f"Failed to read CSV: {e}"}))
        return

    numeric_df = df.select_dtypes(include="number")
    if numeric_df.empty:
        print(json.dumps({"error": "CSV does not contain numeric columns"}))
        return

    result = {}

    try:
        kmeans = KMeans(n_clusters=3, n_init=10, random_state=0)
        kmeans.fit(numeric_df)
        result["clusters"] = kmeans.labels_.tolist()
    except Exception as e:
        result["clusters_error"] = str(e)

    try:
        iso = IsolationForest(random_state=0)
        iso.fit(numeric_df)
        preds = iso.predict(numeric_df)
        outliers = [int(i) for i, v in enumerate(preds) if v == -1]
        result["outliers"] = outliers
    except Exception as e:
        result["outliers_error"] = str(e)

    try:
        corr = numeric_df.corr(method="pearson").fillna(0)
        result["correlation"] = corr.to_dict()
    except Exception as e:
        result["correlation_error"] = str(e)

    print(json.dumps(result))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No CSV path provided"}))
    else:
        main(sys.argv[1])
