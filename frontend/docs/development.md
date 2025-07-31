# Guía de Desarrollo

## Configuración del entorno de desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Python 3.10+ (para el backend)
- Editor con soporte TypeScript (VS Code recomendado)

### Instalación inicial

```bash
# Clonar el repositorio
git clone <repo-url>
cd SmartData-Analyzer

# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
pip install -r docs/requirements.txt
```

### Scripts de desarrollo

```json
{
  "scripts": {
    "dev": "next dev",                    // Servidor de desarrollo
    "build": "next build",                // Build de producción
    "start": "next start",                // Servidor de producción
    "lint": "next lint",                  // Linting con ESLint
    "lint:fix": "next lint --fix",        // Auto-fix de linting
    "type-check": "tsc --noEmit",         // Verificación de tipos
    "format": "prettier --write .",       // Formateo de código
    "test": "jest",                       // Tests unitarios
    "test:watch": "jest --watch",         // Tests en modo watch
    "test:coverage": "jest --coverage"    // Coverage de tests
  }
}
```

### Configuración del editor (VS Code)

#### Extensions recomendadas
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-python.python",
    "ms-python.pylint"
  ]
}
```

#### Settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Flujo de desarrollo

### 1. Estructura de ramas

```
main                 # Rama principal (producción)
├── develop         # Rama de desarrollo
├── feature/        # Nuevas funcionalidades
├── bugfix/         # Corrección de bugs
└── hotfix/         # Fixes urgentes
```

### 2. Convenciones de commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add correlation matrix visualization
fix: resolve file upload validation issue
docs: update component documentation
style: format code with prettier
refactor: reorganize utility functions
test: add unit tests for InsightCards
chore: update dependencies
```

### 3. Workflow típico

```bash
# 1. Crear rama feature
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y hacer commits
git add .
git commit -m "feat: implement nueva funcionalidad"

# 3. Pushear y crear PR
git push origin feature/nueva-funcionalidad

# 4. Review y merge
# (via GitHub/GitLab PR)
```

## Patrones de código

### 1. Componentes funcionales

```typescript
// ✅ Correcto
interface ComponentProps {
  data: DataType
  onAction?: (item: DataType) => void
  className?: string
}

export function MyComponent({ 
  data, 
  onAction, 
  className 
}: ComponentProps) {
  const [localState, setLocalState] = useState(false)
  
  const handleClick = useCallback(() => {
    onAction?.(data)
  }, [data, onAction])
  
  return (
    <div className={cn("base-styles", className)}>
      {/* JSX */}
    </div>
  )
}

// ❌ Evitar - componentes de clase
class MyComponent extends Component {
  // ...
}
```

### 2. Custom hooks

```typescript
// hooks/useFileUpload.ts
export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const uploadFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await analyzeFile(file)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    file,
    setFile,
    loading,
    error,
    uploadFile
  }
}
```

### 3. Manejo de estado

```typescript
// ✅ Estado local para UI
function ToggleComponent() {
  const [isOpen, setIsOpen] = useState(false)
  return <Collapsible open={isOpen} onOpenChange={setIsOpen} />
}

// ✅ Props para datos de negocio
function DataComponent({ data, onUpdate }: DataComponentProps) {
  const handleChange = (newData: DataType) => {
    onUpdate(newData) // Delegar al padre
  }
  
  return <DataEditor data={data} onChange={handleChange} />
}
```

### 4. Manejo de errores

```typescript
// Error boundaries
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => console.error('Component error:', error)}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Try-catch en async functions
async function handleAsyncOperation() {
  try {
    const result = await riskyOperation()
    return result
  } catch (error) {
    if (error instanceof ValidationError) {
      toast.error('Datos inválidos')
    } else if (error instanceof NetworkError) {
      toast.error('Error de conexión')
    } else {
      toast.error('Error inesperado')
    }
    throw error
  }
}
```

## Testing

### 1. Configuración de Jest

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 2. Testing de componentes

```typescript
// __tests__/components/InsightCards.test.tsx
import { render, screen } from '@testing-library/react'
import InsightCards from '@/components/InsightCards'

const mockInsights = [
  'Se analizaron 100 registros.',
  'Existe una fuerte correlación entre edad y salario (r = 0.85)'
]

describe('InsightCards', () => {
  it('renders all insights', () => {
    render(<InsightCards insights={mockInsights} />)
    
    mockInsights.forEach(insight => {
      expect(screen.getByText(insight)).toBeInTheDocument()
    })
  })
  
  it('shows correct icons for different insight types', () => {
    render(<InsightCards insights={mockInsights} />)
    
    // Verifica que se muestren iconos apropiados
    expect(screen.getByTestId('database-icon')).toBeInTheDocument()
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
  })
})
```

### 3. Testing de hooks

```typescript
// __tests__/hooks/useFileUpload.test.ts
import { renderHook, act } from '@testing-library/react'
import { useFileUpload } from '@/hooks/useFileUpload'

describe('useFileUpload', () => {
  it('handles file upload successfully', async () => {
    const { result } = renderHook(() => useFileUpload())
    
    const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
    
    await act(async () => {
      result.current.setFile(mockFile)
      await result.current.uploadFile(mockFile)
    })
    
    expect(result.current.file).toBe(mockFile)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })
})
```

### 4. Testing de integración

```typescript
// __tests__/integration/upload-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadData from '@/components/UploadData'

// Mock del API
jest.mock('@/lib/api', () => ({
  analyzeFile: jest.fn().mockResolvedValue({
    headers: ['col1', 'col2'],
    insights: ['Test insight']
  })
}))

describe('Upload Flow', () => {
  it('completes full upload and analysis', async () => {
    const user = userEvent.setup()
    render(<UploadData />)
    
    // Simular drag & drop
    const dropzone = screen.getByTestId('file-dropzone')
    const file = new File(['test,data'], 'test.csv', { type: 'text/csv' })
    
    await user.upload(dropzone, file)
    
    // Verificar análisis
    await waitFor(() => {
      expect(screen.getByText('Test insight')).toBeInTheDocument()
    })
  })
})
```

## Debugging

### 1. React Developer Tools

```typescript
// Nombrar componentes para debugging
export const ExpensiveComponent = memo(function ExpensiveComponent(props) {
  // ...
})

// Agregar displayName
ExpensiveComponent.displayName = 'ExpensiveComponent'
```

### 2. Console debugging

```typescript
// Debug condicional
const DEBUG = process.env.NODE_ENV === 'development'

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data)
  }
}

// Uso en componentes
function DataProcessor({ data }: { data: any }) {
  debugLog('Processing data', { dataLength: data.length })
  
  const processedData = useMemo(() => {
    const result = expensiveProcessing(data)
    debugLog('Processing complete', { resultLength: result.length })
    return result
  }, [data])
  
  return <div>{/* ... */}</div>
}
```

### 3. Error tracking

```typescript
// Sentry integration (ejemplo)
import * as Sentry from '@sentry/nextjs'

function ComponentWithErrorTracking() {
  const handleError = (error: Error) => {
    Sentry.captureException(error, {
      tags: {
        component: 'DataVisualization',
        action: 'file_processing'
      },
      extra: {
        fileSize: file?.size,
        fileName: file?.name
      }
    })
  }
  
  return <div>{/* ... */}</div>
}
```

## Performance

### 1. Bundle analysis

```bash
# Analizar bundle size
npm run build
npx @next/bundle-analyzer

# O con webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
```

### 2. Profiling de React

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react'

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log('Profiler:', {
    id,
    phase,
    actualDuration,
    baseDuration
  })
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MainComponent />
    </Profiler>
  )
}
```

### 3. Optimización de re-renders

```typescript
// Usar React.memo para componentes puros
const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  onClick
}: ComponentProps) {
  return <div>{/* Renderizado costoso */}</div>
})

// Custom comparison function
const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id
})
```

## Deployment

### 1. Build de producción

```bash
# Build local
npm run build
npm start

# Verificar build
npm run lint
npm run type-check
npm run test
npm run build
```

### 2. Variables de entorno

```bash
# .env.local (desarrollo)
NEXT_PUBLIC_API_URL=http://localhost:3000
ANALYZE_TIMEOUT=300000

# .env.production (producción)
NEXT_PUBLIC_API_URL=https://tu-dominio.com
ANALYZE_TIMEOUT=300000
```

### 3. Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```

## Troubleshooting común

### 1. Problemas de TypeScript

```bash
# Limpiar cache de TypeScript
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

### 2. Problemas de styled-components

```typescript
// next.config.ts
const config: NextConfig = {
  compiler: {
    styledComponents: true,
  },
}
```

### 3. Problemas de Tailwind

```bash
# Verificar configuración
npx tailwindcss -i ./src/app/globals.css -o ./output.css --watch

# Purge de clases no utilizadas
npm run build
```

### 4. Memory leaks

```typescript
// Cleanup en useEffect
useEffect(() => {
  const timer = setInterval(() => {
    // Logic
  }, 1000)
  
  return () => clearInterval(timer) // Cleanup
}, [])

// Cancelar requests
useEffect(() => {
  const controller = new AbortController()
  
  fetch('/api/data', {
    signal: controller.signal
  }).then(/* ... */)
  
  return () => controller.abort()
}, [])
```