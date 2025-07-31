# SmartData Analyzer 🚀

Una herramienta web moderna e intuitiva para el análisis automatizado de datos. Permite cargar, procesar y visualizar datasets en formato CSV y Excel con análisis estadístico avanzado, detección de outliers, clustering automático y generación de insights en lenguaje natural.

## 🎯 Características principales

### Análisis Automático Inteligente
- 🤖 **Generación de insights** descriptivos y correlacionales automáticos
- 📊 **Estadísticas descriptivas** completas (media, mediana, desviación, cuartiles)
- 📈 **Análisis de correlaciones** con detección de relaciones significativas

### Visualizaciones Interactivas
- 📉 **Histogramas dinámicos** para distribuciones de datos
- 🎯 **Boxplots** para identificación visual de outliers
- 🌐 **Matriz de correlación** con mapa de calor interactivo
- 🔍 **Gráficos de clusters** 2D/3D con centroides

### Detección Avanzada de Anomalías
- 🚨 **Outliers automáticos** usando Isolation Forest y método IQR
- 📋 **Tablas interactivas** de registros anómalos
- 🔬 **Análisis multivariado** de patrones atípicos

### Experiencia de Usuario Superior
- 🎨 **Interfaz moderna** con TailwindCSS y shadcn/ui
- 📱 **Diseño responsivo** para todos los dispositivos
- ⚡ **Carga drag & drop** de archivos
- 🔄 **Vista previa** instantánea de datos

## 🏗️ Arquitectura del proyecto

```
SmartData-Analyzer/
├── frontend/                 # Aplicación Next.js + React
│   ├── src/
│   │   ├── app/             # App Router (Next.js 14)
│   │   ├── components/      # Componentes React reutilizables
│   │   ├── layouts/         # Layouts compartidos
│   │   └── lib/            # Utilidades y configuración
│   └── docs/               # 📚 Documentación del frontend
│       ├── README.md       # Guía general del frontend
│       ├── components.md   # Documentación de componentes
│       ├── architecture.md # Arquitectura y patrones
│       └── development.md  # Guía de desarrollo
│
├── backend/                 # Motor de análisis Python
│   ├── analyze.py          # Script principal de análisis
│   └── docs/               # 📚 Documentación del backend
│       ├── README.md       # Guía general del backend
│       ├── api.md         # Documentación de la API
│       ├── algorithms.md  # Algoritmos y metodologías
│       ├── deployment.md  # Guía de despliegue
│       └── requirements.txt # Dependencias Python
│
└── README.md               # Este archivo - Vista general

## 🚀 Inicio rápido

### 1. Configuración inicial

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd SmartData-Analyzer

# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
pip install -r docs/requirements.txt
```

### 2. Ejecutar en desarrollo

```bash
# Desde la carpeta frontend
cd frontend
npm run dev
```

### 3. Acceder a la aplicación

Abre [http://localhost:3000](http://localhost:3000) en tu navegador y comienza a analizar tus datos.

## 📊 Stack tecnológico

### Frontend (Aplicación Web)
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Visualizaciones**: Recharts + Plotly.js
- **Componentes**: Radix UI primitives
- **Iconos**: Lucide React

### Backend (Motor de Análisis)
- **Lenguaje**: Python 3.10+
- **Análisis**: pandas, NumPy
- **Machine Learning**: scikit-learn
- **Clustering**: K-Means
- **Detección de outliers**: Isolation Forest
- **Manejo de archivos**: openpyxl

### Integración
- **API**: Next.js API Routes
- **Upload**: Busboy (multipart/form-data)
- **Comunicación**: Frontend ↔ Python via spawn

## 📂 Formatos soportados

| Formato | Extensiones | Codificación |
|---------|-------------|--------------|
| CSV | `.csv` | UTF-8, Latin-1 (auto-detección) |
| Excel | `.xlsx`, `.xls` | Nativo |

**Límites recomendados**:
- Tamaño máximo: 100MB
- Filas: hasta 1M registros
- Columnas: hasta 1000 variables

## 🔧 Requisitos del sistema

### Desarrollo
- **Node.js** 18.0+
- **Python** 3.10+
- **npm** o **yarn**
- **Git**

### Producción
- **Servidor Node.js** con soporte para spawn de procesos Python
- **Python runtime** con librerías científicas instaladas
- Al menos **4GB RAM** para datasets grandes
- **Espacio temporal** para procesamiento de archivos

## 📚 Documentación detallada

### Para desarrolladores frontend
- [📖 Frontend Overview](frontend/docs/README.md) - Guía general y setup
- [🧩 Componentes](frontend/docs/components.md) - Documentación de cada componente
- [🏛️ Arquitectura](frontend/docs/architecture.md) - Patrones y estructura
- [⚒️ Desarrollo](frontend/docs/development.md) - Workflow y debugging

### Para desarrolladores backend
- [📖 Backend Overview](backend/docs/README.md) - Configuración y uso
- [🔌 API Reference](backend/docs/api.md) - Endpoints y respuestas
- [🧮 Algoritmos](backend/docs/algorithms.md) - Métodos estadísticos
- [🚀 Deployment](backend/docs/deployment.md) - Guía de despliegue

## 🧪 Análisis implementados

| Análisis | Algoritmo | Propósito |
|----------|-----------|-----------|
| **Estadísticas descriptivas** | pandas.describe() | Media, mediana, desviación, cuartiles |
| **Detección outliers (IQR)** | Q1 - 1.5×IQR, Q3 + 1.5×IQR | Valores fuera del rango normal |
| **Detección outliers (ML)** | Isolation Forest | Anomalías multivariadas |
| **Correlaciones** | Pearson correlation | Relaciones lineales entre variables |
| **Clustering** | K-Means (k=3) | Agrupación automática de registros |
| **Histogramas** | numpy.histogram | Distribución de frecuencias |

## 🎯 Casos de uso

- **Análisis exploratorio** de datasets desconocidos
- **Limpieza de datos** mediante detección de outliers
- **Investigación académica** con análisis estadístico automático
- **Business Intelligence** para insights rápidos
- **Data Science** como herramienta de primera exploración

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**¿Necesitas ayuda?** Revisa la [documentación completa](frontend/docs/README.md) o abre un [issue](../../issues) en GitHub.
