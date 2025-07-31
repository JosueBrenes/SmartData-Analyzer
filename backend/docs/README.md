# Backend Documentation

## Descripción general

El backend de SmartData Analyzer es un sistema de análisis de datos desarrollado en Python que proporciona análisis estadístico automatizado, detección de outliers, clustering, y generación de insights para datasets en formato CSV y Excel.

## Arquitectura

```
backend/
├── analyze.py          # Script principal de análisis
├── docs/
│   ├── README.md       # Este archivo
│   ├── api.md         # Documentación de la API
│   ├── algorithms.md  # Documentación de algoritmos
│   └── requirements.txt # Dependencias de Python
```

## Funcionalidades principales

### 1. Carga de datos
- Soporte para archivos CSV (UTF-8 y Latin-1)
- Soporte para archivos Excel (.xlsx, .xls)
- Detección automática de tipos de datos

### 2. Análisis estadístico
- Estadísticas descriptivas (media, mediana, desviación estándar)
- Detección de outliers usando IQR
- Histogramas automáticos para variables numéricas

### 3. Análisis de correlaciones
- Matriz de correlación de Pearson
- Identificación automática de correlaciones fuertes (|r| > 0.8)

### 4. Clustering
- Implementación de K-Means con 3 clusters
- Visualización de centroides y puntos

### 5. Detección de outliers
- Isolation Forest para detección avanzada de anomalías
- Índices de registros atípicos

## Configuración

### Requisitos del sistema
- Python 3.10+
- Librerías especificadas en `requirements.txt`

### Instalación
```bash
pip install -r backend/docs/requirements.txt
```

### Uso directo
```bash
python backend/analyze.py path/to/dataset.csv
```

## Integración con el frontend

El backend se integra con el frontend Next.js a través del endpoint `/api/analyze` que:

1. Recibe archivos multipart/form-data
2. Los guarda temporalmente en el sistema
3. Ejecuta el script de análisis Python
4. Retorna los resultados en formato JSON
5. Limpia los archivos temporales

## Estructura de respuesta

```json
{
  "headers": ["col1", "col2", ...],
  "types": ["numeric", "categorical", ...],
  "stats": {
    "col1": {
      "mean": 10.5,
      "median": 9.0,
      "std": 2.3,
      "min": 1.0,
      "max": 20.0,
      "outliers": 3
    }
  },
  "correlations": {
    "col1__col2": 0.85
  },
  "histograms": {
    "col1": {
      "binEdges": [0, 2, 4, 6, 8, 10],
      "counts": [5, 10, 15, 8, 2]
    }
  },
  "clusters": {
    "assignments": [0, 1, 2, 0, 1],
    "centroids": [[1.2, 3.4], [5.6, 7.8], [9.0, 2.1]],
    "points": [[1.0, 3.2], [5.4, 7.9], ...]
  },
  "insights": ["Se analizaron 100 registros.", ...],
  "rawRows": [["val1", "val2"], ...],
  "outlier_indices": [5, 23, 67]
}
```

## Manejo de errores

El sistema maneja varios tipos de errores:
- Archivos no soportados
- Errores de codificación
- Datasets vacíos o malformados
- Errores en algoritmos de ML

Todos los errores se reportan en formato JSON con estructura:
```json
{
  "error": "Descripción del error"
}
```

## Consideraciones de rendimiento

- Los archivos se procesan completamente en memoria
- K-Means utiliza 10 inicializaciones para estabilidad
- Isolation Forest usa configuración por defecto (100 estimadores)
- Los histogramas se generan con 10 bins por defecto

## Extensibilidad

Para agregar nuevos análisis:

1. Modifica `analyze.py` agregando la nueva función
2. Incluye los resultados en el diccionario `result`
3. Actualiza la documentación de la API
4. Agrega las dependencias necesarias a `requirements.txt`