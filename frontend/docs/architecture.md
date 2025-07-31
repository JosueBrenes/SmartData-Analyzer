# Arquitectura del Frontend

## Visión general

El frontend de SmartData Analyzer está construido siguiendo una arquitectura de componentes modulares con Next.js 14 y el App Router, implementando patrones modernos de React y mejores prácticas de desarrollo.

## Arquitectura de carpetas

```
src/
├── app/                     # App Router (Next.js 14)
│   ├── api/                # API Routes
│   ├── dashboard/          # Rutas de páginas
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout raíz
│   └── page.tsx            # Página principal
├── components/             # Componentes React
│   ├── ui/                # Componentes base (shadcn/ui)
│   └── [components].tsx   # Componentes específicos
├── layouts/               # Layouts compartidos
├── lib/                   # Utilidades y configuración
└── types/                 # Definiciones de tipos TypeScript
```

## Patrones arquitectónicos

### 1. Component-Based Architecture

Cada funcionalidad se encapsula en componentes reutilizables y autocontenidos:

```typescript
// Componente con responsabilidad única
interface ComponentProps {
  data: SpecificDataType
  onAction?: (data: any) => void
}

export function SpecificComponent({ data, onAction }: ComponentProps) {
  // Lógica del componente
  return <div>{/* JSX */}</div>
}
```

### 2. Composition over Inheritance

Los componentes se componen para crear funcionalidades complejas:

```tsx
function Dashboard({ analysisData }: { analysisData: AnalysisResult }) {
  return (
    <div className="dashboard">
      <Header />
      <main>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <InsightCards insights={analysisData.insights} />
            <StatsSummary stats={analysisData.stats} />
          </TabsContent>
          
          <TabsContent value="correlations">
            <CorrelationMatrix 
              correlations={analysisData.correlations}
              headers={analysisData.headers}
            />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
```

### 3. Unidirectional Data Flow

Los datos fluyen desde componentes padre a hijos, los eventos se propagan hacia arriba:

```typescript
// Componente padre maneja el estado
function DataAnalysisApp() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  
  const handleFileUpload = async (file: File) => {
    setLoading(true)
    try {
      const result = await analyzeFile(file)
      setAnalysisData(result)
    } catch (error) {
      // Manejo de errores
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      {!analysisData ? (
        <UploadData onFileUpload={handleFileUpload} loading={loading} />
      ) : (
        <Dashboard analysisData={analysisData} />
      )}
    </div>
  )
}
```

## Gestión de estado

### 1. Estado local (useState)

Para estado específico de componentes:

```typescript
function UploadComponent() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<string[][] | null>(null)
  
  // Lógica del componente...
}
```

### 2. Estado derivado

Cálculos basados en props o estado existente:

```typescript
function StatsSummary({ stats, headers }: StatsProps) {
  const numericColumns = useMemo(() => 
    headers.filter(header => stats[header]?.mean !== undefined)
  , [stats, headers])
  
  const totalOutliers = useMemo(() =>
    Object.values(stats).reduce((sum, stat) => sum + (stat.outliers || 0), 0)
  , [stats])
  
  // Render...
}
```

### 3. Context API (para estado global futuro)

```typescript
// Ejemplo de implementación futura
interface AppContextType {
  theme: 'light' | 'dark'
  language: 'es' | 'en'
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (lang: 'es' | 'en') => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  
  return (
    <AppContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </AppContext.Provider>
  )
}
```

## Routing y navegación

### App Router (Next.js 14)

```
app/
├── layout.tsx              # Layout raíz
├── page.tsx                # Página principal (/)
├── dashboard/
│   ├── layout.tsx         # Layout del dashboard
│   └── page.tsx           # Página del dashboard (/dashboard)
└── api/
    └── analyze/
        └── route.ts       # API endpoint (/api/analyze)
```

### Navegación programática

```typescript
import { useRouter } from 'next/navigation'

function NavigationComponent() {
  const router = useRouter()
  
  const handleAnalysisComplete = (data: AnalysisResult) => {
    // Guardar datos en estado global o localStorage
    router.push('/dashboard')
  }
  
  return <AnalysisComponent onComplete={handleAnalysisComplete} />
}
```

## Comunicación con API

### 1. API Routes (Backend interno)

```typescript
// app/api/analyze/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  // Procesamiento...
  
  return NextResponse.json(result)
}
```

### 2. Cliente HTTP

```typescript
// lib/api.ts
export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}
```

### 3. Manejo de errores

```typescript
function useApiCall<T>(apiFunction: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const execute = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }
  
  return { data, loading, error, execute }
}
```

## Sistema de tipos

### 1. Tipos de dominio

```typescript
// types/analysis.ts
export interface AnalysisResult {
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

export interface StatsSummary {
  // Para columnas numéricas
  mean?: number
  median?: number
  std?: number
  min?: number
  max?: number
  outliers?: number
  
  // Para columnas categóricas
  unique?: number
}
```

### 2. Tipos de componentes

```typescript
// types/components.ts
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

export interface DataVisualizationProps extends BaseComponentProps {
  data: any
  loading?: boolean
  error?: string | null
}
```

### 3. Utility types

```typescript
// types/utils.ts
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>

// Ejemplo de uso
type PartialAnalysisResult = Optional<AnalysisResult, 'clusters' | 'outlier_indices'>
```

## Optimización de rendimiento

### 1. Memoización

```typescript
import { memo } from 'react'

// Memoizar componentes pesados
export const ExpensiveVisualization = memo(function ExpensiveVisualization({
  data
}: {
  data: ComplexDataType
}) {
  // Renderizado pesado...
})

// Memoizar cálculos costosos
function AnalysisComponent({ rawData }: { rawData: any[] }) {
  const processedData = useMemo(() => {
    return expensiveDataProcessing(rawData)
  }, [rawData])
  
  return <div>{/* Usar processedData */}</div>
}
```

### 2. Lazy loading

```typescript
import { lazy, Suspense } from 'react'

// Cargar componentes bajo demanda
const HeavyVisualization = lazy(() => import('./HeavyVisualization'))

function ConditionalRenderer({ showVisualization }: { showVisualization: boolean }) {
  return (
    <div>
      {showVisualization && (
        <Suspense fallback={<div>Cargando visualización...</div>}>
          <HeavyVisualization />
        </Suspense>
      )}
    </div>
  )
}
```

### 3. Virtualization (para listas grandes)

```typescript
import { FixedSizeList as List } from 'react-window'

function VirtualizedOutlierList({ outliers }: { outliers: any[] }) {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <OutlierRow data={outliers[index]} />
    </div>
  )
  
  return (
    <List
      height={400}
      itemCount={outliers.length}
      itemSize={50}
    >
      {Row}
    </List>
  )
}
```

## Testing arquitectónico

### 1. Testing de componentes

```typescript
// __tests__/components/InsightCards.test.tsx
import { render, screen } from '@testing-library/react'
import InsightCards from '@/components/InsightCards'

describe('InsightCards', () => {
  it('renders all insights correctly', () => {
    const insights = ['Insight 1', 'Insight 2']
    render(<InsightCards insights={insights} />)
    
    insights.forEach(insight => {
      expect(screen.getByText(insight)).toBeInTheDocument()
    })
  })
})
```

### 2. Testing de integración

```typescript
// __tests__/integration/upload-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/app/page'

describe('Upload Flow Integration', () => {
  it('completes full upload and analysis flow', async () => {
    render(<App />)
    
    const fileInput = screen.getByLabelText(/upload file/i)
    const file = new File(['csv,data'], 'test.csv', { type: 'text/csv' })
    
    await userEvent.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText(/análisis completado/i)).toBeInTheDocument()
    })
  })
})
```

## Consideraciones de escalabilidad

### 1. Estructura modular

Organización que permite crecimiento:

```
src/
├── features/              # Funcionalidades por dominio
│   ├── data-upload/
│   ├── data-analysis/
│   ├── data-visualization/
│   └── user-management/   # Funcionalidad futura
├── shared/               # Componentes compartidos
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── core/                 # Configuración y setup
    ├── api/
    ├── routing/
    └── theme/
```

### 2. Separación de responsabilidades

```typescript
// Separar lógica de negocio de presentación
class DataAnalysisService {
  static async analyzeFile(file: File): Promise<AnalysisResult> {
    // Lógica de análisis
  }
  
  static processInsights(data: AnalysisResult): ProcessedInsights {
    // Procesamiento de insights
  }
}

// Componente solo se encarga de presentación
function AnalysisView({ data }: { data: AnalysisResult }) {
  const insights = DataAnalysisService.processInsights(data)
  return <InsightCards insights={insights} />
}
```

### 3. Configuración extensible

```typescript
// config/analysis.ts
export const analysisConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedFormats: ['.csv', '.xlsx', '.xls'],
  visualization: {
    defaultClusterCount: 3,
    histogramBins: 10,
    correlationThreshold: 0.8
  }
}
```

Esta arquitectura proporciona una base sólida para el crecimiento futuro del proyecto mientras mantiene la simplicidad y claridad del código actual.