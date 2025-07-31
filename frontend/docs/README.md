# Frontend Documentation

## Descripción general

El frontend de SmartData Analyzer es una aplicación web moderna desarrollada con Next.js 14, React 18 y TypeScript que proporcionauna interfaz intuitiva para cargar, analizar y visualizar datasets.

## Arquitectura

```
frontend/
├── src/
│   ├── app/                    # App Router de Next.js 14
│   │   ├── api/               # API Routes
│   │   │   └── analyze/       # Endpoint de análisis
│   │   ├── dashboard/         # Página del dashboard
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── BoxPlot.tsx       # Visualización de boxplots
│   │   ├── ClusterVisualization.tsx # Gráfico de clusters
│   │   ├── CorrelationMatrix.tsx    # Matriz de correlación
│   │   ├── InsightCards.tsx   # Tarjetas de insights
│   │   ├── OutlierDetection.tsx     # Detección de outliers
│   │   └── UploadData.tsx     # Componente de carga
│   ├── layouts/               # Layouts compartidos
│   │   ├── Footer.tsx         # Pie de página
│   │   └── Header.tsx         # Encabezado
│   └── lib/                   # Utilidades
│       └── utils.ts           # Funciones utilitarias
├── public/                    # Archivos estáticos
├── docs/                      # Documentación (esta carpeta)
├── components.json            # Configuración shadcn/ui
├── next.config.ts             # Configuración Next.js
├── package.json               # Dependencias y scripts
├── postcss.config.mjs         # Configuración PostCSS
├── tailwind.config.ts         # Configuración Tailwind CSS
└── tsconfig.json              # Configuración TypeScript
```

## Stack tecnológico

### Core
- **Next.js 14**: Framework React con App Router
- **React 18**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático

### Styling
- **Tailwind CSS**: Framework de utilidades CSS
- **shadcn/ui**: Componentes de UI accesibles
- **Radix UI**: Primitivos de UI sin estilos
- **Lucide React**: Iconos SVG

### Visualización
- **Recharts**: Gráficos y visualizaciones de datos
- **Plotly.js**: Gráficos 3D y avanzados (para clusters)

### Utilidades
- **clsx**: Utilitario para clases CSS condicionales
- **tailwind-merge**: Fusión inteligente de clases Tailwind
- **busboy**: Manejo de uploads multipart
- **xlsx**: Procesamiento de archivos Excel

## Componentes principales

### UploadData.tsx
Componente de carga de archivos con drag & drop.

**Características**:
- Drag and drop de archivos
- Validación de tipos (.csv, .xlsx, .xls)
- Preview de datos cargados
- Integración con API de análisis

**Props**: Ninguna (componente autocontenido)

### InsightCards.tsx
Tarjetas que muestran insights automáticos generados por el backend.

**Características**:
- Iconos temáticos por tipo de insight
- Animaciones de entrada
- Responsive design

**Props**:
```typescript
interface InsightCardsProps {
  insights: string[]
}
```

### CorrelationMatrix.tsx
Matriz de correlación interactiva usando Recharts.

**Características**:
- Mapa de calor con escala de colores
- Tooltips informativos
- Filtrado de correlaciones débiles

**Props**:
```typescript
interface CorrelationMatrixProps {
  correlations: Record<string, number>
  headers: string[]
}
```

### ClusterVisualization.tsx
Visualización 2D/3D de clusters usando Plotly.

**Características**:
- Scatter plot con colores por cluster
- Visualización de centroides
- Zoom y pan interactivos

**Props**:
```typescript
interface ClusterVisualizationProps {
  clusters: {
    assignments: number[]
    centroids: number[][]
    points: number[][]
  }
  headers: string[]
}
```

### BoxPlot.tsx
Gráfico de caja para visualizar distribuciones y outliers.

**Características**:
- Estadísticas de 5 números
- Visualización de outliers
- Responsive y animado

**Props**:
```typescript
interface BoxPlotProps {
  data: {
    variable: string
    stats: {
      min: number
      q1: number
      median: number
      q3: number
      max: number
      outliers: number
    }
  }[]
}
```

### OutlierDetection.tsx
Tabla y visualización de outliers detectados.

**Características**:
- Tabla paginada de outliers
- Highlighting de valores anómalos
- Export de datos filtrados

**Props**:
```typescript
interface OutlierDetectionProps {
  outlierIndices: number[]
  rawRows: string[][]
  headers: string[]
}
```

## Routing y navegación

### App Router (Next.js 14)

**Rutas principales**:
- `/`: Página de inicio con carga de archivos
- `/dashboard`: Dashboard de análisis completo
- `/api/analyze`: Endpoint de análisis (POST)

### Navegación entre estados

1. **Estado inicial**: Página de carga
2. **Carga de archivo**: Vista previa de datos
3. **Análisis**: Loading state
4. **Resultados**: Dashboard completo con tabs

## Manejo de estado

### Estado local (useState)
```typescript
// Estado principal de la aplicación
const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### Estado de componentes
Cada componente maneja su propio estado interno:
- Tabs activos
- Datos de visualización
- Estados de carga

## API Integration

### Endpoint de análisis

```typescript
const analyzeFile = async (file: File): Promise<AnalysisResult> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}
```

### Tipos de datos

```typescript
interface AnalysisResult {
  headers: string[]
  types: ('numeric' | 'categorical')[]
  stats: Record<string, StatsSummary>
  correlations: Record<string, number>
  histograms: Record<string, Histogram>
  clusters: ClusterResult | null
  insights: string[]
  rawRows: string[][]
  outlier_indices: number[]
}

interface StatsSummary {
  mean?: number
  median?: number
  std?: number
  min?: number
  max?: number
  outliers?: number
  unique?: number
}
```

## Styling y theming

### Tailwind CSS
Configuración personalizada con variables CSS para temas:

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... más variables */
}
```

### Componentes shadcn/ui
Sistema de diseño consistente basado en:
- Radix UI (funcionalidad)
- Tailwind CSS (estilos)
- CSS Variables (theming)

### Responsive design
Breakpoints estándar de Tailwind:
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+
- `2xl`: 1536px+

## Performance y optimización

### Next.js optimizaciones
- **Static Generation**: Páginas estáticas cuando sea posible
- **Image Optimization**: Componente `next/image`
- **Bundle Splitting**: Importación dinámica de componentes grandes
- **Caching**: Headers de cache apropiados

### React optimizaciones
```typescript
// Memoización de componentes pesados
const MemoizedVisualization = memo(ClusterVisualization)

// Lazy loading de componentes
const LazyOutlierDetection = lazy(() => import('./OutlierDetection'))
```

### Carga de datos
- Streaming de análisis en tiempo real
- Loading states informativos
- Error boundaries para manejo de errores

## Testing

### Configuración recomendada
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Tipos de tests
1. **Unit tests**: Componentes individuales
2. **Integration tests**: Flujos completos
3. **E2E tests**: Casos de usuario completos

### Ejemplo de test
```typescript
import { render, screen } from '@testing-library/react'
import InsightCards from '../InsightCards'

describe('InsightCards', () => {
  it('renders insights correctly', () => {
    const insights = ['Se analizaron 100 registros.']
    render(<InsightCards insights={insights} />)
    
    expect(screen.getByText('Se analizaron 100 registros.')).toBeInTheDocument()
  })
})
```

## Build y deployment

### Scripts disponibles
```json
{
  "dev": "next dev",           // Desarrollo
  "build": "next build",       // Build de producción
  "start": "next start",       // Servidor de producción
  "lint": "next lint",         // Linting
  "type-check": "tsc --noEmit" // Verificación de tipos
}
```

### Variables de entorno
```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANALYZE_TIMEOUT=300000  # 5 minutos
```

### Build optimization
```typescript
// next.config.ts
const config: NextConfig = {
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react']
  },
  images: {
    formats: ['image/webp', 'image/avif']
  }
}
```