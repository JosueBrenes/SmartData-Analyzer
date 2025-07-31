# Algoritmos y Metodologías

## Análisis Estadístico Descriptivo

### Estadísticas básicas
Para cada columna numérica se calculan:

```python
mean = col_series.mean()           # Media aritmética
median = col_series.median()       # Mediana (percentil 50)
std = col_series.std()            # Desviación estándar
min_v = col_series.min()          # Valor mínimo
max_v = col_series.max()          # Valor máximo
q1 = col_series.quantile(0.25)    # Primer cuartil
q3 = col_series.quantile(0.75)    # Tercer cuartil
```

### Detección de outliers (Método IQR)

Se utiliza el método del rango intercuartílico (IQR) para identificar valores atípicos:

```python
iqr = q3 - q1
outlier_mask = (col_series < q1 - 1.5 * iqr) | (col_series > q3 + 1.5 * iqr)
```

**Criterio**: Un valor es outlier si está fuera del rango [Q1 - 1.5×IQR, Q3 + 1.5×IQR]

**Ventajas**:
- Robusto ante distribuciones asimétricas
- No asume normalidad de los datos
- Método estándar en análisis exploratorio

## Análisis de Correlaciones

### Coeficiente de Pearson

Se calcula la correlación lineal entre todas las parejas de variables numéricas:

```python
corr_df = df[numeric_cols].corr(method="pearson").fillna(0)
```

**Interpretación**:
- r = 1: correlación positiva perfecta
- r = 0: sin correlación lineal
- r = -1: correlación negativa perfecta
- |r| > 0.8: correlación fuerte (genera insight automático)

**Limitaciones**:
- Solo detecta relaciones lineales
- Sensible a outliers
- No implica causalidad

## Clustering - K-Means

### Configuración
```python
model = KMeans(n_clusters=3, n_init=10, random_state=0)
```

**Parámetros**:
- `n_clusters=3`: fijo en 3 grupos para simplicidad
- `n_init=10`: 10 inicializaciones aleatorias para estabilidad
- `random_state=0`: semilla fija para reproducibilidad

### Preprocesamiento
```python
points = df[numeric_cols].fillna(0).values
```
- Los valores faltantes se reemplazan por 0
- Solo se usan columnas numéricas

### Algoritmo K-Means
1. **Inicialización**: k centroides aleatorios
2. **Asignación**: cada punto al centroide más cercano (distancia euclidiana)
3. **Actualización**: recalcular centroides como promedio de puntos asignados
4. **Iteración**: repetir hasta convergencia

**Ventajas**:
- Rápido y eficiente
- Funciona bien con clusters esféricos
- Escalable a grandes datasets

**Limitaciones**:
- Asume clusters esféricos
- Sensible a inicialización
- Requiere especificar k a priori

## Detección de Outliers - Isolation Forest

### Configuración
```python
iso = IsolationForest(random_state=0)
```

**Parámetros por defecto**:
- `n_estimators=100`: 100 árboles de aislamiento
- `contamination='auto'`: estimación automática de outliers
- `random_state=0`: reproducibilidad

### Algoritmo
1. **Construcción de árboles**: crear múltiples árboles binarios aleatorios
2. **Aislamiento**: medir profundidad promedio para aislar cada punto
3. **Scoring**: puntos que se aíslan rápidamente son outliers
4. **Clasificación**: -1 para outliers, 1 para puntos normales

### Ventajas sobre IQR
- Multivariado (considera todas las variables numéricas)
- No asume distribución específica
- Eficiente computacionalmente O(n log n)
- Detecta outliers globales y locales

### Interpretación
```python
outlier_indices = [int(i) for i, v in enumerate(preds) if v == -1]
```
Los índices corresponden a las filas del dataset original identificadas como anómalas.

## Generación de Histogramas

### Binning automático
```python
bins = np.linspace(min_v, max_v, num=11)  # 10 bins
counts, _ = np.histogram(col_series, bins=bins)
```

**Estrategia**:
- Bins equiespaciados entre min y max
- 10 bins fijos para todas las variables
- Bins incluyen el valor mínimo, excluyen el máximo (excepto el último)

### Estructura de salida
```python
histograms[col] = {
    "binEdges": bins[:-1].tolist(),  # Borde izquierdo de cada bin
    "counts": counts.tolist()        # Frecuencia en cada bin
}
```

## Generación de Insights

### Reglas automáticas
1. **Tamaño del dataset**: `"Se analizaron {len(df)} registros."`
2. **Correlaciones fuertes**: Para |r| > 0.8
3. **Outliers por variable**: Si se detectan outliers IQR

### Ejemplo de lógica
```python
for pair, val in correlations.items():
    if abs(val) > 0.8:
        a, b = pair.split("__")
        insights.append(f"Existe una fuerte correlación entre {a} e {b} (r = {val:.2f})")
```

## Consideraciones de rendimiento

### Complejidad computacional
- **Estadísticas descriptivas**: O(n) por columna
- **Correlaciones**: O(p²n) donde p = número de columnas numéricas
- **K-Means**: O(kndi) donde k=clusters, n=puntos, d=dimensiones, i=iteraciones
- **Isolation Forest**: O(tn log n) donde t=número de árboles

### Optimizaciones implementadas
- Procesamiento vectorizado con pandas/numpy
- Filtrado temprano de columnas numéricas
- Manejo eficiente de valores faltantes
- Inicializaciones múltiples solo donde es crítico

### Limitaciones de memoria
- Todo el dataset se carga en memoria
- Sin procesamiento por chunks
- Estructuras auxiliares (correlaciones, histogramas) también en memoria