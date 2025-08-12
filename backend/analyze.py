# Importar librerías necesarias para análisis de datos
import json
import sys
from typing import Any, Dict
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest
import os


def main(path: str) -> None:
    # Intentar cargar el archivo de datos según su extensión
    try:
        ext = os.path.splitext(path)[1].lower()
        if ext == ".csv":
            # Intentar con UTF-8 primero, luego con latin1 si falla
            try:
                df = pd.read_csv(path, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(path, encoding="latin1")
        elif ext in [".xls", ".xlsx"]:
            # Cargar archivos de Excel
            df = pd.read_excel(path)
        else:
            # Archivo no soportado
            print(json.dumps({"error": f"Unsupported file extension: {ext}"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Failed to read file: {e}"}))
        return

    # Obtener información básica del dataset
    headers = df.columns.tolist()  # Nombres de las columnas
    numeric_cols = df.select_dtypes(include="number").columns.tolist()  # Columnas numéricas

    # Clasificar cada columna como numérica o categórica
    types = ["numeric" if col in numeric_cols else "categorical" for col in headers]

    # Calcular estadísticas descriptivas para cada columna
    stats: Dict[str, Dict[str, Any]] = {}
    histograms: Dict[str, Dict[str, Any]] = {}
    for col in headers:
        series = df[col]
        if col in numeric_cols:
            # Para columnas numéricas: calcular estadísticas completas
            col_series = series.dropna().astype(float)
            mean = col_series.mean()
            median = col_series.median()
            std = col_series.std()
            min_v = col_series.min()
            max_v = col_series.max()
            q1 = col_series.quantile(0.25)  # Primer cuartil
            q3 = col_series.quantile(0.75)  # Tercer cuartil
            iqr = q3 - q1  # Rango intercuartílico
            # Detectar outliers usando el método IQR
            outlier_mask = (col_series < q1 - 1.5 * iqr) | (col_series > q3 + 1.5 * iqr)
            stats[col] = {
                "mean": mean,
                "median": median,
                "std": std,
                "min": min_v,
                "max": max_v,
                "outliers": int(outlier_mask.sum()),
            }

            # Crear histograma para visualización
            if len(col_series) > 0:
                bins = np.linspace(min_v, max_v, num=11)  # 10 intervalos
                counts, _ = np.histogram(col_series, bins=bins)
                histograms[col] = {
                    "binEdges": bins[:-1].tolist(),
                    "counts": counts.tolist(),
                }
        else:
            # Para columnas categóricas: solo contar valores únicos
            stats[col] = {"unique": int(series.nunique())}

    # Calcular correlaciones entre variables numéricas
    correlations: Dict[str, float] = {}
    if len(numeric_cols) >= 2:
        # Matriz de correlación usando coeficiente de Pearson
        corr_df = df[numeric_cols].corr(method="pearson").fillna(0)
        # Obtener pares únicos de correlaciones (sin duplicados)
        for i, a in enumerate(numeric_cols):
            for b in numeric_cols[i + 1 :]:
                correlations[f"{a}__{b}"] = float(corr_df.at[a, b])

    # Análisis de clustering (agrupamiento) con K-Means
    clusters: Dict[str, Any] | None = None
    if len(numeric_cols) >= 2 and len(df) >= 3:  # Necesitamos al menos 3 filas para 3 clusters
        try:
            # Determinar número óptimo de clusters (máximo 3, mínimo 2)
            n_clusters = min(3, max(2, len(df) // 3))
            model = KMeans(n_clusters=n_clusters, n_init=10, random_state=0)
            points = df[numeric_cols].fillna(0).values  # Rellenar valores nulos con 0
            assignments = model.fit_predict(points)  # Asignar cada punto a un cluster
            
            # Asegurar que tenemos datos válidos
            if len(points) > 0 and len(assignments) > 0:
                clusters = {
                    "assignments": assignments.tolist(),  # Asignaciones de cluster por fila
                    "centroids": model.cluster_centers_.tolist(),  # Centros de cada cluster
                    "points": points.tolist(),  # Puntos de datos originales
                }
        except Exception as e:
            clusters = {"error": str(e)}

    # Detectar outliers usando Isolation Forest y métodos estadísticos
    outlier_indices: list[int] = []
    outlier_details: list[Dict[str, Any]] = []
    
    if len(numeric_cols) >= 1:
        try:
            # Isolation Forest identifica puntos anómalos en los datos
            iso = IsolationForest(random_state=0, contamination=0.1)
            preds = iso.fit_predict(df[numeric_cols].fillna(0))
            # -1 indica outlier, 1 indica punto normal
            outlier_indices = [int(i) for i, v in enumerate(preds) if v == -1]
            
            # Generar detalles de outliers para cada registro identificado
            for row_idx in outlier_indices:
                for col_name in numeric_cols:
                    col_value = df[col_name].iloc[row_idx]
                    if not pd.isna(col_value):
                        # Calcular Z-score
                        col_mean = df[col_name].mean()
                        col_std = df[col_name].std()
                        z_score = abs((col_value - col_mean) / col_std) if col_std > 0 else 0
                        
                        # Calcular IQR
                        q1 = df[col_name].quantile(0.25)
                        q3 = df[col_name].quantile(0.75)
                        iqr = q3 - q1
                        lower_bound = q1 - 1.5 * iqr
                        upper_bound = q3 + 1.5 * iqr
                        
                        iqr_status = ""
                        if col_value < lower_bound:
                            iqr_status = "Inferior al rango IQR"
                        elif col_value > upper_bound:
                            iqr_status = "Superior al rango IQR"
                        
                        # Solo incluir si es realmente un outlier (Z-score alto o fuera del IQR)
                        if z_score > 2.0 or iqr_status:
                            row_data = {}
                            for i, header in enumerate(df.columns):
                                row_data[header] = str(df.iloc[row_idx, i])
                            
                            outlier_details.append({
                                "id": row_idx + 1,
                                "variable": col_name,
                                "value": float(col_value),
                                "zScore": float(z_score),
                                "iqrStatus": iqr_status if iqr_status else None,
                                "rowData": row_data
                            })
                        
        except Exception as e:
            outlier_indices = []
            outlier_details = []

    # Generar insights automáticos basados en el análisis
    insights = [f"Se analizaron {len(df)} registros."]
    
    # Insight sobre correlaciones fuertes
    for pair, val in correlations.items():
        if abs(val) > 0.8:  # Correlación fuerte (>0.8 o <-0.8)
            a, b = pair.split("__")
            insights.append(
                f"Existe una fuerte correlación entre {a} e {b} (r = {val:.2f})"
            )
    
    # Insight sobre outliers detectados
    for key, st in stats.items():
        if isinstance(st, dict) and st.get("outliers", 0) > 0:
            insights.append(
                f"Se detectaron {st['outliers']} valores atípicos en la columna {key}"
            )

    # Crear el resultado final con todos los análisis realizados
    result = {
        "headers": headers,  # Nombres de las columnas
        "types": types,  # Tipos de datos (numérico/categórico)
        "stats": stats,  # Estadísticas descriptivas
        "correlations": correlations,  # Correlaciones entre variables
        "histograms": histograms,  # Datos para histogramas
        "clusters": clusters,  # Resultados del clustering
        "insights": insights,  # Insights automáticos generados
        "rawRows": df.astype(str).values.tolist(),  # Datos originales como strings
        "outlier_indices": outlier_indices,  # Índices de filas con outliers
        "outlier_details": outlier_details,  # Detalles completos de outliers
    }

    # Imprimir resultado como JSON para el frontend
    print(json.dumps(result))


# Punto de entrada del script
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No CSV path provided"}))
    else:
        main(sys.argv[1])  # Ejecutar análisis con el archivo proporcionado
