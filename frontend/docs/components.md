# Documentación de Componentes

## Componentes de Visualización

### BoxPlot.tsx

Componente para visualizar distribuciones de datos mediante diagramas de caja.

#### Ubicación
`src/components/BoxPlot.tsx`

#### Props
```typescript
interface BoxPlotProps {
  data: Array<{
    variable: string
    stats: {
      min: number
      q1: number      // Primer cuartil
      median: number
      q3: number      // Tercer cuartil  
      max: number
      outliers: number
    }
  }>
}
```

#### Características
- Visualización de los 5 números de resumen estadístico
- Identificación visual de outliers
- Tooltips informativos
- Responsive design con Recharts
- Animaciones suaves

#### Ejemplo de uso
```tsx
<BoxPlot 
  data={[
    {
      variable: "edad",
      stats: {
        min: 18,
        q1: 25,
        median: 35,
        q3: 45,
        max: 65,
        outliers: 3
      }
    }
  ]}
/>
```

---

### ClusterVisualization.tsx

Visualización interactiva de clusters usando scatter plots 2D/3D.

#### Ubicación
`src/components/ClusterVisualization.tsx`

#### Props
```typescript
interface ClusterVisualizationProps {
  clusters: {
    assignments: number[]    // Asignación de cluster por punto
    centroids: number[][]   // Coordenadas de centroides
    points: number[][]      // Coordenadas de todos los puntos
  }
  headers: string[]         // Nombres de las variables
}
```

#### Características
- Scatter plot con colores por cluster
- Visualización de centroides como puntos especiales
- Zoom y pan interactivos
- Tooltips con información de punto
- Soporte para 2D y 3D

#### Dependencias
- Plotly.js para renderizado avanzado
- React-Plotly.js para integración con React

#### Ejemplo de uso
```tsx
<ClusterVisualization
  clusters={{
    assignments: [0, 1, 2, 0, 1],
    centroids: [[10, 5], [20, 15], [5, 25]],
    points: [[9, 4], [21, 14], [4, 26], [11, 6], [19, 16]]
  }}
  headers={["variable1", "variable2"]}
/>
```

---

### CorrelationMatrix.tsx

Matriz de correlación visualizada como mapa de calor.

#### Ubicación
`src/components/CorrelationMatrix.tsx`

#### Props
```typescript
interface CorrelationMatrixProps {
  correlations: Record<string, number>  // Pares "var1__var2": valor
  headers: string[]                     // Nombres de variables
}
```

#### Características
- Mapa de calor con escala de colores
- Tooltips con valores de correlación
- Filtrado automático de correlaciones débiles (|r| < 0.1)
- Grid responsivo
- Escala de colores intuitiva (rojo=negativo, azul=positivo)

#### Algoritmo de renderizado
1. Convierte correlaciones de formato "var1__var2" a matriz 2D
2. Crea escala de colores basada en intensidad
3. Renderiza como grid de celdas coloreadas

#### Ejemplo de uso
```tsx
<CorrelationMatrix
  correlations={{
    "edad__salario": 0.75,
    "edad__experiencia": 0.82,
    "salario__experiencia": 0.91
  }}
  headers={["edad", "salario", "experiencia"]}
/>
```

---

### InsightCards.tsx

Tarjetas informativas que muestran insights automáticos del análisis.

#### Ubicación
`src/components/InsightCards.tsx`

#### Props
```typescript
interface InsightCardsProps {
  insights: string[]  // Array de textos de insights
}
```

#### Características
- Iconos temáticos automáticos basados en contenido
- Animaciones de entrada escalonadas
- Diseño de tarjetas con shadcn/ui
- Responsive grid layout

#### Lógica de iconos
```typescript
const getInsightIcon = (insight: string) => {
  if (insight.includes('registros')) return <Database />
  if (insight.includes('correlación')) return <TrendingUp />
  if (insight.includes('outliers') || insight.includes('atípicos')) return <AlertTriangle />
  return <Info />
}
```

#### Ejemplo de uso
```tsx
<InsightCards 
  insights={[
    "Se analizaron 1000 registros.",
    "Existe una fuerte correlación entre edad y salario (r = 0.85)",
    "Se detectaron 23 valores atípicos en la columna ingresos"
  ]}
/>
```

---

### OutlierDetection.tsx

Tabla y visualización de registros atípicos detectados.

#### Ubicación
`src/components/OutlierDetection.tsx`

#### Props
```typescript
interface OutlierDetectionProps {
  outlierIndices: number[]  // Índices de filas con outliers
  rawRows: string[][]       // Datos completos del dataset
  headers: string[]         // Nombres de columnas
}
```

#### Características
- Tabla paginada de outliers
- Highlighting de valores anómalos
- Filtros por columna
- Export de datos filtrados
- Estadísticas de outliers por variable

#### Estados internos
```typescript
const [currentPage, setCurrentPage] = useState(1)
const [itemsPerPage] = useState(10)
const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
```

#### Ejemplo de uso
```tsx
<OutlierDetection
  outlierIndices={[5, 23, 67, 89]}
  rawRows={[
    ["Juan", "25", "50000"],
    ["María", "30", "60000"],
    // ... más filas
  ]}
  headers={["nombre", "edad", "salario"]}
/>
```

---

### UploadData.tsx

Componente principal de carga de archivos con drag & drop.

#### Ubicación
`src/components/UploadData.tsx`

#### Props
Ninguna (componente autocontenido)

#### Estados principales
```typescript
const [file, setFile] = useState<File | null>(null)
const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [previewData, setPreviewData] = useState<string[][] | null>(null)
```

#### Características
- Drag & drop de archivos
- Validación de tipos (.csv, .xlsx, .xls)
- Preview de primeras 5 filas
- Integración con API /api/analyze
- Estados de carga y error
- Progress indicators

#### Validación de archivos
```typescript
const validateFile = (file: File): boolean => {
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  return validTypes.includes(file.type) || 
         file.name.endsWith('.csv') || 
         file.name.endsWith('.xlsx') || 
         file.name.endsWith('.xls')
}
```

#### Flujo de procesamiento
1. Usuario arrastra/selecciona archivo
2. Validación de tipo y tamaño
3. Preview de datos usando XLSX.js
4. Upload y análisis via API
5. Renderizado de resultados

## Componentes UI Base (shadcn/ui)

### Badge
Etiquetas para mostrar estados o categorías.

#### Ubicación
`src/components/ui/badge.tsx`

#### Variantes
- `default`: Estilo por defecto
- `secondary`: Estilo secundario
- `destructive`: Para errores/warnings
- `outline`: Solo borde

### Button
Botones con múltiples variantes y tamaños.

#### Ubicación
`src/components/ui/button.tsx`

#### Variantes
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    }
  }
)
```

### Card
Contenedor base para agrupar contenido relacionado.

#### Ubicación
`src/components/ui/card.tsx`

#### Subcomponentes
- `Card`: Contenedor principal
- `CardHeader`: Encabezado con título
- `CardContent`: Contenido principal
- `CardFooter`: Pie de tarjeta

### Input
Campo de entrada de texto con estilos consistentes.

#### Ubicación
`src/components/ui/input.tsx`

#### Características
- Estilos focus consistentes
- Soporte para estados disabled/error
- Integración con formularios

### Table
Componentes para tablas responsivas y accesibles.

#### Ubicación
`src/components/ui/table.tsx`

#### Subcomponentes
- `Table`: Contenedor principal
- `TableHeader`: Encabezado de tabla
- `TableBody`: Cuerpo de tabla
- `TableRow`: Fila de tabla
- `TableHead`: Celda de encabezado
- `TableCell`: Celda de datos

### Tabs
Sistema de pestañas para organizar contenido.

#### Ubicación
`src/components/ui/tabs.tsx`

#### Subcomponentes
- `Tabs`: Contenedor principal
- `TabsList`: Lista de pestañas
- `TabsTrigger`: Botón de pestaña
- `TabsContent`: Contenido de pestaña

#### Ejemplo de uso
```tsx
<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="overview">Resumen</TabsTrigger>
    <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
    <TabsTrigger value="clusters">Clusters</TabsTrigger>
    <TabsTrigger value="outliers">Outliers</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    <InsightCards insights={insights} />
  </TabsContent>
  
  <TabsContent value="correlations">
    <CorrelationMatrix correlations={correlations} headers={headers} />
  </TabsContent>
</Tabs>
```

## Layouts

### Header.tsx
Encabezado principal de la aplicación.

#### Ubicación
`src/layouts/Header.tsx`

#### Características
- Logo y título de la aplicación
- Navegación principal
- Responsive design
- Modo oscuro/claro toggle (si implementado)

### Footer.tsx
Pie de página con información adicional.

#### Ubicación
`src/layouts/Footer.tsx`

#### Características
- Links informativos
- Copyright y versión
- Links a documentación
- Información de tecnologías usadas

## Patrones comunes

### Error Boundaries
```tsx
'use client'

import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({error}: {error: Error}) {
  return (
    <div role="alert" className="p-4 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800">Algo salió mal:</h2>
      <pre className="text-sm text-red-600">{error.message}</pre>
    </div>
  )
}

export default function ComponentWithErrorBoundary() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <YourComponent />
    </ErrorBoundary>
  )
}
```

### Loading States
```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingVisualization() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
```

### Conditional Rendering
```tsx
function ConditionalVisualization({ data }: { data: any }) {
  if (!data) {
    return <LoadingVisualization />
  }
  
  if (data.error) {
    return <ErrorDisplay error={data.error} />
  }
  
  return <ActualVisualization data={data} />
}
```