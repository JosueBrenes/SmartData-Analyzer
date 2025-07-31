# API Documentation

## Endpoint principal

### POST /api/analyze

Procesa un archivo de datos (CSV o Excel) y retorna análisis estadístico completo.

#### Parámetros de entrada

- **Método**: POST
- **Content-Type**: multipart/form-data
- **Campo**: `file` (archivo CSV o Excel)

#### Formatos soportados

- **CSV**: `.csv` con codificación UTF-8 o Latin-1
- **Excel**: `.xlsx`, `.xls`

#### Respuesta exitosa (200)

```json
{
  "headers": ["columna1", "columna2", "columna3"],
  "types": ["numeric", "categorical", "numeric"],
  "stats": {
    "columna1": {
      "mean": 15.5,
      "median": 14.0,
      "std": 3.2,
      "min": 8.0,
      "max": 25.0,
      "outliers": 2
    },
    "columna2": {
      "unique": 5
    }
  },
  "correlations": {
    "columna1__columna3": 0.87
  },
  "histograms": {
    "columna1": {
      "binEdges": [8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 25.0],
      "counts": [1, 3, 5, 8, 6, 4, 2, 1, 0]
    }
  },
  "clusters": {
    "assignments": [0, 1, 2, 0, 1, 2],
    "centroids": [[10.2, 5.5], [15.8, 12.3], [22.1, 18.7]],
    "points": [[10.0, 5.2], [15.5, 12.1], [22.5, 19.0]]
  },
  "insights": [
    "Se analizaron 100 registros.",
    "Existe una fuerte correlación entre columna1 y columna3 (r = 0.87)",
    "Se detectaron 2 valores atípicos en la columna columna1"
  ],
  "rawRows": [
    ["10.0", "Categoría A", "5.2"],
    ["15.5", "Categoría B", "12.1"]
  ],
  "outlier_indices": [5, 23, 67]
}
```

#### Respuestas de error

##### 400 - Bad Request
```json
{
  "error": "No file provided"
}
```

##### 500 - Internal Server Error
```json
{
  "error": "Failed to read file: [detalle del error]"
}
```

```json
{
  "error": "Python exited with code 1"
}
```

```json
{
  "error": "Failed to parse JSON from Python script"
}
```

## Flujo de procesamiento

1. **Recepción del archivo**: El endpoint recibe el archivo via multipart/form-data
2. **Almacenamiento temporal**: El archivo se guarda en directorio temporal del sistema
3. **Ejecución de análisis**: Se ejecuta el script Python `analyze.py` con la ruta del archivo
4. **Procesamiento de resultados**: Se parsea la salida JSON del script Python
5. **Limpieza**: Se elimina el archivo temporal
6. **Respuesta**: Se retorna el análisis en formato JSON

## Detalles de la respuesta

### headers
Array con los nombres de las columnas del dataset.

### types
Array paralelo a `headers` indicando el tipo de cada columna:
- `"numeric"`: columnas numéricas
- `"categorical"`: columnas de texto o categóricas

### stats
Objeto con estadísticas por columna:

**Para columnas numéricas**:
- `mean`: media aritmética
- `median`: mediana
- `std`: desviación estándar
- `min`: valor mínimo
- `max`: valor máximo
- `outliers`: cantidad de outliers detectados (método IQR)

**Para columnas categóricas**:
- `unique`: número de valores únicos

### correlations
Objeto con correlaciones de Pearson entre pares de columnas numéricas.
- Clave: `"columna1__columna2"`
- Valor: coeficiente de correlación (-1 a 1)

### histograms
Histogramas para columnas numéricas:
- `binEdges`: bordes de los bins del histograma
- `counts`: frecuencias en cada bin

### clusters
Resultado del clustering K-Means (k=3):
- `assignments`: array con asignación de cluster para cada fila
- `centroids`: coordenadas de los 3 centroides
- `points`: coordenadas de todos los puntos

### insights
Array de strings con observaciones automáticas en lenguaje natural:
- Número total de registros
- Correlaciones fuertes detectadas (|r| > 0.8)
- Outliers detectados por columna

### rawRows
Array bidimensional con todos los datos convertidos a string para visualización.

### outlier_indices
Array con los índices de las filas identificadas como outliers por Isolation Forest.

## Manejo de errores del script Python

El script `analyze.py` puede retornar errores en formato JSON:

```json
{
  "error": "Unsupported file extension: .txt"
}
```

```json
{
  "error": "Failed to read file: [detalle]"
}
```

Estos errores se propagan como respuestas 500 del endpoint.

## Limitaciones actuales

- Tamaño máximo de archivo: limitado por la memoria disponible
- Clustering fijo en 3 clusters
- Histogramas con 10 bins fijos
- Sin configuración de parámetros de algoritmos
- Procesamiento síncrono (bloquea hasta completar)

## Consideraciones de seguridad

- Los archivos temporales se eliminan automáticamente
- No se persisten datos del usuario
- Validación de extensiones de archivo
- Timeouts implícitos del proceso Python