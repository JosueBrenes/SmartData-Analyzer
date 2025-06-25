# SmartData Analyzer

SmartData Analyzer es una herramienta web interactiva para la carga, análisis y visualización automatizada de datasets en formato **CSV** o **XLSX**. Su objetivo es simplificar el proceso de exploración de datos, permitiendo obtener insights estadísticos, detectar valores atípicos y visualizar correlaciones y clusters sin necesidad de programación.

## ✨ Características

- 🤖 **Análisis automático con IA**: genera insights descriptivos y correlacionales en lenguaje natural.
- 📊 **Estadísticas descriptivas** por variable (media, mediana, desviación, rango, etc.)
- 📉 **Histogramas y boxplots** para explorar la distribución de los datos
- 🧮 **Matriz de correlación** con detección automática de relaciones fuertes
- 🧠 **Clustering automático** usando KMeans
- 🚨 **Detección de outliers** con Isolation Forest
- 🧵 Interfaz moderna con TailwindCSS, Radix UI y Recharts
- 🔎 **Vista previa de datos** y navegación por pestañas

## 🧱 Estructura del Proyecto

- `frontend/`: Interfaz desarrollada con **Next.js**, **TypeScript** y componentes reutilizables.
- `backend/`: Script de análisis en **Python** con librerías como `pandas`, `scikit-learn`, y `numpy`.

> ℹ️ Para ver cómo configurar y usar el backend manualmente, revisa el archivo [`backend/docs/backend_setup.md`](backend/docs/backend_setup.md)

- API `POST /api/analyze`: Procesa los archivos enviados, ejecuta el análisis en Python y devuelve los resultados estructurados.

## 🚀 Uso Local

1. Instala dependencias del frontend:

   ```bash
   npm install
   ```

2. Asegúrate de tener Python instalado y las dependencias necesarias en `backend/`:

   ```bash
   pip install -r backend/docs/requirements.txt
   ```

3. Ejecuta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Formatos Soportados

- `.csv` codificados en UTF-8 o Latin-1
- `.xlsx` o `.xls` (requiere tener `openpyxl` instalado)

## 🔧 Requisitos

- Node.js 18+
- Python 3.10+
- Paquetes de Python necesarios:
  - `pandas`
  - `numpy`
  - `scikit-learn`
  - `openpyxl`

## 🧪 Análisis Hecho con

- `pandas`: limpieza y estadística descriptiva
- `scikit-learn`: clustering y outlier detection
- `numpy`: histogramas e IQR
- `busboy`: manejo de uploads en Node.js

## 📦 Tecnologías Usadas

- Frontend: **Next.js**, **TailwindCSS**, **Radix UI**, **Recharts**, **Lucide**, **XLSX.js**
- Backend: **Python**, **scikit-learn**, **pandas**

---
